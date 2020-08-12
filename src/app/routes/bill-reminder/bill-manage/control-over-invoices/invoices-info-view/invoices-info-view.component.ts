import { Component, OnInit } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';

// html ===> pdf
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-bill-reminder-invoices-info-view',
  templateUrl: './invoices-info-view.component.html',
  styles: [`
    .bill-info-box {
      max-width: 800px;
    }
    .border-top {
      border-top: 1px solid #e8e8e8;
    }
    .border-right {
      border-right: 1px solid #e8e8e8;
    }
    .td-left {
      min-width: 120px;
    }
    :host ::ng-deep .bill-category-box span {
      color: #595959 !important;
    }
    :host ::ng-deep .bill-category-box .ant-checkbox-checked {
      color: #1890ff !important;
    }
    :host ::ng-deep .bill-category-box .ant-checkbox-checked .ant-checkbox-inner {
      background-color: #1890ff !important;
    }
    :host ::ng-deep .bill-category-box .ant-checkbox-checked .ant-checkbox-inner::after {
      border-color: #f5f5f5 !important;
    }
    :host ::ng-deep .income-show-box>.sv__detail
    {
      display: block;
    }
    
    @media (max-width: 575px) {
      :host ::ng-deep .bill-info {
        border: 0;
      }
      :host ::ng-deep .bill-info .ant-card-body {
        padding: 0!important;
      }
      
      .bill-info  .td-left {
            min-width: 80px;
      }

    }
  `]
})
export class BillReminderInvoicesInfoViewComponent implements OnInit {

