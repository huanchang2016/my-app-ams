import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, forwardRef, TemplateRef, OnChanges, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-income-type-and-amount',
  templateUrl: './project-income-type-and-amount.component.html',
  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => ProjectIncomeTypeAndAmountComponent),
  //     multi: true
  //   },
  //   {
  //     provide: NG_VALIDATORS,
  //     useExisting: forwardRef(() => ProjectIncomeTypeAndAmountComponent),
  //     multi: true
  //   }
  // ]
})
export class ProjectIncomeTypeAndAmountComponent implements OnChanges, OnInit {

  @Input() taxList:any[];
  @Input() revenueId:number;

  @Output() incomeStatisticsChange:EventEmitter<any> = new EventEmitter();

  staticOpt:any = {
    pro_income: 0,
    tax_amount: 0,
    exclude_tax_income: 0 // 不含税收入
  };

  projectIncomeList:any[] = [];

  total:number = null;

  currentModalInfo:any = null;
  currentTax:any = null;

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private modalService: NzModalService
  ) {
    
    this.validateIncomeForm = this.fb.group({
      tax_id: [null, [Validators.required]],
      income: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    this.validateIncomeForm.valueChanges.subscribe( _ => {
      if(this.tax_id.value && this.income.value) {
        this.currentTax = this.taxList.filter(v => v.id === this.tax_id.value)[0];
        this.currentModalInfo = {
          rate: this.currentTax.rate * 100,
          invoice: this.currentTax.invoice,
          income: this.income.value * (1 - this.currentTax.rate)
        };
      }else {
        this.currentModalInfo = null;
      }
    })
  }

  get tax_id() {
    return this.validateIncomeForm.controls.tax_id;
  }

  get income() {
    return this.validateIncomeForm.controls.income;
  }

  ngOnChanges() {
    
  }

  ngOnInit() {
    if(this.revenueId) {
      this.getProjectIncomeList();
    }
  }

  getProjectIncomeList() {
    this.settingsConfigService.get(`/api/project_revenue_detail/revenue/${this.revenueId}`).subscribe((res:ApiData) => {
      console.log(res, '通过项目收入获取详情');
      if(res.code === 200) {
        this.projectIncomeList = res.data.project_revenue_detail;
        this.dealtaxList();
      }
    });
  }

  // 新增 预算成本
  tplModal: NzModalRef;

  validateIncomeForm:FormGroup;

  createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent, data?:any): void {
    this.currentTax = null;
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
    this.currentTax = null;
    this.tplModal.destroy();
    this.validateIncomeForm.reset();
  }


  countCostTotal() {
    this.total = this.projectIncomeList.map( v => v.exclude_tax_income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const pro_income = this.projectIncomeList.map( v => v.income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const tax_amount = this.projectIncomeList.map( v => v.tax_amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    this.staticOpt = {
      pro_income,
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
      // 添加成本预算后， 当前 成本类型就变成不可选
      this.taxList = this.taxList.map( v => {
        if(v.id === value.id) {
          v.active = true;
        }
        return v;
      });

      const income = +value.income;
      const tax_amount = this.currentTax.rate * income;
      const exclude_tax_income =income - tax_amount;

      const opt = {
        tax: this.currentTax,
        income: income,
        tax_amount: tax_amount,
        exclude_tax_income: exclude_tax_income
      };
      
      if(this.editDataInfo) {
        this.projectIncomeList = this.projectIncomeList.map( v => {
          if(v.tax.id === this.editDataInfo.tax.id) {
            v = Object.assign(v, opt);
          }

          return v;
        });
      }else {
        this.projectIncomeList = [...this.projectIncomeList, opt];
      }

      console.log('opt', this.currentTax, this.projectIncomeList);

      this.dealtaxList();
      // this.emitData();
      this.closeModal();
      this.incomeStatisticsChange.emit({ project_revenue_detail: this.projectIncomeList });
    }
  }

  editDataInfo:any = null;

  dealtaxList() {
    const list:any[] = this.taxList;
    this.taxList = list.map( v => {
      return {
        ...v,
        active: this.checkIsSelectedCost(v.id)
      }
    });
    this.countCostTotal();
  }

  checkIsSelectedCost(id:number):boolean {
    if(this.projectIncomeList && this.projectIncomeList.length !== 0) {
      return this.projectIncomeList.filter( v => v.tax.id === id).length > 0;
    }
    return false;
  }

  
  confirm(tax_id:number):void {
    this.projectIncomeList = this.projectIncomeList.filter( v => v.tax.id !== tax_id);
    this.dealtaxList();
    this.incomeStatisticsChange.emit({ project_revenue_detail: this.projectIncomeList });
  }

  cancel():void {}

  setForm() {
    console.log(this.editDataInfo);
    this.validateIncomeForm.patchValue({
      tax_id: this.editDataInfo.tax.id,
      income: this.editDataInfo.income
    });
  }

}
