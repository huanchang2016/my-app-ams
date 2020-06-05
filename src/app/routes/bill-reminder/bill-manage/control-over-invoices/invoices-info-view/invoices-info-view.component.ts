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

  projectId:number = null;
  projectDetailInfo:any = null;
  billId:number = null;
  billInfo:any = null;
  billFees:any[] = [];

  billCategoryArray:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    public msg: NzMessageService,
    private settings: SettingsService
  ) {
    // console.log('发票开具   详情查看')
    this.projectId = +this.activatedRoute.snapshot.queryParams.project_id;
    if(this.projectId) {
      this.getConfig();
    }
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.billId = +params['id'];
        // console.log(this.billId, 'billId');
        this.getBillInfo();
        this.getWorkflow();
      }
    })
  }

  ngOnInit(): void {
    
  }
  getBillInfo(): void {
    this.settingsConfigService.get(`/api/bill/${this.billId}`).subscribe((res: ApiData) => {
      // console.log('billInfo, ', res.data);
      if (res.code === 200) {
        this.billInfo = res.data;
        this.transferAmount(this.billInfo.amount);
      }
    });

    this.settingsConfigService.get(`/api/bill/fee/${this.billId}`).subscribe((res: ApiData) => {
      // console.log('bill fee, ', res.data);
      if (res.code === 200) {
        this.billFees = res.data.bill_fee;
      }
    })
  }
  
  getConfig() {
    // 获取客户单位 信息详情
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      // console.log('projectDetailInfo, ', res.data);
      if(res.code === 200) {
        this.projectDetailInfo = res.data;
        // 发票的服务名称和项目是创建时已经绑定好了的，所以同一项目下的发票 服务名称不可改变
        this.getSubTaxFees(this.projectDetailInfo.budget.tax.id);
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

  taxFeeArray:any[] = [];
  
  getSubTaxFees(id: number) {

    this.settingsConfigService.get(`/api/tax/fee/${id}`).subscribe((res: ApiData) => {
      // console.log(res.data);
      if (res.code === 200) {
        let data: any[] = res.data.tax_fee;
        if (data.length !== 0) {
          this.taxFeeArray = data.filter(v => v.active).sort((a: any, b: any) => a.sequence - b.sequence);
        }
      }
    });
  }

  // 金额大写
  transferNumber:string = '';
  transferAmount(num:number) {
    this.settingsConfigService.post(`/api/finance/transfer`, { num: num }).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.transferNumber = res.data.number;
      }
    });
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
        .get(`/api/bill/process/${this.billId}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'workflow bill info');
          if(res.code === 200) {
            this.progressInfo = res.data;
            if(this.progressInfo) {
              this.getNodeProcess();
            }
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
        .post(`/api/bill/approval`, obj)
        .subscribe((res:ApiData) => {
          // console.log(res, 'approval');
          if(res.code === 200) {
           this.msg.success('审核提交成功');
           this.settingsConfigService.resetGlobalTasks();
           this.getWorkflow();
          }
    })
  }
  cancel() { }

  executeChange(data:any) {
    console.log('执行情况信息 提交: ', data);
    const option:any = Object.assign(data, { process_id: this.progressInfo.id });
    this.settingsConfigService.post('/api/bill/execute', option).subscribe((res:ApiData) => {
      console.log(res, '执行情况确认');
      if(res.code === 200) {
        this.msg.success('执行情况更新成功');
        this.settingsConfigService
        .get(`/api/bill/process/${this.billId}`)
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
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

    const pdf_name: string = this.projectDetailInfo.name + "_" + (new Date().getTime()) + '.pdf';
    pdf.save(pdf_name); // Generated PDF 
  }
  // 图片和 pdf 下载 功能
  exportImage(contentDataURL: any) {
    var base64Img = contentDataURL;
    let oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.projectDetailInfo.name + "_" + (new Date().getTime());
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }
}