  constructor(
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    public msg: NzMessageService,
    private settings: SettingsService
  ) {
    // console.log('发票开具   详情查看')
    this.projectId = +this.activatedRoute.snapshot.queryParams.project_id;
    this.status = this.activatedRoute.snapshot.queryParams.status;
    if (this.projectId) {
      this.getConfig();
      this.getProjectLog(this.projectId);
    }
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params.id) {
        this.billId = +params.id;
        // console.log(this.billId, 'billId');
        this.getBillInfo();
        this.getWorkflow();
        this.getAbandonedProcess();
        this.getRedPunchProcess();
      }
    })
  }
  // 从发票列表中拿到的当前发票的状态
  status: any = null;

  projectId: number = null;
  projectDetailInfo: any = null;
  projectUserName: any = null;
  billId: number = null;
  billInfo: any = null;

  billCategoryArray: any[] = [];

  // 流程进程信息
  progressInfo: any = null;
  nodeProcess: any[] = [];
  currentNodeProcess: any = null;
  isCurrentCheck = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  isPrinter = false;
  pdfPosition = 0;

  localstorageUser: any = null;

  executeName: any = null;

  bill_id: any = null;

  // 废弃流程
  abandonedInfo: any = null;

  abandonedNodeProcess: any = null;

  isApprovelShow = false;

  currentabandonedNodeProcess: any = null;
  // 红冲流程
  redPunchInfo: any = null;

  redPunchNodeProcess: any = null;

  isRedApprove = false;

  currentRedpunchNodeProcess: any = null;

  // 日志
  logs: any[] = [];


  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    this.localstorageUser = user;
  }

  // 日志
  getProjectLog(id: number): void {
    this.settingsConfigService.get(`/api/project/log/${id}`).subscribe((res: ApiData) => {
      console.log('log ....', res.data);
      // this.logLoading = false;
      if (res.code === 200) {
        this.logs = res.data.project_log;
      } else {
        this.logs = [];
      }
    })
  }

  // 废弃提交
  abandonedBill(): void {
    this.settingsConfigService
      .post(`/api/abandoned_bill/submit`, { bill_id: this.billId })
      .subscribe((res: ApiData) => {
        console.log(res, 'abandonedBill');
        if (res.code === 200) {
          this.msg.success('废弃成功');
          this.settingsConfigService.resetGlobalTasks();
          this.getAbandonedProcess();
        }
      })
  }

  // 红冲提交
  redPunch(): void {
    this.settingsConfigService
      .post(`/api/red_punch_bill/submit`, { bill_id: this.billId })
      .subscribe((res: ApiData) => {
        console.log(res, 'redPunch');
        if (res.code === 200) {
          this.msg.success('红冲成功');
          this.settingsConfigService.resetGlobalTasks();
          this.getRedPunchProcess();
        }
      })
  }

  getExecuteName(event): void {
    this.executeName = event;
    console.log(this.executeName, 'executeName');
  }

  readOuter() {
    this.getBillInfo();
  }

  getBillInfo(): void {
    this.settingsConfigService.get(`/api/bill/${this.billId}`).subscribe((res: ApiData) => {
      console.log('billInfo, ', res.data);
      if (res.code === 200) {
        this.billInfo = res.data;
      }
    });

  }

  getConfig() {
    // 获取客户单位 信息详情
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res: ApiData) => {
      console.log('projectDetailInfo, ', res.data);
      if (res.code === 200) {
        this.projectDetailInfo = res.data;
        this.projectUserName = this.projectDetailInfo.user.name;
        // 发票的服务名称和项目是创建时已经绑定好了的，所以同一项目下的发票 服务名称不可改变
        // this.getSubTaxFees(this.projectDetailInfo.budget.tax.id); // TODO: 
      }
    });
    // 获取开票类型
    this.settingsConfigService.get(`/api/bill/category/all`).subscribe((res: ApiData) => {
      // console.log('bill/category, ', res.data);
      if (res.code === 200) {
        this.billCategoryArray = res.data.bill_category;
      }
    })
  }

  getWorkflow() {
    this.settingsConfigService
      .get(`/api/bill/process/${this.billId}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'workflow bill info');
        if (res.code === 200) {
          this.progressInfo = res.data;
          if (this.progressInfo) {
            this.getNodeProcess();
          }
        }
      })
  }

  getNodeProcess(): void {
    this.isCurrentCheck = false;
    this.settingsConfigService
      .get(`/api/node/process/${this.progressInfo.id}`)
      .subscribe((res: ApiData) => {
        // console.log(res, 'node_process');
        if (res.code === 200) {
          this.nodeProcess = res.data.node_process;
          this.currentNodeProcess = this.nodeProcess.filter(v => v.current)[0];
          // console.log(this.currentNodeProcess, this.isCurrentCheck, this.settings.user);
          if (this.currentNodeProcess) {
            this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
          }
        }
      })
  }

  // 获取废弃节点信息
  getAbandonedProcess() {
    this.settingsConfigService
      .get(`/api/abandoned_bill/process/${this.billId}`)
      .subscribe((res: ApiData) => {
        console.log(res.data.process, 'getAbandonedProcess res');
        if (res.code === 200) {
          this.abandonedInfo = res.data.process;
          console.log(this.abandonedInfo, 'abandonedInfo');
          if (this.abandonedInfo) {
            this.getAbandonedNodeProcess(res.data.process);
          }
        }
      })
  }

  // 获取废弃子节点信息
  getAbandonedNodeProcess(data) {
    this.isApprovelShow = false;
    for (const item of data) {

      this.settingsConfigService
        .get(`/api/node/process/${item.id}`)
        .subscribe((res: ApiData) => {
          console.log(res, 'getAbandonedNodeProcess');
          if (res.code === 200) {
            this.abandonedNodeProcess = res.data.node_process;
            this.currentabandonedNodeProcess = this.abandonedNodeProcess.filter(v => v.current)[0];
            if (this.currentabandonedNodeProcess) {
              this.isApprovelShow = this.currentabandonedNodeProcess.user.id === this.settings.user.id;
            }
          }
        })
    }
  }

  // 获取红冲节点信息
  getRedPunchProcess() {
    this.settingsConfigService
      .get(`/api/red_punch/process/${this.billId}`)
      .subscribe((res: ApiData) => {
        console.log(res.data.process, 'getRedPunchProcess res');
        if (res.code === 200) {
          this.redPunchInfo = res.data.process;
          console.log(this.redPunchInfo, 'redPunchInfo');
          if (this.redPunchInfo) {
            this.getRedPunchNodeProcess(res.data.process);
          }
        }
      })
  }

  // 获取红冲子节点信息
  getRedPunchNodeProcess(data) {
    this.isRedApprove = false;
    this.isApprovelShow = false;
    for (const item of data) {

      this.settingsConfigService
        .get(`/api/node/process/${item.id}`)
        .subscribe((res: ApiData) => {
          console.log(res, 'getRedPunchNodeProcess');
          if (res.code === 200) {
            this.redPunchNodeProcess = res.data.node_process;
            this.currentRedpunchNodeProcess = this.redPunchNodeProcess.filter(v => v.current)[0];
            if (this.currentRedpunchNodeProcess) {
              console.log(this.currentRedpunchNodeProcess, 'currentRedpunchNodeProcess');
              console.log(this.settings, 'setting');
              this.isRedApprove = this.currentRedpunchNodeProcess.user.id === this.settings.user.id;
            }
          }
        })
    }
  }



  submitCheckCurrentProcess() {
    if (this.checkOption.agree === null) {
      this.notice.error('错误', '是否通过未选择');
      return;
    }
    // console.log(this.checkOption, 'agree info submit!');
    const obj: any = {
      ...this.checkOption,
      node_process_id: this.currentNodeProcess.id
    }
    this.settingsConfigService
      .post(`/api/bill/approval`, obj)
      .subscribe((res: ApiData) => {
        // console.log(res, 'approval');
        if (res.code === 200) {
          this.msg.success('审核提交成功');
          this.settingsConfigService.resetGlobalTasks();
          this.getWorkflow();
        }
      })
  }

  agreeAbandoned() {
    if (this.checkOption.agree === null) {
      this.notice.error('错误', '是否通过未选择');
      return;
    }
    // console.log(this.checkOption, 'agree info submit!');
    const obj: any = {
      ...this.checkOption,
      node_process_id: this.currentabandonedNodeProcess.id
    }
    this.settingsConfigService
      .post(`/api/abandoned_bill/approval`, obj)
      .subscribe((res: ApiData) => {
        // console.log(res, 'approval');
        if (res.code === 200) {
          this.msg.success('废弃审核提交成功');
          this.settingsConfigService.resetGlobalTasks();
          this.getAbandonedProcess();
        }
      })
  }

  agreeRedpunch() {
    if (this.checkOption.agree === null) {
      this.notice.error('错误', '是否通过未选择');
      return;
    }
    // console.log(this.checkOption, 'agree info submit!');
    const obj: any = {
      ...this.checkOption,
      node_process_id: this.currentRedpunchNodeProcess.id
    }
    this.settingsConfigService
      .post(`/api/red_punch_bill/approval`, obj)
      .subscribe((res: ApiData) => {
        // console.log(res, 'approval');
        if (res.code === 200) {
          this.msg.success('红冲审核提交成功');
          this.settingsConfigService.resetGlobalTasks();
          this.getAbandonedProcess();
        }
      })
  }

  cancel() { }

  executeChange(data: any) {
    console.log('执行情况信息 提交: ', data);

    const option: any = { ...data, process_id: this.progressInfo.id };
    this.settingsConfigService.post('/api/bill/execute', option).subscribe((res: ApiData) => {
      console.log(res, '执行情况确认');
      if (res.code === 200) {
        this.msg.success('执行情况更新成功');
        this.settingsConfigService
          .get(`/api/bill/process/${this.billId}`)
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

    const pdf_name: string = this.projectDetailInfo.name + "_" + (new Date().getTime()) + '.pdf';
    pdf.save(pdf_name); // Generated PDF 
  }
  // 图片和 pdf 下载 功能
  exportImage(contentDataURL: any) {
    const base64Img = contentDataURL;
    const oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.projectDetailInfo.name + "_" + (new Date().getTime());
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }
}
