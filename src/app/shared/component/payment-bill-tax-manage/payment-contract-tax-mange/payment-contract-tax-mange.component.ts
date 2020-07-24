import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ApiData, List } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-payment-contract-tax-mange',
  templateUrl: './payment-contract-tax-mange.component.html',
  styles: [
  ]
})
export class PaymentContractTaxMangeComponent implements OnInit {
  @Input() listOfData?: any[];

  @Input() contract_pay_id?: number;

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

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.getContractTax();
    console.log("最下层组件 listOfData", this.listOfData);
    console.log("最下层组件 listOfTax", this.listOfTax);
  }
  getContractTax() {
    console.log('this.contract_pay_id', this.contract_pay_id);
    this.settingsConfigService.get(`/api/contract/payment/tax/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付税目列表');
        if (res.code === 200) {
          const contractTax: any[] = res.data.contract_payment_tax;
          this.listOfTax = contractTax;
          console.log('getContractTax listOfTax', this.listOfTax)
        }
      })
  }

  // 发票台账
  addBillTicket(e: MouseEvent): void {
    e.preventDefault();
    this.billModal = this.modalService.create({
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
    // console.log('发票台账costArr', this.costArr)
    console.log('1this.contract_payment_id', this.contract_payment_id)
    this.listOfData.map(v => { this.contract_payment_id = v.id })
    console.log('2this.contract_payment_id', this.contract_payment_id)

  }

  editBillTicket(data: any, i): void {
    this.isEditCost = true;
    this.contract_payment_id = this.listOfTax[i].id;
    this.contract_payment_tax_id = data.id;
    console.log('contract_payment_tax_id', this.contract_payment_tax_id);
    console.log('editBillTicket data', data);
    this.resetTaxForm(data);
    this.billModal = this.modalService.create({
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  resetTaxForm(opt: any): void {
    console.log('resetTaxForm opt.contract_payment.id', opt.contract_payment.id);
    console.log('resetTaxForm listOfData', this.listOfData);
    [this.currentPayment] = this.listOfData.filter(v => v.id === opt.contract_payment.id);
    const is_get_bill: boolean = opt.bill_category ? true : false;
    this.validateBillForm.patchValue({
      contract_payment_id: opt.contract_payment.cost.cost_category.id,
      bill_category_id: opt.bill_category.id,
      exclude_tax_amount: is_get_bill ? opt.exclude_tax_amount : null,
      tax_amount: is_get_bill ? opt.tax_amount : null,
      amount: is_get_bill ? null : opt.amount,
      index: opt.index,
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
        this.listOfTax = this.listOfTax.filter(v => v.id !== id);
      } else {
        this.submitLoading = false;
      }
    });
    this.msg.success('合同支付税目删除成功!');
  }

}
