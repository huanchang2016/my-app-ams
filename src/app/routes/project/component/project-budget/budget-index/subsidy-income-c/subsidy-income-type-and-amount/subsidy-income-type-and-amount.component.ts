import { Component, TemplateRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalService, NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { ApiData } from 'src/app/data/interface.data';


@Component({
  selector: 'app-subsidy-income-type-and-amount',
  templateUrl: './subsidy-income-type-and-amount.component.html',
  styles: [
  ]
})
export class SubsidyIncomeTypeAndAmountComponent implements OnInit {

  @Input() subsidyId:number;
  @Output() incomeStatisticsChange:EventEmitter<any> = new EventEmitter();

  subsidyIncomeList:any[] = [];

  total:number = null;

  currentModalInfo:any = null;

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private modalService: NzModalService
  ) {
    
    this.validateIncomeForm = this.fb.group({
      income: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      is_bill: [null, [Validators.required]],
      tax_rate: [null ],
    });

    this.validateIncomeForm.valueChanges.subscribe( _ => {
      if(this.income.value && this.is_bill.value && this.tax_rate.value) {
        this.currentModalInfo = {
          income: +this.income.value,
          tax_rate: this.tax_rate.value,
          tax_amount: +this.income.value * this.tax_rate.value
        };
      }else {
        this.currentModalInfo = null;
      }
    })
  }

  
  isBillChange(required: boolean): void {
    if (!required) {
      this.validateIncomeForm.get('tax_rate')!.clearValidators();
      this.validateIncomeForm.get('tax_rate')!.markAsPristine();
    } else {
      this.validateIncomeForm.get('tax_rate')!.setValidators(Validators.required);
      this.validateIncomeForm.get('tax_rate')!.markAsDirty();
    }
    this.validateIncomeForm.get('tax_rate')!.updateValueAndValidity();
  }

  get income() {
    return this.validateIncomeForm.controls.income;
  }

  get is_bill() {
    return this.validateIncomeForm.controls.is_bill;
  }

  get tax_rate() {
    return this.validateIncomeForm.controls.tax_rate;
  }

  ngOnInit() {
    this.getsubsidyIncomeList();
  }

  getsubsidyIncomeList() {
    this.settingsConfigService.get(`/api/subsidy_income_detail/subsidy/${this.subsidyId}`).subscribe((res:ApiData) => {
      console.log(res, '通过补贴收入获取详情');
      if(res.code === 200) {
        this.subsidyIncomeList = res.data.subsidy_income_detail;
        this.countCostTotal();
      }
    });
  }
  
  deletedCostItem(i:number, id?:number) {
    if(id) {
      this.subsidyIncomeList.splice(i, 1);
    }
    this.countCostTotal();
  }

  // 新增 预算成本
  tplModal: NzModalRef;

  validateIncomeForm:FormGroup;

  createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent, data?:any): void {
    if(data) {
      this.editDataInfo = data;
      this.setForm();
    }
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

  handleOk(): void {
    this.submitForm();
  }

  closeModal(): void {
    this.editDataInfo = null;
    this.tplModal.destroy();
    this.validateIncomeForm.reset();
  }


  countCostTotal() {
    this.total = this.subsidyIncomeList.map( v => v.exclude_tax_income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const sub_income = this.subsidyIncomeList.map( v => v.income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const tax_amount = this.subsidyIncomeList.map( v => v.tax_amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    this.incomeStatisticsChange.emit({
      sub_income,
      tax_amount,
      exclude_tax_income: this.total // 不含税收入
    });
  }
  submitForm(): void {
    for (const key in this.validateIncomeForm.controls) {
      this.validateIncomeForm.controls[key].markAsDirty();
      this.validateIncomeForm.controls[key].updateValueAndValidity();
    }
    if(this.validateIncomeForm.valid) {
      const value = this.validateIncomeForm.value;
      
      let opt:any = {
        income: Number(value.income),
        is_bill: this.is_bill.value,
        tax_rate: this.is_bill.value ? this.tax_rate.value : 0
      };
      console.log('opt', opt, value);
      if(this.editDataInfo) {
        this.edit(opt);
      }else {
        this.create(opt);
      }
    }
  }

  create(obj:any) {
    const opt:any = Object.assign(obj, { subsidy_income_id: this.subsidyId })
    this.settingsConfigService.post(`/api/subsidy_income_detail/create`, opt).subscribe((res:ApiData) => {
      console.log(res);
      if(res.code === 200) {
        this.msg.success('添加成功');
        this.getsubsidyIncomeList();
        this.closeModal();
      }
    });
  }

  editDataInfo:any = null;

  edit(obj:any) {
    const opt:any = Object.assign(obj, { subsidy_income_detail_id: this.editDataInfo.id })
    this.settingsConfigService.post(`/api/subsidy_income_detail/update`, opt).subscribe((res:ApiData) => {
      console.log(res);
      if(res.code === 200) {
        this.msg.success('添加成功');
        this.getsubsidyIncomeList();
        this.closeModal();
      }
    });
  }
  
  confirm(id:number):void {
    const opt:any = { subsidy_income_detail_id: id };
    this.settingsConfigService.post('/api/subsidy_income_detail/disable', opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('禁用成功');
        this.getsubsidyIncomeList();
      }
    });
  }

  cancel():void {}

  setForm() {
    console.log(this.editDataInfo);
    this.validateIncomeForm.patchValue({
      income: this.editDataInfo.income,
      is_bill: this.editDataInfo.is_bill,
      tax_rate: this.editDataInfo.tax_rate
    });
  }
}
