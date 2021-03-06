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

  // 新增 预算成本
  tplModal: NzModalRef;

  validateIncomeForm:FormGroup;

  createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent, data?:any, index?:number): void {
    if(data) {
      this.editDataInfo = data;
      this.editIndex = index;
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
    this.editIndex = -1;
    this.tplModal.destroy();
    this.validateIncomeForm.reset();
  }
  staticOpt:any = {
    sub_income: 0,
    tax_amount: 0,
    exclude_tax_income: 0 // 不含税收入
  };

  countCostTotal() {
    this.total = this.subsidyIncomeList.map( v => v.exclude_tax_income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const sub_income = this.subsidyIncomeList.map( v => v.income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const tax_amount = this.subsidyIncomeList.map( v => v.tax_amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    this.staticOpt = {
      sub_income,
      tax_amount,
      exclude_tax_income: this.total // 不含税收入
    };
  }
  submitForm(): void {
    for (const key in this.validateIncomeForm.controls) {
      this.validateIncomeForm.controls[key].markAsDirty();
      this.validateIncomeForm.controls[key].updateValueAndValidity();
    }
    if(this.validateIncomeForm.valid) {
      const value = this.validateIncomeForm.value;
      
      
      const income = +value.income;
      const is_bill = this.is_bill.value;
      const tax_rate = is_bill ? this.tax_rate.value : 0;
      const tax_amount = is_bill ? (income * tax_rate) : 0;
      const exclude_tax_income = income - tax_amount;

      const opt = {
        income: Number(value.income),
        is_bill: this.is_bill.value,
        tax_rate: this.tax_rate.value,
        tax_amount: tax_amount,
        exclude_tax_income: exclude_tax_income
      };
      
      if(this.editDataInfo && this.editIndex !== -1) {
        this.subsidyIncomeList = this.subsidyIncomeList.map( (v:any, i:number) => {
          if(this.editIndex === i) {
            v = Object.assign(v, opt);
          }

          return v;
        });
      }else {
        this.subsidyIncomeList = [...this.subsidyIncomeList, opt];
      }
      console.log('opt', opt, value);
      this.countCostTotal();
      this.closeModal();
      this.incomeStatisticsChange.emit({ subsidy_income_detail: this.subsidyIncomeList });
    }
  }


  editDataInfo:any = null;
  editIndex:number = -1;
  
  confirm(index:number):void {
    this.subsidyIncomeList.splice(index, 1);
    this.countCostTotal();
    this.incomeStatisticsChange.emit({ project_revenue_detail: this.subsidyIncomeList });
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
