import { Component, Input, OnChanges, Output, EventEmitter, TemplateRef } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData, List } from 'src/app/data/interface.data';

@Component({
  selector: 'app-users-bill-execute-flow',
  templateUrl: './users-bill-execute-flow.component.html',
  styles: [
    `
      .check-box {
        width: 300px;
      }
    `
  ]
})
export class UsersBillExecuteFlowComponent implements OnChanges {
  @Output() private outer = new EventEmitter();

  // 执行情况：
  //    如果执行成功，需要填写  发票号码 发票金额(不含税)  税额 
  //    如果 未执行 ，需要填写 不能执行的原因
  // checkOption: any = {
  //   is_execute: 'A',
  //   remark: '', // 备注原因
  //   invoice_number: null, // 发票号码
  //   invoice_amount: null, // 发票金额
  //   tax_amount: null // 发票税额
  // }

  constructor(
    public msg: NzMessageService,
    private settings: SettingsService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
  ) { }
  @Input() progressInfo: any;

  @Input() billInfo: any;

  @Output() executeChange: EventEmitter<any> = new EventEmitter();

  @Output() executeName: EventEmitter<any> = new EventEmitter();

  nodeProcess: any[] = [];

  isExecuteUser = false;

  invoiceOfData: any[] = [];  //  发票列表

  billModal: NzModalRef;

  isEditCost: true;

  validateForm!: FormGroup;

  bill_invoice_id: null;

  isCreate = true;

  totalAmountError: boolean;

  billAmount: any;

