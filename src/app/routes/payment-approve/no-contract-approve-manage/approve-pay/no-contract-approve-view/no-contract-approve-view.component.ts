import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsService } from '@delon/theme';

// html ===> pdf
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-no-contract-approve-view',
  templateUrl: './no-contract-approve-view.component.html',
  styles: [`
    #print-box {
      max-width: 1000px;
    }
  `]
})
export class NoContractApproveViewComponent implements OnInit {

  constructor(
    public msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    private settings: SettingsService
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params.id) {
        this.projectId = +params.id;
        this.getProjectInfo(); // 项目信息
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.treaty_pay_id) {
        this.treaty_pay_id = +(params.treaty_pay_id);
        this.getTreatyPayDetail();
        this.getWorkflow();
      }
    })

  }
  listOfData: any[] = [];

  projectInfo: any = null;
  projectId: number = null;

  treaty_pay_id: number = null;
  treatypayInfo: any = null;
  treaty_id: number = null;

  // 流程进程信息
  progressInfo: any = null;
  nodeProcess: any[] = [];
  currentNodeProcess: any = null;
  isCurrentCheck = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  approveFlag: boolean;

  isPrinter = false;
  pdfPosition = 0;

  ngOnInit() { }

  getTreatyPayDetail(): void {
    this.settingsConfigService.get(`/api/treaty/pay/detail/${this.treaty_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '非合约支付信息1111');
        if (res.code === 200) {
          this.treaty_id = res.data.id;
          this.treatypayInfo = res.data;
          this.getTreatyPayment();
        }
      })
  }

  getTreatyPayment() {
    this.settingsConfigService.get(`/api/treaty/payment/${this.treaty_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '非合约支付详情列表2222');
        if (res.code === 200) {
          const treatyPayment: any[] = res.data.treaty_payment;
          this.listOfData = treatyPayment;
        }
      })
  }

  getProjectInfo() { // 项目基础信息
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.projectInfo = res.data;
      }
    })
  }

  cancel(): void { }

  getWorkflow() {
    this.settingsConfigService
      .get(`/api/treaty/pay/process/${this.treaty_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'workflow');
        if (res.code === 200) {
          this.progressInfo = res.data;
          this.approveFlag = res.data.finished;
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
      .post(`/api/pay/node_process/approval`, obj)
      .subscribe((res: ApiData) => {
        console.log(res, 'approval');
        if (res.code === 200) {
          this.msg.success('审核提交成功');
          this.settingsConfigService.resetGlobalTasks();
          this.getWorkflow();
        }
      })
  }

  executeChange(data: any) {
    console.log('执行情况信息 提交: ', data);
    const option: any = { ...data, process_id: this.progressInfo.id };
    this.settingsConfigService.post('/api/treaty/pay/execute', option).subscribe((res: ApiData) => {
      console.log(res, '执行情况确认');
      if (res.code === 200) {
        this.msg.success('执行情况更新成功');
        this.settingsConfigService
          .get(`/api/treaty/pay/process/${this.treaty_pay_id}`)
          .subscribe((res: ApiData) => {
            if (res.code === 200) {
              this.progressInfo = res.data;
              location.reload();
            }
          })
      }
    })
  }

  // 打印
  printCurrentModal(idname: string, title: string) {
    const printWindow = window.open();

    html2canvas(document.querySelector(`#${idname}`)).then(canvas => {
      const compress = document.createElement('canvas');

      // change the image size

      compress.width = canvas.width;

      compress.height = canvas.height;

      const imageStr = canvas.toDataURL("image/png");

      const image = new Image();

      image.src = imageStr;

      image.onload = function () {

        compress.getContext("2d").drawImage(image, 0, 0, compress.width, compress.height);

        const imgString = compress.toDataURL("image/png");

        // const iframe = '<iframe src="' + imageStr + '" frameborder="0" style="border:0;" allowfullscreen></iframe>'
        const head: string = document.querySelector('head').innerHTML;;
        const style = `<style>body {-webkit-print-color-adjust: exact; padding: 12px!important;}</style>`;
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
  // pdf
  downloadFile(type: string) {
    this.isPrinter = true;
    setTimeout(() => {
      const data: any = document.getElementById('print-box');
      html2canvas(data).then(canvas => {
        this.isPrinter = false;
        // Few necessary setting options  
        const imgWidth = 208;
        const imgHeight: number = canvas.height * imgWidth / canvas.width;
        console.log(canvas, imgWidth, imgHeight);
        const pageHeight = 295;
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
    const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
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
    const base64Img = contentDataURL;
    const oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.projectInfo.name + "_" + (new Date().getTime());
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }

  refreshPage() {
    this.getTreatyPayDetail();
  }
}
