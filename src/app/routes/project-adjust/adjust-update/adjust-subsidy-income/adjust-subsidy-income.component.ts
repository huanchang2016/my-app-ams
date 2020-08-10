import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-adjust-subsidy-income',
  templateUrl: './adjust-subsidy-income.component.html',
})
export class AdjustSubsidyIncomeComponent implements OnInit {

  @Input() adjustInfo:any;

  subsidyIncomeList:any[] = [];
  
  validateForm: FormGroup;

  submitLoading:boolean = false;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) { }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      company_id: [null, [Validators.required]],
      name: [null, [Validators.required]],
      condition: [null, [Validators.required]],
      calculation_basis: [null, [Validators.required]],
      remark: [null, [Validators.required]],

      incomeArr: this.fb.array([
        this.fb.group({
          income: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
          is_bill: [null, [Validators.required]],
          tax_rate: [null]
        })
      ])
    });

    if(this.adjustInfo) {
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
        income: [null, [Validators.required]],
        is_bill: [null, [Validators.required]],
        tax_rate: [null]
      })
    )
  }
  
  deleted(index: number): void {
    const groupArray:FormArray = this.validateForm.get('incomeArr') as FormArray;

    groupArray.removeAt(index);
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

    console.log(this.validateForm, 'submit');

    if (this.validateForm.valid) {
      let opt: any = this.validateForm.value;
      
      // 处理 表单组 里面的数据
      // const incomeArr:any[] = this.validateForm.get('incomeArr').value;
      // const project:any[] = incomeArr.map( v => {
      //   return {
      //     name: v.projectName,
      //     start_time: v.projectRangeDate[0],
      //     end_time: v.projectRangeDate[1],
      //     description: v.projectDescription
      //   }
      // });
        
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  cancel():void {}

  
  getProjectIncomeList() {
    this.settingsConfigService.get(`/api/subsidy_income_detail_adjustment/${this.adjustInfo.subsidy_income_adjustment.id}`).subscribe((res:ApiData) => {
      // console.log(res, '通过项目收入获取详情');
      if(res.code === 200) {
        this.subsidyIncomeList = res.data.subsidy_income_detail_adjustment;
        // this.countCostTotal();

        if(this.subsidyIncomeList.length !== 0) {
          // 给表单组赋值
          this.subsidyIncomeList.forEach( (el, index) => {
            if(index > 0) {
              this.add();
            }
          })
          this.validateForm.patchValue({
            incomeArr: this.subsidyIncomeList.map( v => {
              return {
                income: v.income,
                is_bill: v.is_bill,
                tax_rate: v.tax_rate
              }
            })
          })
          
          console.log(this.validateForm.value)
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
