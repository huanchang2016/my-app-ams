import { Component, Input, OnInit, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData, List } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { filter, map } from 'rxjs/operators';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-payment-contract-tax-mange',
  templateUrl: './payment-contract-tax-mange.component.html',
  styles: [`
    nz-form-label {
      min-width: 120px;
    }
    nz-form-control {
        flex-grow: 1;
    }
  `]
})
export class PaymentContractTaxMangeComponent implements OnInit {
  @Input() listOfData?: any[];

  @Input() contract_pay_id?: number;
  @Input() is_execute_user = true;
  @Input() isCurrentCheck?: boolean;


  @Output() private outer = new EventEmitter();

  @Output() private contractInformation = new EventEmitter();

  @Output() private submitDisplay = new EventEmitter();

  @Output() private submitFilter = new EventEmitter();

  @Output() private getData = new EventEmitter();

  billModal: NzModalRef;

  validateBillForm!: FormGroup;

  isEditCost = false;

  contractInfo: any = null;  // 合同信息

  listOfTax: any[] = []; //  台账数据

  // contract_pay_id: number = null;//  合同支付ID

  contract_payment_id: number = null;  //  合同支付详情id

  contract_payment_tax_id: number = null;  //  合同支付税目id

  currentPayment: any = null;  //  检测支付金额

  submitLoading = false;

  taxArr: any[] = [];

  totalAmountError = false;

  currentPaymentTotal: any = null;

  projectId: number = null;

  contractList: any[] = [];

  contractListData: any = [];

  selectedContract: any = null;

  pageTitle = '';

  selectedFlag = false;  // 选择显示标杆

  contract_id: number = null; //  选择的合同id

  summary = ''; // 合同支付 摘要信息

  contractTaxTotal: number = null;

  single_contract_id: number = null; //  选择的合同id

  attachmentCategory: List[] = [];

  detailList: any[] = [];

  isSubmit: boolean;

  approveFlag: boolean;

  filterUser: boolean;

