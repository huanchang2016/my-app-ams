import { Component, OnInit } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';

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
    private settingConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    public msg: NzMessageService,
    private settings: SettingsService,
    private router: Router
  ) {
    console.log('发票开具   详情查看')
    this.projectId = +this.activatedRoute.snapshot.queryParams.project_id;
    if(this.projectId) {
      this.getConfig();
    }
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.billId = +params['id'];
        console.log(this.billId, 'billId');
        this.getBillInfo();
        this.getWorkflow();
      }
    })
  }

  ngOnInit(): void {
    
  }
  getBillInfo(): void {
    this.settingConfigService.get(`/api/bill/${this.billId}`).subscribe((res: ApiData) => {
      console.log('billInfo, ', res.data);
      if (res.code === 200) {
        this.billInfo = res.data;
        this.transferAmount(this.billInfo.amount);
      }
    });

    this.settingConfigService.get(`/api/bill/fee/${this.billId}`).subscribe((res: ApiData) => {
      console.log('bill fee, ', res.data);
      if (res.code === 200) {
        this.billFees = res.data.bill_fee;
      }
    })
  }
  
  getConfig() {
    // 获取客户单位 信息详情
    this.settingConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      console.log('projectDetailInfo, ', res.data);
      if(res.code === 200) {
        this.projectDetailInfo = res.data;
        // 发票的服务名称和项目是创建时已经绑定好了的，所以同一项目下的发票 服务名称不可改变
        this.getSubTaxFees(this.projectDetailInfo.budget.tax.id);
      }
    });
    // 获取开票类型
    this.settingConfigService.get(`/api/bill/category/all`).subscribe((res: ApiData) => {
      console.log('bill/category, ', res.data);
      if (res.code === 200) {
        this.billCategoryArray = res.data.bill_category;
      }
    })
  }

  taxFeeArray:any[] = [];
  
  getSubTaxFees(id: number) {

    this.settingConfigService.get(`/api/tax/fee/${id}`).subscribe((res: ApiData) => {
      console.log(res.data);
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
    this.settingConfigService.post(`/api/finance/transfer`, { num: num }).subscribe((res: ApiData) => {
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
    this.settingConfigService
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
    this.settingConfigService
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
    this.settingConfigService
        .post(`/api/bill/approval`, obj)
        .subscribe((res:ApiData) => {
          console.log(res, 'approval');
          if(res.code === 200) {
           this.msg.success('审核提交成功');
           this.getWorkflow();
          }
    })
  }
}
