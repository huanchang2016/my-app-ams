import { Component, OnInit, TemplateRef } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef, NzNotificationService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-apply-contract-view',
  templateUrl: './apply-contract-view.component.html',
  styles: []
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

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    private settings: SettingsService,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getProjectInfo();
        this.getContractList();
        // this.getBudgetInfo();
      }
    });

    // this.activatedRoute.queryParams.subscribe(params=> {
    //   if(params && params['contract_pay_id']) {
    //     this.contract_pay_id = +(params['contract_pay_id']);
    //     this.getContractPayDetail();
    //     this.getContractPayment();
    //   }
    // })
  }
  submitLoading: boolean = false;


  ngOnInit() {
    
  }

  currentSelectCost:any = null;
  confirmationAmountValidator = (control: FormControl): { [s: string]: boolean } => {

    if(!this.currentSelectCost) {
      return { required: true };
    }else {
      const max:number = this.currentSelectCost.max - this.currentSelectCost.pay_amount;
      const amount:number = Number(control.value);
      if (!amount) {
        return { required: true };
      } else if (amount > max || amount > this.selectedContract.amount) {
        return { confirm: true, error: true };
      }
      return {};
    }
    
    
  };

  // contractValueChange() {
  //   [this.selectedContract] = this.contractList.filter( v => v.id === this.contract_id);
  // }

  getContractList():void { // 通过项目获取合约
    this.settingsConfigService.get(`/api/contract/project/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.contractList = res.data.contract;
        // 如果有 contract_pay_id 参数， 则表示为编辑 合同支付
        this.activatedRoute.queryParams.subscribe(params=> {
          if(params && params['contract_pay_id']) {
            this.contract_pay_id = +(params['contract_pay_id']);
            this.getContractPayDetail();
            this.getContractPayment();
          }
        })
      }
    })
  }
  
  getContractPayDetail():void {
    this.settingsConfigService.get(`/api/contract/pay/detail/${this.contract_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '合同支付信息');
          if(res.code === 200) {
            this.contractInfo = res.data;
            this.contract_id = res.data.contract.id;
            [this.selectedContract] = this.contractList.filter( v => v.id === this.contract_id);
            if(!res.data.draft) { // 非草稿时 获取流程
              this.getWorkflow();
            }
          }
        })
  }
  getContractPayment() {
    this.settingsConfigService.get(`/api/contract/payment/${this.contract_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '合同支付详情列表');
          if(res.code === 200) {
            const contractPayment:any[] = res.data.contract_payment;
            this.listOfData = contractPayment;

          }
        })
  }

  getProjectInfo() { // 项目基础信息
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectInfo = res.data;
      }
    })
  }

  // getBudgetInfo() { // 获取预算信息， 然后获取当前项目下的成本
  //   this.settingsConfigService.get(`/api/budget/project/${this.projectId}`).subscribe((res:ApiData) => {
  //     // console.log(res);
  //     if(res.code === 200) {
  //       // this.setFormValue(res.data);
  //       const budget:any = res.data;
  //       this.getCostArrByBudgetId(budget.id);
  //     }
  //   })
  // }
  // getCostArrByBudgetId(id:number):void {
  //   this.settingsConfigService.get(`/api/cost/budget/${id}`).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       const cost:any[] = res.data.cost;
  //       this.costlist = cost;
  //     }
  //   })
  // }
  // cancel(): void {}

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
        .post(`/api/pay/node_process/approval`, obj)
        .subscribe((res:ApiData) => {
          console.log(res, 'approval');
          if(res.code === 200) {
           this.msg.success('审核提交成功');
           this.getWorkflow();
          }
    })
  }
}