  ngOnChanges() {
    if (this.progressInfo) {
      console.log(this.progressInfo, 'app-users-execute-flow');
      this.nodeProcess = [this.progressInfo.execute_user];
      this.isExecuteUser = this.progressInfo.execute_user.id === this.settings.user.id;
    }
    if (this.billInfo) {
      this.getBillInvoice();
    }
  }

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      is_execute: ['A', [Validators.required]],
      remark: [null],
      invoice_number: [null, [Validators.required]],
      invoice_amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      tax_amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]]
    });

    this.validateForm.get('is_execute').valueChanges.subscribe(val => {
      if (val === 'B') {
        this.validateForm.get('invoice_number')!.clearValidators();
        this.validateForm.get('invoice_number')!.markAsPristine();

        this.validateForm.get('invoice_amount')!.clearValidators();
        this.validateForm.get('invoice_amount')!.markAsPristine();

        this.validateForm.get('tax_amount')!.clearValidators();
        this.validateForm.get('tax_amount')!.markAsPristine();


        this.validateForm.get('remark')!.setValidators(Validators.required);
        this.validateForm.get('remark')!.markAsDirty();
      } else {
        this.validateForm.get('invoice_number')!.setValidators(Validators.required);
        this.validateForm.get('invoice_number')!.markAsDirty();

        this.validateForm.get('invoice_amount')!.setValidators(Validators.required);
        this.validateForm.get('invoice_amount')!.markAsDirty();

        this.validateForm.get('tax_amount')!.setValidators(Validators.required);
        this.validateForm.get('tax_amount')!.markAsDirty();


        this.validateForm.get('remark')!.clearValidators();
        this.validateForm.get('remark')!.markAsPristine();
      }
      this.validateForm!.updateValueAndValidity();
    });

    this.validateForm.get('invoice_amount').valueChanges.subscribe(v => {
      // const _amount = Number(v) || 0;
      // const _tax_amount = (_amount * this.billInfo.tax.rate).toFixed(2);
      // this.validateForm.patchValue({
      //   tax_amount: _tax_amount
      // })
      console.log('tax_amount value', this.validateForm.get('tax_amount').value);
    })

    this.validateForm.get('invoice_amount').valueChanges.subscribe(v => {
      const _amount = Number(v) || 0;
      const _tax_amount = (_amount / (1 + (this.billInfo.tax ? this.billInfo.tax.rate : this.billInfo.subsidy_income_detail.tax_rate)) * (this.billInfo.tax ? this.billInfo.tax.rate : this.billInfo.subsidy_income_detail.tax_rate)).toFixed(2);
      this.validateForm.patchValue({
        tax_amount: _tax_amount
      })
      console.log('正在监听税额', this.validateForm.get('invoice_amount').value);
    })
  }

  getBillInvoice() {
    console.log('getBillInvoice billInfo.....', this.billInfo);
    this.billAmount = this.billInfo.amount - this.billInfo.invoice_amount;
    this.settingsConfigService.get(`/api/bill_invoice/${this.billInfo.id}`).subscribe((res: ApiData) => {
      console.log('getBillInvoice', res.data);
      if (res.code === 200) {
        console.log('获取发票列表  成功');
        this.invoiceOfData = res.data.bill_invoice;
        console.log('this.invoiceOfData', this.invoiceOfData);
      }
    });
  }

  createBillTicket(billTitle: TemplateRef<{}>, billContent: TemplateRef<{}>, billFooter: TemplateRef<{}>, e: MouseEvent): void {
    e.preventDefault();
    this.isCreate = true;
    this.billModal = this.modalService.create({
      nzTitle: billTitle,
      nzContent: billContent,
      nzFooter: billFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  deleteInvoice(id: number) {
    this.settingsConfigService.post('/api/bill_invoice/disable', { bill_invoice_id: id }).subscribe((res: ApiData) => {
      console.log('deleteInvoice', res.data);
      if (res.code === 200) {
        console.log('删除发票  成功');
        this.getBillInvoice();
        this.outer.emit();
        this.msg.success('删除成功!');
      }
    });
  }

  edit(billTitle: TemplateRef<{}>, billContent: TemplateRef<{}>, billFooter: TemplateRef<{}>, data: any, i: any): void {
    // 将 之前 禁用的 成本类型  disabled  ===> false
    // this.isEditCost = true;
    // this.costArr = this.costArr.map(v => {
    //   if (v.id === data.cost.id) {
    //     v.disabled = true;
    //   }
    //   return v;
    // })
    // console.log('222this.costArr', this.costArr)
    // console.log('111data', data)
    // this.contract_payment_id = this.listOfData[i].id;
    // console.log('this.contract_payment_id by listOfData', this.contract_payment_id)
    this.isCreate = false;
    console.log('edit data', data);
    this.bill_invoice_id = data.id;
    this.resetForm(data);
    this.billModal = this.modalService.create({
      nzTitle: billTitle,
      nzContent: billContent,
      nzFooter: billFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  resetForm(opt: any): void {
    this.validateForm.patchValue({
      bill_invoice_id: opt.id,
      invoice_number: opt.invoice_number,
      invoice_amount: opt.invoice_amount,
      tax_amount: opt.tax_amount,
    })
  }

  closeModal(): void {
    this.billModal.destroy();
    this.validateForm.reset();
    this.validateForm.patchValue({ is_execute: 'A' });
  }

  handleOk(): void {
    this.submitForm();
  }


  submitForm(): void {
    console.log('submitForm billInfo', this.billInfo);
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log('submit', this.validateForm);

    if (this.validateForm.valid && !this.totalAmountError) {
      const value: any = this.validateForm.value;
      console.log('value', value);

      // 提交方法
      // const is_execute = {
      //   is_execute: this.validateForm.get('is_execute').value === 'A' ? true : false
      // }
      // const option = { ...this.validateForm.value, ...is_execute };
      // this.executeChange.emit(option);

      const createArray = {
        bill_id: this.billInfo.id,
        invoice_number: String(value.invoice_number),
        invoice_amount: this.toFixed(value.invoice_amount, 2),
        tax_amount: this.toFixed(value.tax_amount, 2),
      }

      const editArray = {
        bill_invoice_id: this.bill_invoice_id,
        invoice_number: String(value.invoice_number),
        invoice_amount: this.toFixed(value.invoice_amount, 2),
        tax_amount: this.toFixed(value.tax_amount, 2),
      }

      console.log('createArray', createArray);
      if (this.isCreate) {
        this.createInvoice(createArray);
      } else {
        this.editInvoice(editArray);
      }
      this.closeModal();
    }
  }
  toFixed(num, d) {
    num *= Math.pow(10, d);
    num = Math.round(num);
    return num / (Math.pow(10, d));
  }

  createInvoice(option) {
    this.settingsConfigService.post('/api/bill_invoice/create', option).subscribe((res: ApiData) => {
      console.log('createInvoice', res.data);
      if (res.code === 200) {
        console.log('新建发票  成功');
        this.getBillInvoice();
        this.outer.emit();
        this.msg.success('创建成功!');
      }
    });
  }

  editInvoice(option) {
    this.settingsConfigService.post('/api/bill_invoice/update', option).subscribe((res: ApiData) => {
      console.log('editInvoice', res.data);
      if (res.code === 200) {
        console.log('编辑发票  成功');
        this.getBillInvoice();
        this.outer.emit();
        this.msg.success('编辑成功!');
      }
    });
  }

  cancel() { }

  numChange() {
    const _invoice_amount: number = +this.validateForm.get('invoice_amount').value;
    const _tax_amount: number = +this.validateForm.get('tax_amount').value;
    if (_invoice_amount > this.billInfo.amount || _tax_amount > this.billInfo.amount || _invoice_amount < _tax_amount || _invoice_amount > this.billAmount) {
      this.totalAmountError = true;
    } else {
      this.totalAmountError = false;
    }
    // this.totalAmountError = (_invoice_amount + _tax_amount) > this.billInfo.amount;
    console.log('totalAmountError', this.totalAmountError)
  }

  submit() {
    const is_execute = {
      is_execute: this.validateForm.get('is_execute').value === 'A' ? true : false
    }
    const option = { ...this.validateForm.value, ...is_execute };
    this.executeChange.emit(option);
  }

}
