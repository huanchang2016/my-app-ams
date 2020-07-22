import { Component, OnInit, Input, TemplateRef, OnChanges } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { EllipsisComponent } from '@delon/abc';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-payment-tax-manage',
  templateUrl: './payment-tax-manage.component.html',
  styles: [`
    nz-form-label {
      min-width: 120px;
    }
    nz-form-control {
        flex-grow: 1;
    }
  `]
})
export class PaymentTaxManageComponent implements OnChanges, OnInit {
  @Input() payInfo?:any;
  @Input() paymentArray?:any[];
  @Input() billCategoryArray:any[];

  @Input() is_execute_user:boolean = false;
  @Input() payType?:string = 'treaty';

  listOfData: any[] = [];
  validateForm: FormGroup;
  
  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private fb: FormBuilder
  ) {
    this.getCategoryList();
  }

  currentPayment:any = null;

  ngOnChanges() {
    console.log(this.is_execute_user, 'is_execute_user', this.paymentArray, 'paymentArray', 'billCategoryArray', this.billCategoryArray)
    if(this.is_execute_user && this.payInfo) {
      // 是执行者访问， 需要展示  附件绑定
      this.getAttachment();
    }
  }

  // 附件上传
  attachment: any[] = [];
  isAttachmentChange: boolean = false;
  attachmentChange(option: any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if (this.payInfo.id) {
      this.bindAttachment(this.payInfo.id, true);
    }
  }

  bindAttachment(pay_id: number, isRefer: boolean = false) {
    let opt: any = null;
    if(this.payType === 'treaty') {
      opt = {
        attachment_ids: this.attachment.map(v => v.id),
        project_id: this.payInfo.project.id,
        treaty_pay_id: pay_id,
        is_basic: false
      };
    }
    
    if(this.payType === 'contract') {
      opt = {
        attachment_ids: this.attachment.map(v => v.id),
        project_id: this.payInfo.project.id,
        contract_pay_id: pay_id,
        is_basic: false
      };
    }

    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        if (this.payInfo) {
          if (isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }
  getAttachment() {
    // `/api/attachment/treaty_pay/${this.payInfo.id}`
    let attachmentUrl:string = '';
    if(this.payType === 'treaty') {
      attachmentUrl = '/api/attachment/treaty_pay/' + this.payInfo.id;
    }
    

    this.settingsConfigService.get(attachmentUrl).subscribe((res: ApiData) => {
      console.log(' 基础附件：', res, this.payType);
      if (res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }


  attachmentCategory: List[] = [];
  getCategoryList() {
    const opt: any = {
      is_project: false,
      is_contract: false,
      is_pay: true,
      is_bill: false
    };
    this.settingsConfigService.post('/api/attachment/category/list', opt).pipe(
      filter(v => v.code === 200),
      map(v => v.data)
    ).subscribe(data => {
      const cateArrData: any[] = data.attachment_category;
      this.attachmentCategory = cateArrData.sort((a: any, b: any) => a.sequence - b.sequence).map(v => {
        return { id: v.id, name: v.name }
      });

    });
  }

  
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      treaty_payment_id: [null, [Validators.required]],
      is_get_bill: [null, [Validators.required]],
      bill_category_id: [null],
      exclude_tax_amount: [null, [Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      tax_amount: [null, [Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      amount: [null, [Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      index: [null, [Validators.required, Validators.pattern(/^[1-9]\d*$/)]]
    });

    if(this.payInfo) {
      this.getDataList();
    }
  }
  

  getDataList() {
    this.settingsConfigService.get(`/api/treaty/payment/tax/${this.payInfo.id}`).subscribe((res: ApiData) => {
      console.log(res, '非合约 支付详情对应税 列表')
      if (res.code === 200) {
        const list:any[] = res.data.contract_payment_tax;
        this.listOfData = list.sort( (a:any, b:any) => a.index - b.index);
        
        
        this.dealBillCateArray();
      }
    })
  }

  checkedOption:any = {};
  dealBillCateArray() {
    if(this.listOfData.length !== 0) {
      this.listOfData.forEach(el => {
        if(el.bill_category) {
          let key:string = el.contract_payment.cost.cost_category.id + '-' + el.company.id + '-' + el.bill_category.id;
          this.checkedOption[key] = true;
        }
      })

    }
  }

  
  // 新增 成本支付
  tplModal: NzModalRef;

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
  edit(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, data: any): void {
    // 将 之前 禁用的 成本类型  disabled  ===> false
    this.isEditCost = true;
    this.currentEditInfo = data;
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

  resetForm(opt: any): void {
    this.editCostData = opt;
    [this.currentPayment] = this.paymentArray.filter(v => v.id === opt.contract_payment.id);
    const is_get_bill:boolean = opt.bill_category ? true : false;
    this.validateForm.patchValue({
      treaty_payment_id: opt.contract_payment.id,
      is_get_bill: is_get_bill,
      bill_category_id: is_get_bill ? opt.bill_category.id : null,
      amount: is_get_bill ? null : opt.amount,
      exclude_tax_amount: is_get_bill ? opt.exclude_tax_amount : null,
      tax_amount: is_get_bill ? opt.tax_amount : null,
      index: opt.index
    });
    this.isGetBillChange(is_get_bill);
  }

  submitCostLoading:boolean = false;
  closeModal(): void {
    this.isEditCost = false;
    this.currentEditInfo = null;
    this.currentPayment = null;
    this.tplModal.destroy();
    this.validateForm.reset();
    this.validateForm.patchValue({
      is_get_bill: true
    })
  }

  isEditCost: boolean = false;
  currentEditInfo:any = null;
  editCostData:any = null;

  totalAmountError:boolean = false;
  treatyPaymentChange(treaty_payment_id: number): void {
    [this.currentPayment] = this.paymentArray.filter(v => v.id === treaty_payment_id);
    console.log(this.currentPayment, 'current selected payment');
    this.amountChange();
  }

  isGetBillChange(is_get_bill: boolean): void {
    console.log(is_get_bill, 'is_get_bill change');
    if (!is_get_bill) { // 未开票

      this.validateForm.get('bill_category_id')!.clearValidators();
      this.validateForm.get('bill_category_id')!.markAsPristine();
      
      this.validateForm.get('exclude_tax_amount')!.clearValidators();
      this.validateForm.get('exclude_tax_amount')!.markAsPristine();
      
      this.validateForm.get('tax_amount')!.clearValidators();
      this.validateForm.get('tax_amount')!.markAsPristine();
      
      this.validateForm.get('amount').setValidators(Validators.required);
      this.validateForm.get('amount').markAsDirty();


    } else { // 已开票

      this.validateForm.get('bill_category_id')!.setValidators(Validators.required);
      this.validateForm.get('bill_category_id')!.markAsDirty();

      this.validateForm.get('exclude_tax_amount')!.setValidators(Validators.required);
      this.validateForm.get('exclude_tax_amount')!.markAsDirty();
      
      this.validateForm.get('tax_amount')!.setValidators(Validators.required);
      this.validateForm.get('tax_amount')!.markAsDirty();

      this.validateForm.get('amount')!.clearValidators();
      this.validateForm.get('amount')!.markAsPristine();

    }
    this.validateForm.updateValueAndValidity();
  }

  amountChange() {
    // 监听除税金额和 税金的变化，判断是否大于 可支付的最大金额
    if(!this.currentPayment) {
      return;
    }
    if(this.validateForm.get('is_get_bill').value) {
      const _exclude_tax_amount:number = +this.validateForm.get('exclude_tax_amount').value;
      const _tax_amount:number = +this.validateForm.get('tax_amount').value;

      this.totalAmountError = (_exclude_tax_amount + _tax_amount) > this.currentPayment.amount;
      
    }else {
      const _amount:number = +this.validateForm.get('amount').value;
      this.totalAmountError = _amount > this.currentPayment.amount;
    }
  }

  submitTaxForm(): void {
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    console.log(this.validateForm, 'validateForm')
    if (this.validateForm.valid && !this.totalAmountError) {
      this.submitCostLoading = true;

      const value: any = this.validateForm.value;

      // 添加台账后， 当前 发票类型不可选
      /****
       * checkeOption = {
       *   1: {
       *        11: true
       *      },
       *   2: {
       *        11: false
       *      }
       * }
       * 
       * 
       * *****/ 
      // let opt = null;
      // opt[value.bill_category_id] = true;
      // this.checkedOption[value.treaty_payment_id] = Object.assign(this.checkedOption[value.treaty_payment_id], opt)

      if(this.isEditCost) {
        this.updatePayment(value);
      }else {
        this.createPayment(value);
      }
      
    }
  }

  updatePayment(opt:any) {
    const is_get_bill:boolean = opt.is_get_bill;
    const option = {
      treaty_payment_tax_id: this.currentEditInfo.id,
      bill_category_id: is_get_bill ? opt.bill_category_id : null,
      exclude_tax_amount: is_get_bill ? +opt.exclude_tax_amount : 0,
      tax_amount: is_get_bill ? +opt.tax_amount : 0,
      amount: is_get_bill ? 0 : +opt.amount,
      index: +opt.index
    }

    this.settingsConfigService.post('/api/treaty/payment/tax/update', option).subscribe((res:ApiData) => {
      this.submitCostLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.getDataList(); // 获取详情支付列表
        this.closeModal();
      }
    })
  }
  createPayment(opt:any) {
    const is_get_bill:boolean = opt.is_get_bill;
    const option = {
      treaty_payment_id: opt.treaty_payment_id,
      bill_category_id: is_get_bill ? opt.bill_category_id : null,
      exclude_tax_amount: is_get_bill ? +opt.exclude_tax_amount : 0,
      tax_amount: is_get_bill ? +opt.tax_amount : 0,
      amount: is_get_bill ? 0 : +opt.amount,
      index: +opt.index
    }
    this.settingsConfigService.post('/api/treaty/payment/tax/create', option).subscribe((res:ApiData) => {
      this.submitCostLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.getDataList(); // 获取详情支付列表
        this.closeModal();
      }
    })
  }
  disabledPayment(id:number) {
    this.settingsConfigService.post('/api/treaty/payment/tax/disable', { treaty_payment_tax_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('删除成功');
        this.listOfData = this.listOfData.filter( v => v.id !== id);
        this.dealBillCateArray();
      }
    })
  }
  
  cancel(): void { }
}
