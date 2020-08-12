import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

// html ===> pdf
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-adjust-view-c',
  templateUrl: './adjust-view-c.component.html',
  styleUrls: ['./adjust-view-c.component.less']
})
export class AdjustViewCComponent implements OnInit {

  projectInfo: any;

  adjustInfo: any = null;
  loadingData: boolean = true;

  id: number;
  project_name: string;

  adjustment_category: string[] = [];

  logList: any[] = []; // 调整日志

  constructor(
    public notice: NzNotificationService,
    private router: Router,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute
  ) {

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.id = +params['id'];
        this.getDataInfo();
      }
    })
  }

  ngOnInit(): void {
  }

  // 提交当前调整项目
  submitProject(): void {
    this.settingsConfigService
        .post('/api/adjustment/submit', { adjustment_id: this.adjustInfo.id })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('调整项目已提交');
            this.router.navigateByUrl('/adjust/myAdjust');
          }else {
            this.msg.error(res.error || '提交失败，请重试');
          }
    })
  }

  getDataInfo(): void {
    this.settingsConfigService.get(`/api/project/detail/${this.id}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.projectInfo = res.data;
        this.project_name = this.showAdjustmentCategory('项目信息调整') ? this.adjustInfo.info_adjustment.name : this.projectInfo.name;
      }
    })


    this.loadingData = true;
    this.settingsConfigService.get(`/api/adjustment/${this.id}`).subscribe((res: ApiData) => {
      this.loadingData = false;
      if (res.code === 200) {
        this.adjustInfo = res.data;
        const category: List[] = this.adjustInfo.category.adjustment_category;
        this.adjustment_category = category.map(v => v.name);
        if(!this.adjustInfo.draft) { // 非草稿时 获取流程  获取项目操作日志
          this.getWorkflow();
        }
      }
    });

    this.getLogs();
  }

  getLogs(): void {
    this.settingsConfigService.get(`/api/project/log/${this.id}`).subscribe((res: ApiData) => {
      console.log('log ....', res.data);
      if (res.code === 200) {
        this.logList = res.data.project_log;
      } else {
        this.logList = [];
      }
    })
  }

  cancel(): void { }

  showAdjustmentCategory(category: string): boolean {
    return this.adjustment_category.includes(category);
  }

  // 打印  print current page
  printCurrentModal(idname: string) {
    let printWindow = window.open();

    html2canvas(document.querySelector(`#${idname}`)).then(canvas => {
      let compress = document.createElement('canvas');

      // change the image size

      compress.width = canvas.width;

      compress.height = canvas.height;

      const imageStr = canvas.toDataURL("image/png");

      let image = new Image();

      image.src = imageStr;

      image.onload = function () {

        compress.getContext("2d").drawImage(image, 0, 0, compress.width, compress.height);

        const imgString = compress.toDataURL("image/png");

        // const iframe = '<iframe src="' + imageStr + '" frameborder="0" style="border:0;" allowfullscreen></iframe>'
        const head: string = document.querySelector('head').innerHTML;;
        const style: string = `<style>body {-webkit-print-color-adjust: exact; padding: 12px!important;}</style>`;
        const div: string = '<div>' + '<img src="' + imgString + '" />' + '</div>';

        const docStr = head + style + div;

        printWindow.document.write(docStr);

        printWindow.document.close();

        printWindow.onload = function () {

          printWindow.print();
          printWindow.close();

        };

      }

    });
  }

  isPrinter: boolean = false;
  // pdf
  downloadFile(type: string) {
    this.isPrinter = true;
    setTimeout(() => {
      const data: any = document.getElementById('print-box');
      html2canvas(data).then(canvas => {
        this.isPrinter = false;
        // Few necessary setting options  
        const imgWidth: number = 208;
        const imgHeight: number = canvas.height * imgWidth / canvas.width;
        const pageHeight: number = 295;
        const leftHeight: number = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png', 1.0)
        if (type === 'pdf') {
          this.exportPdf(contentDataURL, imgWidth, imgHeight, pageHeight, leftHeight);
        }
        if (type === 'image') {
          this.exportImage(contentDataURL);
        }
      });
    }, 500);

  }

  exportPdf(contentDataURL: any, imgWidth: number, imgHeight: number, pageHeight: number, leftHeight: number) {
    //页面偏移
    let position = 0;

    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
    if (leftHeight + 10 < pageHeight) {
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      while (leftHeight > 0) {
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= 295;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage()
        }
      }
    }

    const pdf_name: string = this.project_name + "_" + (new Date().getTime()) + '.pdf';
    pdf.save(pdf_name); // Generated PDF 
  }
  // TODO: 图片和 pdf 下载 功能
  exportImage(contentDataURL: any) {
    var base64Img = contentDataURL;
    let oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.project_name + "_" + (new Date().getTime());
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }


  // 流程进程信息
  progressInfo: any = null;
  nodeProcess: any[] = [];
  currentNodeProcess: any = null;
  isCurrentCheck: boolean = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  getWorkflow() {
    this.settingsConfigService
      .get(`/api/adjustment/process/${this.adjustInfo.id}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'workflow');
        if (res.code === 200) {
          this.progressInfo = res.data;
          this.getNodeProcess();
        }
      })
  }

  getNodeProcess(): void {
    this.isCurrentCheck = false;
    this.settingsConfigService
      .get(`/api/node/process/${this.progressInfo.id}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'node_process');
        if (res.code === 200) {
          this.nodeProcess = res.data.node_process;
          this.currentNodeProcess = this.nodeProcess.filter(v => v.current)[0];
          console.log(this.currentNodeProcess, this.isCurrentCheck, this.settings.user);
          if (this.currentNodeProcess) {
            this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
          }
        }else {
          this.nodeProcess = [];
        }
      })
  }

  submitCheckCurrentProcess() {
    if (this.checkOption.agree === null) {
      this.notice.error('错误', '是否通过未选择');
      return;
    }
    console.log(this.checkOption, 'agree info submit!');
    const obj: any = {
      ...this.checkOption,
      node_process_id: this.currentNodeProcess.id
    }
    this.settingsConfigService
      .post(`/api/adjustment_node_process/approval`, obj)
      .subscribe((res: ApiData) => {
        console.log(res, 'approval');
        if (res.code === 200) {
          this.msg.success('审核提交成功');
          this.getWorkflow();
          // 刷新任务栏  日志信息
          this.settingsConfigService.resetGlobalTasks();
          this.getLogs();
        }
      })
  }

}