  // 流程进程信息
  // progressInfo: any = null;
  // nodeProcess: any[] = [];
  // currentNodeProcess: any = null;
  // isCurrentCheck = false;

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private settings: SettingsService
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params.id) {
        this.projectId = +params.id;
        // this.getProjectInfo();
        this.getContractList();
        // this.getBudgetInfo();
      }
    });
  }

  ngOnInit(): void {
    console.log(this.isCurrentCheck, 'payment isCurrentCheck');
    this.getContractTax();
    console.log("最下层组件 listOfData", this.listOfData);
    console.log("最下层组件 listOfTax", this.listOfTax);
    this.validateBillForm = this.fb.group({
      contract_payment_id: [null, [Validators.required]],
      bill_category_id: [null, [Validators.required]],
      exclude_tax_amount: [null, [Validators.required]],
      tax_amount: [null, [Validators.required]],
      amount: [null],
      invoice_number: [null, [Validators.required]],
      is_get_bill: [true, [Validators.required]],
    });
    this.getCategoryList();
    this.getTaxCategoryList();
    this.getData.emit(this.getContractTax());
  }

  getTaxCategoryList() {
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log(res, 'getTaxCategoryList 获取所有开票类型');
        // res.data.bill_category
        this.taxArr = res.data.bill_category
        console.log('taxArr', this.taxArr);
      }
    })
  }

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

  contractPaymentChange(cost_category_id: number): void {
    [this.currentPayment] = this.listOfData.filter(v => v.cost.cost_category.id === cost_category_id);
    if (this.currentPayment) {
      this.contract_payment_id = this.currentPayment.id;
      this.currentPaymentTotal = this.currentPayment.amount - this.currentPayment.tax_use_amount
      console.log(this.currentPayment, '2contractPaymentChange this.currentPayment');
      this.amountChange();
    }
  }

  amountChange() {
    // 监听除税金额和 税金的变化，判断是否大于 可支付的最大金额
    if (!this.currentPayment) {
      return;
    }
    if (this.validateBillForm.get('is_get_bill').value) {
      const _exclude_tax_amount: number = +this.validateBillForm.get('exclude_tax_amount').value;
      const _tax_amount: number = +this.validateBillForm.get('tax_amount').value;

      this.totalAmountError = (_exclude_tax_amount + _tax_amount) > this.currentPaymentTotal;

    } else {
      const _amount: number = +this.validateBillForm.get('amount').value;
      this.totalAmountError = _amount > this.currentPaymentTotal;
    }
    console.log(this.totalAmountError)
  }

  // 动态校验
  requiredChange(is_get_bill: boolean): void {
    if (!is_get_bill) { // 未开票
      this.validateBillForm.get('bill_category_id')!.clearValidators();
      this.validateBillForm.get('bill_category_id')!.markAsPristine();

      this.validateBillForm.get('exclude_tax_amount')!.clearValidators();
      this.validateBillForm.get('exclude_tax_amount')!.markAsPristine();

      this.validateBillForm.get('tax_amount')!.clearValidators();
      this.validateBillForm.get('tax_amount')!.markAsPristine();

      this.validateBillForm.get('invoice_number')!.clearValidators();
      this.validateBillForm.get('invoice_number')!.markAsPristine();

      this.validateBillForm.get('amount')!.setValidators(Validators.required);
      this.validateBillForm.get('amount')!.markAsDirty();
    } else { // 已开票
      this.validateBillForm.get('bill_category_id')!.setValidators(Validators.required);
      this.validateBillForm.get('bill_category_id')!.markAsDirty();

      this.validateBillForm.get('exclude_tax_amount')!.setValidators(Validators.required);
      this.validateBillForm.get('exclude_tax_amount')!.markAsDirty();

      this.validateBillForm.get('tax_amount')!.setValidators(Validators.required);
      this.validateBillForm.get('tax_amount')!.markAsDirty();

      this.validateBillForm.get('invoice_number')!.setValidators(Validators.required);
      this.validateBillForm.get('invoice_number')!.markAsDirty();

      this.validateBillForm.get('amount')!.clearValidators();
      this.validateBillForm.get('amount')!.markAsPristine();
    }
    // this.validateBillForm.updateValueAndValidity();
    this.validateBillForm.get('amount')!.updateValueAndValidity();
    this.validateBillForm.get('tax_amount')!.updateValueAndValidity();
    this.validateBillForm.get('exclude_tax_amount')!.updateValueAndValidity();
  }

  getContractTax() {
    console.log('this.contract_pay_id', this.contract_pay_id);
    this.settingsConfigService.get(`/api/contract/payment/tax/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付税目列表......');
        if (res.code === 200) {
          const contractTax: any[] = res.data.contract_payment_tax;
          this.listOfTax = contractTax;
          console.log('getContractTax listOfTax', this.listOfTax);
          if (this.contractInfo) {
            console.log('kkk', this.contractInfo.amount === this.contractInfo.tax_use_amount)
            for (const item of this.listOfTax) {
              if ((this.contractInfo.amount === this.contractInfo.tax_use_amount) && item.bill_category) {
                this.isSubmit = false;
                this.outer.emit(this.isSubmit);
              } else {
                this.isSubmit = true;
                this.outer.emit(this.isSubmit);
              }
            }
          }
          console.log('getContractTax isSubmit', this.isSubmit);
        }
      })
  }

  getContractList(): void { // 通过项目获取合约
    this.settingsConfigService.get(`/api/deal/project/${this.projectId}`).subscribe((res: ApiData) => {
      console.log('contract list deal: ', res);
      if (res.code === 200) {
        this.contractList = res.data.deal;
        this.contractListData = res.data;
        console.log('1.............', this.contractList);
        // 如果有 contract_pay_id 参数， 则表示为编辑 合约支付
        this.activatedRoute.queryParams.subscribe(params => {
          if (params && params.contract_pay_id) {
            this.contract_pay_id = +(params.contract_pay_id);
            this.pageTitle = '编辑合约支付申请';
            this.getContractPayDetail();
            this.getContractPayment();
            // this.getAttachment();
            this.getContractTax();
            this.selectedFlag = true;
          } else {
            this.pageTitle = '新增合约支付申请';
          }
        })
      }
    })
  }

  // getAttachment() {
  //   this.settingsConfigService.get(`/api/attachment/contract_pay/${this.contract_pay_id}`).subscribe((res: ApiData) => {
  //     console.log('项目 基础附件：', res);
  //     if (res.code === 200) {
  //       this.attachment = res.data.attachment;
  //     }
  //   })
  // }

  getContractPayDetail(): void {
    this.settingsConfigService.get(`/api/contract/pay/detail/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付信息');
        if (res.code === 200) {
          this.contractInfo = res.data;
          this.contractInformation.emit(this.contractInfo);
          this.contract_id = res.data.deal.contract.id;
          console.log('this.contract_id', this.contract_id)
          console.log('this.contractInfo', this.contractInfo)
          this.summary = this.contractInfo.summary; // 合约支付摘要
          [this.selectedContract] = this.contractList.filter(v => v.contract.id === this.contract_id);
          this.contractTaxTotal = res.data.tax_use_amount;
          if (!this.contractInfo.draft) {
            this.getWorkflow();
          }
        }
      })
  }

  getWorkflow() {
    this.settingsConfigService
      .get(`/api/contract/pay/process/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'workflow');
        if (res.code === 200) {
          this.approveFlag = res.data.finished;
          console.log(this.approveFlag, 'getWorkflow approveFlag');
          const user = JSON.parse(localStorage.getItem('user'));
          console.log(user, 'user');
          this.filterUser = res.data.execute_user.id === user.id;
          console.log(this.filterUser, 'filterUser');
          this.submitDisplay.emit(this.approveFlag);
          this.submitFilter.emit(this.filterUser);
        }
      })
  }

  getContractPayment() {
    this.settingsConfigService.get(`/api/contract/payment/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付详情列表');
        if (res.code === 200) {
          const contractPayment: any[] = res.data.contract_payment;
          this.listOfData = contractPayment;
          this.detailList = res.data;
          console.log('detailList', this.detailList);
          console.log('getContractPayment listOfData', this.listOfData);
        }
      })
  }

  contractValueChange() {
    [this.selectedContract] = this.contractList.filter(v => v.contract.id === this.contract_id);
    this.single_contract_id = this.selectedContract.id
    console.log('selectedContract', this.selectedContract)
  }

  closeTaxModal(): void {
    // this.currentSelectCost = null;
    this.isEditCost = false;
    this.currentPayment = null;
    this.billModal.destroy();
    this.validateBillForm.reset();
    this.validateBillForm.patchValue({ is_get_bill: true });
  }

  // 发票台账
  addBillTicket(billTitle: TemplateRef<{}>, billContent: TemplateRef<{}>, billFooter: TemplateRef<{}>, e: MouseEvent): void {
    e.preventDefault();
    this.billModal = this.modalService.create({
      nzTitle: billTitle,
      nzContent: billContent,
      nzFooter: billFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
    this.getContractPayment();
    console.log('1this.contract_payment_id', this.contract_payment_id)
    this.listOfData.map(v => { this.contract_payment_id = v.id })
    console.log('2this.contract_payment_id', this.contract_payment_id)

  }

  editBillTicket(billTitle: TemplateRef<{}>, billContent: TemplateRef<{}>, billFooter: TemplateRef<{}>, data: any, i): void {
    this.isEditCost = true;
    this.contract_payment_id = this.listOfTax[i]?.id;
    this.contract_payment_tax_id = data.id;
    console.log('contract_payment_tax_id', this.contract_payment_tax_id);
    console.log('editBillTicket data', data);
    this.resetTaxForm(data);
    this.contractPaymentChange(data.contract_payment.id);
    this.billModal = this.modalService.create({
      nzTitle: billTitle,
      nzContent: billContent,
      nzFooter: billFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  sureOk() {
    this.submitTaxForm();
  }

  submitTaxForm(): void {
    for (const key in this.validateBillForm.controls) {
      this.validateBillForm.controls[key].markAsDirty();
      this.validateBillForm.controls[key].updateValueAndValidity();
    }
    if (this.validateBillForm.valid && !this.totalAmountError) {
      const value: any = this.validateBillForm.value;
      console.log('value', value);
      const is_get_bill: boolean = this.validateBillForm.value.is_get_bill;
      const createArray = {
        contract_payment_id: this.contract_payment_id,
        bill_category_id: is_get_bill ? value.bill_category_id : null,
        exclude_tax_amount: is_get_bill ? Number(value.exclude_tax_amount) : 0,
        tax_amount: is_get_bill ? Number(value.tax_amount) : 0,
        amount: is_get_bill ? Number(value.exclude_tax_amount) + Number(value.tax_amount) : Number(value.amount),
        invoice_number: is_get_bill ? String(value.invoice_number) : null,
      }
      const editArray = {
        contract_payment_tax_id: this.contract_payment_tax_id,
        bill_category_id: is_get_bill ? value.bill_category_id : null,
        exclude_tax_amount: is_get_bill ? Number(value.exclude_tax_amount) : 0,
        tax_amount: is_get_bill ? Number(value.tax_amount) : 0,
        amount: is_get_bill ? Number(value.exclude_tax_amount) + Number(value.tax_amount) : Number(value.amount),
        invoice_number: is_get_bill ? String(value.invoice_number) : null,
      }

      console.log('createArray', createArray);
      console.log('editArray', editArray);
      console.log('isEditCost', this.isEditCost);
      if (!this.isEditCost) {
        this.createContractTax(createArray);
      } else {
        this.editContractTax(editArray);
      }
      this.closeTaxModal();
    }
  }

  createContractTax(option) {
    this.settingsConfigService.post('/api/contract/payment/tax/create', option).subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('createContractTax res', res.data);
        console.log('创建合同支付税目  成功');
        this.getContractTax();
        this.getContractList();
        this.getContractPayDetail();
        this.msg.success('创建成功');
      }
    });
  }

  editContractTax(option) {
    this.settingsConfigService.post('/api/contract/payment/tax/update', option).subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('editContractTax res', res.data);
        console.log('修改合同支付税目  成功');
        this.getContractTax();
        this.getContractList();
        this.getContractPayDetail();
        this.msg.success('修改成功');
      }
    });
  }

  resetTaxForm(opt: any): void {
    console.log('resetTaxForm opt.contract_payment.id', opt.contract_payment.id);
    console.log('resetTaxForm listOfData', this.listOfData);
    console.log('opt...', opt)
    this.currentPayment = this.listOfData.filter(v => v.id === opt.contract_payment.id);
    const is_get_bill: boolean = opt.bill_category ? true : false;
    this.validateBillForm.patchValue({
      contract_payment_id: opt.contract_payment.cost.cost_category.id,
      bill_category_id: opt.bill_category?.id,
      exclude_tax_amount: is_get_bill ? opt.exclude_tax_amount : null,
      tax_amount: is_get_bill ? opt.tax_amount : null,
      amount: is_get_bill ? null : opt.amount,
      invoice_number: opt.invoice_number,
      is_get_bill,
    });
  }

  cancel(): void { }

  deleteTax(id: number): void {
    console.log('deleteid', id)
    console.log('listOfData', this.listOfTax)
    this.settingsConfigService.post('/api/contract/payment/tax/disable', { contract_payment_tax_id: id }).subscribe((res: ApiData) => {
      console.log('create res', res.data);
      if (res.code === 200) {
        console.log('禁用合同支付税目  成功');
        this.getContractPayDetail();
        this.getContractTax();
        this.getContractPayment();
        this.listOfTax = this.listOfTax.filter(v => v.id !== id);
      } else {
        this.submitLoading = false;
      }
    });
    this.msg.success('合同支付税目删除成功!');
  }

}
