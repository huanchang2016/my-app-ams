import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { _HttpClient, SettingsService } from '@delon/theme';
import { SettingsConfigService } from '../../service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';

// html ===> pdf
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.less']
})
export class ProjectViewComponent implements OnInit {
  projectId:number = null;
  project:any = {
    info: null,
    budget: null,
    supplier: []
  };

  showExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示
  

  constructor(
    public msg: NzMessageService,
    public notice: NzNotificationService,
    private settings: SettingsService,
    private settingsConfigService: SettingsConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getDataInfo(params['id']);
      }
    })
  }

  ngOnInit() {

  }

  // 打印
  printCurrentModal(idname:string) {
    let newWindow=window.open("打印窗口","_blank");
    let obj = document.querySelector('#' + idname);
    console.log(obj);
    let head = document.querySelector('head').innerHTML;
    let style = `<style>body {-webkit-print-color-adjust: exact;}</style>`;
    
    let docStr = head + style + obj.innerHTML;
    newWindow.document.write(docStr);
    newWindow.document.close();
  
    setTimeout(() => {
      newWindow.print();
      newWindow.close();
    }, 300);
  }

  isPrinter:boolean = false;
  // pdf
  downloadFile(type:string) {
    this.isPrinter = true;
    setTimeout(() => {
      const data:any = document.getElementById('print-box');
      html2canvas(data).then(canvas => {
        this.isPrinter = false;
        // Few necessary setting options  
        const imgWidth:number = 208;   
        const pageHeight:number = 295;    
        const imgHeight:number = canvas.height * imgWidth / canvas.width;  
        const heightLeft:number = imgHeight;  
    
        const contentDataURL = canvas.toDataURL('image/png')
        if(type === 'pdf') {
          this.exportPdf(contentDataURL, imgWidth, imgHeight);
        }
        if(type === 'image') {
          this.exportImage(contentDataURL, imgWidth, imgHeight)
        }
        
      });
    }, 500);
    
  }
  exportPdf(contentDataURL:any, imgWidth:number, imgHeight:number) {
    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
    const position:number = 0;
    pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
    const pdf_name:string = this.project.info.name + "_" + (new Date().getTime()) + '.pdf';
    pdf.save(pdf_name); // Generated PDF  
  }
  // TODO: 图片和 pdf 下载 功能
  exportImage(contentDataURL:any, imgWidth:number, imgHeight:number) {
      var base64Img = contentDataURL;
      let oA:any = document.createElement('a');
      oA.href = base64Img;
      oA.download = this.project.info.name + "_" + (new Date().getTime());
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      oA.dispatchEvent(event);
  }


  getDataInfo(id:number):void {
    this.settingsConfigService.get(`/api/project/detail/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.project['info'] = res.data;
        this.getBudgetInfo(this.project.info.id);
        this.getSupplierInfo(this.project.info.id);
        if(!res.data.draft) { // 非草稿时 获取流程
          this.getWorkflow(res.data.id);
        }
      }
    })
  }

  getBudgetInfo(proId:number):void {
    this.settingsConfigService.get(`/api/budget/project/${proId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const budget:any = res.data;
        this.settingsConfigService.get(`/api/cost/budget/${res.data.id}`).subscribe((costRes:ApiData) => {
          if(costRes.code === 200) {
            this.project.budget = Object.assign(budget, { cost: costRes.data.cost });
            console.log(this.project);
          }
        })
      }
    })
  }
  
  getSupplierInfo(proId:number):void {

    this.settingsConfigService.get(`/api/supplier/project/${proId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.project.supplier = res.data.supplier;
        // 是否默认展示供应商下 合约列表数据
        this.project.supplier.forEach(item => (this.showExpand[item.id] = true));
      }
    })
  }

  showContract(id:number):void { // 切换供应商合约展示 与否 ？
    this.showExpand[id] = !this.showExpand[id];
  }

  cancel(): void {}

  submitProject(): void {
    this.settingsConfigService
        .post('/api/project/submit', { project_id: this.projectId })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('项目已提交');
            this.router.navigateByUrl('/project/my/progress');
          }else {
            this.msg.error(res.error || '提交失败，请重试');
          }
    })
  }

  // 流程进程信息
  progressInfo:any = null;
  nodeProcess:any[] = [];
  currentNodeProcess:any = null;
  isCurrentCheck:boolean = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  getWorkflow(id:number) {
    this.settingsConfigService
        .get(`/api/process/submit/${id}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'workflow');
          if(res.code === 200) {
            this.progressInfo = res.data;
            this.getNodeProcess();
          }
    })
  }

  getNodeProcess():void {
    this.isCurrentCheck = false;
    this.settingsConfigService
        .get(`/api/node/process/${this.progressInfo.id}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'node_process');
          if(res.code === 200) {
            this.nodeProcess = res.data.node_process;
            this.currentNodeProcess = this.nodeProcess.filter( v => v.current)[0];
            console.log(this.currentNodeProcess, this.isCurrentCheck, this.settings.user);
            if(this.currentNodeProcess) {
              this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
            }
          }
    })
  }

  submitCheckCurrentProcess() {
    if(this.checkOption.agree === null) {
      this.notice.error('错误', '是否通过未选择');
      return;
    }
    console.log(this.checkOption, 'agree info submit!');
    const obj:any = {
      ...this.checkOption,
      node_process_id: this.currentNodeProcess.id
    }
    this.settingsConfigService
        .post(`/api/node/process/submit/approval`, obj)
        .subscribe((res:ApiData) => {
          console.log(res, 'approval');
          if(res.code === 200) {
           this.msg.success('审核提交成功');
           this.getWorkflow(this.projectId);
          }
    })
  }

  // 避免精度丢失
  countPercent(num:number, x:number): number {
    return Math.round(num * x);
  }

}
