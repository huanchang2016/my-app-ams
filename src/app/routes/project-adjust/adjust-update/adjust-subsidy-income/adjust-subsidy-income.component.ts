import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-adjust-subsidy-income',
  templateUrl: './adjust-subsidy-income.component.html',
})
export class AdjustSubsidyIncomeComponent implements OnChanges, OnInit {

  @Input() adjustInfo:any;
  @Input() submitLoading:boolean;
  @Output() adjustmentChange:EventEmitter<any> = new EventEmitter();
  
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) { }

  ngOnChanges() {
    if(this.adjustInfo) {
      // this.submitLoading = false;
      if(this.validateForm && this.adjustInfo.project_revenue_adjustment) {
        this.initForm();
      }
    }
  }

  ngOnInit(): void {

    this.initForm();

  }

  initForm():void {
    this.validateForm = this.fb.group({
      company_id: [null, [Validators.required]],
      name: [null, [Validators.required]],
      condition: [null, [Validators.required]],
      calculation_basis: [null, [Validators.required]],
      remark: [null, [Validators.required]],

      incomeArr: this.fb.array([
        this.fb.group({
          subsidy_income_detail_id: [null], // 判断收入是否可以删除  id
          income_detail_adjustment_id: [null],
          income: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
          is_bill: [null, [Validators.required]],
          tax_rate: [null]
        })
      ])
    });

    if(this.adjustInfo && this.adjustInfo.subsidy_income_adjustment) {
      this.getProjectIncomeList();
      this.resetForm(this.adjustInfo.subsidy_income_adjustment);
    }
  }

  resetForm(opt: any): void {
    this.validateForm.patchValue({
      company_id: opt.company.id,
      name: opt.name,
      condition: opt.condition,
      calculation_basis: opt.calculation_basis,
      remark: opt.remark
    });
  }

  get formGroupArrayControls() {
    const group = this.validateForm.get('incomeArr') as FormArray;
    return group.controls;
  }

  isBillChange(required: boolean, i:number): void {
    if (!required) {
      this.formGroupArrayControls[i].get('tax_rate')!.clearValidators();
      this.formGroupArrayControls[i].get('tax_rate')!.markAsPristine();
    } else {
      this.formGroupArrayControls[i].get('tax_rate')!.setValidators(Validators.required);
      this.formGroupArrayControls[i].get('tax_rate')!.markAsDirty();
    }
    this.formGroupArrayControls[i].get('tax_rate')!.updateValueAndValidity();
  }

  add(e?:Event) {
    if(e) {
      e.preventDefault();
    }
    const groupArray:FormArray = this.validateForm.get('incomeArr') as FormArray;
    groupArray.push(
      this.fb.group({
        subsidy_income_detail_id: [null], // 判断收入是否可以删除  id
        income_detail_adjustment_id: [null],
        income: [null, [Validators.required]],
        is_bill: [null, [Validators.required]],
        tax_rate: [null]
      })
    )
  }
  
  deleted(index: number, subsidy_income_detail_id:number | null): void {
    const groupArray:FormArray = this.validateForm.get('incomeArr') as FormArray;
    // 删除时需要判断 当前数据是否可以删除， 如果可以删除，则继续删除。
    // 如果不能删除，则提示用户，当前数据不可删除。
    if(subsidy_income_detail_id) {
      this.settingsConfigService.get(`/api/is_delete_subsidy_income_detail/${subsidy_income_detail_id}`).subscribe((res:ApiData) => {
        const data = res.data;
        if(res.code === 200) {
          if(data.delete) {
            groupArray.removeAt(index);
          }else {
            this.msg.warning(data.msg);
          }
          
        }else {
          this.msg.warning(res.error || '删除失败');
        }
      })
    }else {
      groupArray.removeAt(index);
    }
    
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    for (let i = 0; i < this.formGroupArrayControls.length; i++) {
      const element:any = this.formGroupArrayControls[i];
      for (const i in element.controls) {
        element.controls[i].markAsDirty();
        element.controls[i].updateValueAndValidity();
      }
    }


    if (this.validateForm.valid) {
      const value: any = this.validateForm.value;
      // 处理 表单组 里面的数据
      const incomeArr:any[] = value.incomeArr;
      const incomeTaxList:any[] = incomeArr.map( v => {
        return {
          income_detail_adjustment_id: v.income_detail_adjustment_id,
          is_bill: v.is_bill,
          tax_rate: v.is_bill ? v.tax_rate : 0,
          income: +v.income
        }
      });
      let option:any = {
        adjustment_id: this.adjustInfo.id,
        category_name: '补贴收入调整',

        subsidy_income_adjustment_id: this.adjustInfo.subsidy_income_adjustment.id,

        name: value.name,
        condition: value.condition,
        calculation_basis: value.calculation_basis,
        remark: value.remark,
        company_id: value.company_id,
        income_detail_adjustments: incomeTaxList
      };

      // this.submitLoading = true;
      this.adjustmentChange.emit(option);
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  cancel():void {}

  
  incomeListLoading:boolean = true;
  getProjectIncomeList() {
    this.incomeListLoading = true;
    this.settingsConfigService.get(`/api/subsidy_income_detail_adjustment/${this.adjustInfo.subsidy_income_adjustment.id}`).subscribe((res:ApiData) => {
    this.incomeListLoading = false;
      if(res.code === 200) {
        const incomeList:any[] = res.data.subsidy_income_detail_adjustment.filter(v => v.active);
        // this.countCostTotal();

        if(incomeList.length !== 0) {
          // 给表单组赋值
          const _incomeArr:any[] = this.validateForm.get('incomeArr').value;
          incomeList.forEach( (el, index) => {
            if(index > 0 && _incomeArr.length < incomeList.length) {
              // 表单组元素长度 小于 数据长度时新增
              this.add();
            }
          });
          this.validateForm.patchValue({
            incomeArr: incomeList.map( v => {
              return {
                subsidy_income_detail_id: v.subsidy_income_detail ? v.subsidy_income_detail.id : null, // 记录已有的数据id
                income_detail_adjustment_id: v.id,
                income: v.income,
                is_bill: v.is_bill,
                tax_rate: v.tax_rate
              }
            })
          })
          
        }
      }
    });
  }

  // totalOption:any = {
  //   income: 0,
  //   tax_amount: 0,
  //   exclude_tax_income: 0 // 不含税收入
  // };

  // countCostTotal() {
  //   const exclude_tax_income = this.subsidyIncomeList.map( v => v.exclude_tax_income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
  //   const income = this.subsidyIncomeList.map( v => v.income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
  //   const tax_amount = this.subsidyIncomeList.map( v => v.tax_amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
  //   this.totalOption = {
  //     income: income,
  //     tax_amount: tax_amount,
  //     exclude_tax_income: exclude_tax_income
  //   };
  // }
}
