import { Component, OnInit, TemplateRef } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { filter, map } from 'rxjs/operators';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-no-contract-pay-create',
  templateUrl: './no-contract-pay-create.component.html',
  styles: [`
    nz-form-label {
      min-width: 120px;
    }
    nz-form-control {
        flex-grow: 1;
    }
  `]
})
export class NoContractPayCreateComponent implements OnInit {
  listOfData:any[] = [];

  costlist:any[] = []; // 所有成本数据 

  projectInfo:any = null;
  projectId:number = null;

  treaty_pay_id:number = null;
  treatypayInfo:any = null;
  treaty_id:number = null;

  treatyListArr:any[] = [];

  costArr:any[] = []; // 所有的成本列表  需要通过预算（通过项目） 获取

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private settings: SettingsService
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getProjectInfo(); // 项目信息
        this.getTreatyList(); // 项目下的协议信息
        this.getBudgetInfo();
      }
    });

    this.activatedRoute.queryParams.subscribe(params=> {
      if(params && params['treaty_pay_id']) {
        this.treaty_pay_id = +(params['treaty_pay_id']);
        this.getAttachment();
      }
    })
    
  }
  submitLoading: boolean = false;

  validateTreatyForm:FormGroup;

  ifWriteOff:boolean = false;
  ngOnInit() {
    this.validateTreatyForm = this.fb.group({
      treaty_id: new FormControl({ value: null, disabled: this.treaty_pay_id ? true : false }, Validators.required),
      pay_company: [ null, [ Validators.required ] ],
      bank_account: [ null, [ Validators.required ] ],
      bank_name: [ null, [ Validators.required ] ],
      if_write_off: [ null, [ Validators.required ] ],
      write_off_amount: [ null, [Validators.required] ]
    });

    this.getCategoryList();
    // 是否冲销借款   改版  冲销金额的验证
    this.validateTreatyForm.get('if_write_off').valueChanges.subscribe((if_write_off:boolean) => {
      console.log('if_write_off', if_write_off);
      if(if_write_off) {
        this.ifWriteOff = true;
        // this.validateTreatyForm.get('write_off_amount').setValue(null);
        this.validateTreatyForm.get('write_off_amount').enable();
      }else {
        this.ifWriteOff = false;
        this.validateTreatyForm.get('write_off_amount').setValue(0);
        this.validateTreatyForm.get('write_off_amount').disable();
      }
      // if(if_write_off) {
      //   this.validateTreatyForm.patchValue({
      //     write_off_amount: null
      //   })
      //   this.validateTreatyForm.get('write_off_amount').setValidators(Validators.required);
      // }else {
      //   this.validateTreatyForm.patchValue({
      //     write_off_amount: 0
      //   })
      // }
    });
    
    
    this.validateCostForm = this.fb.group({
      abstract: [null, [ Validators.required ] ],
      cost_id: [null, [ Validators.required ] ],
      amount: [ null, [ Validators.required, this.confirmationAmountValidator ] ],
      card_number: [null, [ Validators.required, Validators.pattern(/[1-9][0-9]{8,}/) ] ],
      account_name: [null, [ Validators.required ] ],
      is_business_card: [null ],
      remark: [ null ]
    });

    // 当成本类型发生变化时，支付金额也有限制输入
    this.validateCostForm.get('cost_id').valueChanges.subscribe((cost_id:number) => {
      if(cost_id) {
        this.currentSelectCost = this.costArr.filter(v => v.id === cost_id)[0];
      }
    });
    
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
      } else if (amount > max) {
        return { confirm: true, error: true };
      }
      return {};
    }
  };

  getTreatyList():void { // 通过项目获取非合约 协议列表
    this.settingsConfigService.get(`/api/treaty/${this.projectId}`).subscribe((res:ApiData) => {
      console.log(res, '非合约 协议列表')
      if(res.code === 200) {
        this.treatyListArr = res.data.treaty;
        // 如果有 treaty_pay_id 参数， 则表示为编辑 非合约支付
        if(this.treaty_pay_id) {
          this.getTreatyPayDetail();
        }
      }
    })
  }
  
  getTreatyPayDetail():void {
    this.settingsConfigService.get(`/api/treaty/pay/detail/${this.treaty_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '非合约支付信息1111');
          if(res.code === 200) {
            this.treaty_id = res.data.id;
            this.treatypayInfo = res.data;
            this.setTreatyForm(res.data);
            this.getTreatyPayment();
            if(!this.treatypayInfo.draft) {
              this.getWorkflow();
            }
          }
        })
  }
  getTreatyPayment() {
    this.settingsConfigService.get(`/api/treaty/payment/${this.treaty_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '非合约支付详情列表2222');
          if(res.code === 200) {
            const treatyPayment:any[] = res.data.treaty_payment;
            this.listOfData = treatyPayment;

          }
        })
  }
  setTreatyForm(data:any):void {
    this.validateTreatyForm.patchValue({
      treaty_id: data.treaty.id,
      pay_company: data.pay_company,
      bank_account: data.bank_account,
      bank_name: data.bank_name,
      if_write_off: data.if_write_off,
      write_off_amount: data.write_off_amount
    });
  }
  

  getProjectInfo() { // 项目基础信息
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectInfo = res.data;
      }
    })
  }

  getBudgetInfo() { // 获取预算信息， 然后获取当前项目下的成本
    this.settingsConfigService.get(`/api/budget/project/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const budget:any = res.data;
        this.getCostArrByBudgetId(budget.id);
      }
    })
  }
  getCostArrByBudgetId(id:number):void {
    this.settingsConfigService.get(`/api/cost/budget/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const cost:any[] = res.data.cost;
        this.costlist = cost;
        this.dealCostSelectArr(cost);
      }
    })
  }
  
  // 新增 成本支付
  tplModal: NzModalRef;

  validateCostForm:FormGroup;

  addPaymentCost(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent): void {
    e.preventDefault();
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }
  edit(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, data:any): void {
    // 将 之前 禁用的 成本类型  disabled  ===> false
    this.isEditCost = true;
    this.costArr = this.costArr.map( v => {
      if(v.id === data.cost.id) {
        v.disabled = false;
      }
      return v;
    })
    this.resetForm(data);
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  handleOk(): void {
    this.submitCostForm();
  }

  closeModal(): void {
    this.currentSelectCost = null;
    this.isEditCost = false;
    this.tplModal.destroy();
    this.validateCostForm.reset();
  }

  isEditCost:boolean = false;

  submitCostForm(): void {
    for (const key in this.validateCostForm.controls) {
      this.validateCostForm.controls[key].markAsDirty();
      this.validateCostForm.controls[key].updateValueAndValidity();
    }
    if(this.validateCostForm.valid) {
      const value:any = this.validateCostForm.value;

      // 添加成本预算后， 当前 成本类型就变成不可选
      this.costArr = this.costArr.map( v => {
        if(v.id === value.cost_id) {
          v.disabled = true;
        }
        return v;
      });
      
      let remark:string = value.remark || '';
      // 列表渲染数据
      const selectCost:any = this.costlist.filter( v => v.id === value.cost_id)[0];
      
      let _list:any[] = this.listOfData.filter( v => v.cost.id !== value.cost_id);
      
      _list.push({
        abstract: value.abstract,
        cost: selectCost,
        amount:  Number(value.amount),
        remark: remark.trim(),
        card_number: value.card_number,
        account_name: value.account_name,
        is_business_card: value.is_business_card
      })
      
      this.listOfData = [..._list];
      console.log(this.listOfData)
      this.closeModal();
    }
  }

  submitTreatyForm() {
    for (const key in this.validateTreatyForm.controls) {
      this.validateTreatyForm.controls[key].markAsDirty();
      this.validateTreatyForm.controls[key].updateValueAndValidity();
    }
    console.log(this.validateTreatyForm.value, '无合约协议表单数据');
    if(this.validateTreatyForm.valid && this.listOfData.length !== 0) {
      this.submitLoading = true;
      if(this.treaty_pay_id) {
        this.updateTreatyPay(this.validateTreatyForm.value);
      }else {
        this.createTreatyPay(this.validateTreatyForm.value);
      }
      
    }
  }

  createTreatyPay(data:any):void {
    const  paymentArr:any[] = this.listOfData.map( v => {
      return {
        abstract: v.abstract,
        cost_id: v.cost.id,
        amount: v.amount,
        card_number: v.card_number,
        account_name: v.account_name,
        is_business_card: v.is_business_card ? v.is_business_card : false,
        remark: v.remark
      }
    });
    let obj:any = {
      treaty_id: data.treaty_id,
      project_id: this.projectId,
      pay_company: data.pay_company,
      bank_account: data.bank_account,
      bank_name: data.bank_name,
      if_write_off: data.if_write_off,
      write_off_amount: data.if_write_off ? +data.write_off_amount : 0,
      payment: paymentArr
    };
    this.settingsConfigService.post(`/api/treaty/pay/create`, obj).subscribe((res:ApiData) => {
      console.log(res, '新增无合约非合约支付')
      this.submitLoading = false;
      if(res.code === 200) {
        this.bindAttachment(res.data.id);
      }else {
        this.msg.error(res.error || '非合约支付提交失败');
      }
    })

  }

  updateTreatyPay(data:any) {
    const  paymentArr:any[] = this.listOfData.map( v => {
      return {
        treaty_payment_id: v.id ? v.id : null,
        abstract: v.abstract,
        cost_id: v.cost.id,
        amount: v.amount,
        card_number: v.card_number,
        account_name: v.account_name,
        is_business_card: v.is_business_card,
        remark: v.remark
      }
    });
    let obj:any = {
      treaty_pay_id: this.treaty_pay_id,
      pay_company: data.pay_company,
      bank_account: data.bank_account,
      bank_name: data.bank_name,
      if_write_off: data.if_write_off,
      write_off_amount: data.if_write_off ? data.write_off_amount : 0,
      payment: paymentArr
    };

    this.settingsConfigService.post(`/api/treaty/pay/update`, obj).subscribe((res:ApiData) => {
      console.log(res, '编辑无合约非合约支付审批单')
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('非合约支付提交成功');
        this.router.navigateByUrl(`/approve/no-contract/apply/pay/${this.projectId}`);
      }else {
        this.msg.error(res.error || '非合约支付提交失败');
      }
    })
  }

  
  dealCostSelectArr(arr:any[]) {
    const list:any[] = arr;
    this.costArr = list.map( v => {
      return {
        id: v.id,
        name: v.cost_category.name,
        max: v.amount,
        pay_amount: v.pay_amount,
        disabled: this.checkIsSelectedCost(v.id)
      }
    });
    console.log(this.costArr);
  }
  
  checkIsSelectedCost(id:number):boolean {
    if(this.listOfData && this.listOfData.length !== 0) {
      return this.listOfData.filter( v => v.cost.id === id).length > 0;
    }
    return false;
  }

  cancel(): void {}

  delete(id:number): void {
    this.listOfData = this.listOfData.filter( v => v.cost.id !== id);
    this.msg.success('支付成本删除成功!');
  }

  resetForm(opt:any):void {
    this.validateCostForm.patchValue({
      abstract: opt.abstract,
      cost_id: opt.cost.cost_category.id,
      amount: opt.amount,
      card_number: opt.card_number,
      account_name: opt.account_name,
      is_business_card: opt.is_business_card,
      remark: opt.remark
    });
  }
  
  submitContractPay():void {
    console.log(this.treaty_pay_id, '非合约支付信息提交')
    this.settingsConfigService.post('/api/treaty_pay/submit', { treaty_pay_id: this.treaty_pay_id }).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('支付信息提交成功');
        this.router.navigateByUrl(`/approve/no-contract/apply/pay/${this.projectId}`);
      }else {
        this.msg.error(res.error)
      }
    });
  }

  
  // 附件上传
  attachment:any[] = [];
  isAttachmentChange:boolean = false;
  attachmentChange(option:any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if(this.treaty_pay_id) {
      this.bindAttachment(this.treaty_pay_id, true);
    }
  }

  bindAttachment(treaty_pay_id:number, isRefer:boolean = false) {
    const opt:any = {
      attachment_ids: this.attachment.map(v => v.id),
      project_id: this.projectInfo.id,
      treaty_pay_id: treaty_pay_id,
      is_basic: false
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        if(this.treaty_pay_id) {
          if(isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        }else {
          this.msg.success('非合约支付提交成功');
          this.router.navigateByUrl(`/approve/no-contract/apply/pay/${this.projectId}`);
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/treaty_pay/${this.treaty_pay_id}`).subscribe((res:ApiData) => {
      console.log('项目 基础附件：', res);
      if(res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }


  attachmentCategory:List[] = [];
  getCategoryList() {
    const opt:any = {
      is_project: false,
      is_contract: false,
      is_pay: true,
      is_bill: false
    };
    this.settingsConfigService.post('/api/attachment/category/list', opt).pipe(
      filter(v => v.code === 200),
      map(v => v.data)
    ).subscribe( data => {
      const cateArrData:any[] = data.attachment_category;
      this.attachmentCategory = cateArrData.sort((a:any, b:any) => a.sequence - b.sequence).map( v => {
        return { id: v.id, name: v.name }
      });

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
        .get(`/api/treaty/pay/process/${this.treaty_pay_id}`)
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
}
