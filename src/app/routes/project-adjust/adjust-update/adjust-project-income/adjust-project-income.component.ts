import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-adjust-project-income',
  templateUrl: './adjust-project-income.component.html',
})
export class AdjustProjectIncomeComponent implements OnInit {

  @Input() adjustInfo:any;

  projectIncomeList:any[] = [];
  taxList:any[] = [];
  
  validateForm: FormGroup;

  submitLoading:boolean = false;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) {
    this.getConfigs();
  }


  ngOnInit(): void {
    
    const partyB:string = this.settings.user.company ? this.settings.user.company.name : null;

    this.validateForm = this.fb.group({
      customer_ids: [null, [Validators.required]],  // 甲方
      partyA_power: [null ],  // 甲方权责界定
      partyA_condition: [null ], // 甲方费用支付条件
      partyB: [{value: partyB, disabled: true }, [Validators.required]], // 乙方
      partyB_power: [null ], // 乙方服务内容
      partyB_condition: [null ], // 乙方服务 附加条件
      incomeArr: this.fb.array([
        this.fb.group({
          tax_id: [null, [Validators.required]],
          income: [null, [Validators.required]]
        })
      ])
    });

    if(this.adjustInfo) {
      this.getProjectIncomeList();
      this.resetForm(this.adjustInfo.project_revenue_adjustment);
    }

  }


  resetForm(opt: any): void {
    const cus_ids:number[] = opt.customers.map( v => v.id );
    this.validateForm.patchValue({
      customer_ids: cus_ids,
      partyA_power: opt.partyA_power,
      partyA_condition: opt.partyA_condition,
      // partyB: opt.partyB,
      partyB_power: opt.partyB_power,
      partyB_condition: opt.partyB_condition
    });
  }

  get formGroupArrayControls() {
    const group = this.validateForm.get('incomeArr') as FormArray;
    return group.controls;
  }

  add(e?:Event) {
    if(e) {
      e.preventDefault();
    }
    const groupArray:FormArray = this.validateForm.get('incomeArr') as FormArray;
    groupArray.push(
      this.fb.group({
        tax_id: [null, [Validators.required]],
        income: [null, [Validators.required]]
      })
    )
  }
  
  deleted(index: number): void {
    const groupArray:FormArray = this.validateForm.get('incomeArr') as FormArray;

    groupArray.removeAt(index);
  }

  checkIsSelectedCost(id: number): boolean {
    if (this.projectIncomeList && this.projectIncomeList.length !== 0) {
      return this.projectIncomeList.filter(v => v.tax.id === id).length > 0;
    }
    return false;
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

  currentTaxChange(id:number):string {
    if(id) {
      return (this.taxList.filter( v => v.id === id)[0].rate * 100) + '%';
    }
    return '';
  }

  getConfigs():void {
    // 获取税目类型列表
    if(this.settings.user.department) {
      this.settingsConfigService.get(`/api/tax/department/${this.settings.user.department.id}`).subscribe((res: ApiData) => {
        if (res.code === 200) {
          let data: any[] = res.data.tax;
          this.taxList = data.filter(v => v.active);
        }
      });
    }
  }
  
  getProjectIncomeList() {
    this.settingsConfigService.get(`/api/project_revenue_detail_adjustment/${this.adjustInfo.project_revenue_adjustment.id}`).subscribe((res:ApiData) => {
      // console.log(res, '通过项目收入获取详情');
      if(res.code === 200) {
        this.projectIncomeList = res.data.project_revenue_detail_adjustment;
        // this.countCostTotal();

        if(this.projectIncomeList.length !== 0) {
          // 给表单组赋值
          this.projectIncomeList.forEach( (el, index) => {
            if(index > 0) {
              this.add();
            }
          })
          this.validateForm.patchValue({
            incomeArr: this.projectIncomeList.map( v => {
              return {
                tax_id: v.tax.id,
                income: v.income
              }
            })
          })
          
          console.log(this.validateForm.value)
        }
      }
    });
  }

}
