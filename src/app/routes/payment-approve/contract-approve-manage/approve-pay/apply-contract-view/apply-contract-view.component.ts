import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { FormBuilder, FormControl } from '@angular/forms';
import { SettingsService } from '@delon/theme';

// html ===> pdf
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-apply-contract-view',
  templateUrl: './apply-contract-view.component.html',
  styles: [`
    #print-box {
      max-width: 1000px;
    }
  `]
})
export class ApplyContractViewComponent implements OnInit {
  listOfData:any[] = [];

  costlist:any[] = []; // 所有成本数据 

  projectInfo:any = null;
  projectId:number = null;

  contract_pay_id:number = null;

  contractInfo:any = null;  // 合同信息
  contract_id:number = null; //  选择的合同id
  selectedContract:any = null;
  contractList:any[] = [];

  costTotalPay:number = 0;
  payPercent:string = '0%';

  constructor(
    public msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    private settings: SettingsService
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getContractList();
        this.getProjectInfo();
      }
    });
    // 如果有 contract_pay_id 参数， 则表示为编辑 合约支付
    this.activatedRoute.queryParams.subscribe(params=> {
      if(params && params['contract_pay_id']) {
        this.contract_pay_id = +(params['contract_pay_id']);
        this.getContractPayment();
      }
    })

  }
  submitLoading: boolean = false;


  ngOnInit() {
  }

  getContractList():void { // 通过项目获取合约
    this.settingsConfigService.get(`/api/deal/project/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.contractList = res.data.deal;
        console.log(this.contractList, 'contractList ');
        this.getContractPayDetail();
      }
    })
  }
  
  getContractPayDetail():void {
    this.settingsConfigService.get(`/api/contract/pay/detail/${this.contract_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '合约支付信息');
          if(res.code === 200) {
            this.contractInfo = res.data;
            this.contract_id = res.data.deal.contract.id;
            [this.selectedContract] = this.contractList.filter( v => v.contract.id === this.contract_id);
            console.log('selectedContract', this.selectedContract)
            if(!res.data.draft) { // 非草稿时 获取流程
              this.getWorkflow();
            }
          }
        })
  }
  getContractPayment() {
    this.settingsConfigService.get(`/api/contract/payment/${this.contract_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '合约支付详情列表');
          if(res.code === 200) {
            const contractPayment:any[] = res.data.contract_payment;
            this.listOfData = contractPayment;
            this.countTotal();
          }
        })
  }
  countTotal() {
    this.costTotalPay = this.listOfData.reduce((currentTotal:number, item:any) => {
      return item.amount + currentTotal;
    }, 0);
  }
  countPercent(total:number):string {
    const payTotal = this.listOfData.reduce((currentTotal:number, item:any) => {
      return item.cost.pay_amount + currentTotal;
    }, 0);
    const payPercent = ((payTotal / total) * 100).toFixed(2) + '%';
    return payPercent;

  }

  getProjectInfo() { // 项目基础信息
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectInfo = res.data;
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

  getWorkflow() {
    this.settingsConfigService
        .get(`/api/contract/pay/process/${this.contract_pay_id}`)
        .subscribe((res:ApiData) => {
          // console.log(res, 'workflow');
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
          // console.log(res, 'node_process');
          if(res.code === 200) {
            this.nodeProcess = res.data.node_process;
            this.currentNodeProcess = this.nodeProcess.filter( v => v.current)[0];
            // console.log(this.currentNodeProcess, this.isCurrentCheck, this.settings.user);
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
    // console.log(this.checkOption, 'agree info submit!');
    const obj:any = {
      ...this.checkOption,
      node_process_id: this.currentNodeProcess.id
    }
    this.settingsConfigService
        .post(`/api/pay/node_process/approval`, obj)
        .subscribe((res:ApiData) => {
          // console.log(res, 'approval');
          if(res.code === 200) {
           this.msg.success('审核提交成功');
           this.settingsConfigService.resetGlobalTasks();
           this.getWorkflow();
          }
    })
  }
  cancel() {}
  
  executeChange(data: any) {
    console.log('执行情况信息 提交: ', data);
    const option: any = Object.assign(data, { process_id: this.progressInfo.id });
    this.settingsConfigService.post('/api/contract/pay/execute', option).subscribe((res: ApiData) => {
      console.log(res, '执行情况确认');
      if (res.code === 200) {
        this.msg.success('执行情况更新成功');
        this.settingsConfigService
          .get(`/api/contract/pay/process/${this.contract_pay_id}`)
          .subscribe((res: ApiData) => {
            if (res.code === 200) {
              this.progressInfo = res.data;
            }
          })
      }
    })
  }
  // 打印
  printCurrentModal(idname: string, title: string) {
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
        console.log(canvas, imgWidth, imgHeight);
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
  pdfPosition: number = 0;
  exportPdf(contentDataURL: any, imgWidth: number, imgHeight: number, pageHeight: number, leftHeight: number) {
    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
    if (leftHeight + 10 < pageHeight) {
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      while (leftHeight > 0) {
        pdf.addImage(contentDataURL, 'PNG', 0, this.pdfPosition, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        this.pdfPosition -= 295;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage()
        }
      }
    }

    const pdf_name: string = this.projectInfo.name + "_" + (new Date().getTime()) + '.pdf';
    pdf.save(pdf_name); // Generated PDF 
  }
  // 图片和 pdf 下载 功能
  exportImage(contentDataURL: any) {
    var base64Img = contentDataURL;
    let oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.projectInfo.name + "_" + (new Date().getTime());
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }
}
