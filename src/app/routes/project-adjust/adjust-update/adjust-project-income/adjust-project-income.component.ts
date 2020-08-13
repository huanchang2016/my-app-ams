import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-adjust-project-income',
  templateUrl: './adjust-project-income.component.html',
})
export class AdjustProjectIncomeComponent implements OnChanges, OnInit {

  @Input() adjustInfo:any;
  @Output() adjustmentChange:EventEmitter<any> = new EventEmitter();
  @Output() adjustmentIncomeChange:EventEmitter<any> = new EventEmitter();
  @Output() adjustmentIncomeDeleted:EventEmitter<any> = new EventEmitter();

  taxList:any[] = [];
  
  validateForm: FormGroup;

  @Input() submitLoading:boolean;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) {
    this.getConfigs();
  }

  ngOnChanges() {
    if(this.adjustInfo) {
      // this.submitLoading = false;
      if(this.validateForm) {
        this.initForm();
      }
    }
  }

  ngOnInit(): void {
    
    this.initForm();

  }
  initForm():void {
    const partyB:string = this.settings.user.company ? this.settings.user.company.name : null;

    this.validateForm = this.fb.group({
      customer_ids: [null, [Validators.required]],  // 甲方
      partyA_power: [null ],  // 甲方权责界定
      partyA_condition: [null ], // 甲方费用支付条件
      partyB: [ {value: partyB, disabled: true }, [Validators.required]], // 乙方
      partyB_power: [null ], // 乙方服务内容
      partyB_condition: [null ], // 乙方服务 附加条件
      incomeArr: this.fb.array([
        this.fb.group({
          project_revenue_detail_id: [null], // 判断是否可以删除的  id
          project_revenue_detail_adjustment_id: [null], // 传递值  id
          tax_id: [null, [Validators.required]],
          income: [null, [Validators.required]]
        })
      ])
    });

    // this.validateForm.get('partyB').disabled;
    
    if(this.adjustInfo.project_revenue_adjustment) {
      this.getProjectIncomeList();
      this.resetForm(this.adjustInfo.project_revenue_adjustment);
    }
  }


  resetForm(opt: any): void {
    let cus_ids:number[] = opt.customers.map( v => v.id );
    // if(opt.customers) {
    //   cus_ids = opt.customers.map( v => v.id );
    // }else {
    //   cus_ids = opt.customer_ids;
    // }
    
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
        project_revenue_detail_id: [null],
        project_revenue_detail_adjustment_id: [null],
        tax_id: [null, [Validators.required]],
        income: [null, [Validators.required]]
      })
    )
  }

  checkIsSelectedCost(id: number): boolean {
    // if (this.projectIncomeList && this.projectIncomeList.length !== 0) {
    //   return this.projectIncomeList.filter(v => v.tax.id === id).length > 0;
    // }
    const incomeArr:any[] = this.validateForm.value.incomeArr;
    if(incomeArr && incomeArr.length !== 0) {
      return incomeArr.filter(v => v.tax_id === id).length > 0;
    }
    return false;
  }
  
  deleted(index: number, project_revenue_detail_id:number | null): void {
    const groupArray:FormArray = this.validateForm.get('incomeArr') as FormArray;
    // 删除时需要判断 当前数据是否可以删除， 如果可以删除，则继续删除。
    // 如果不能删除，则提示用户，当前数据不可删除。
    if(project_revenue_detail_id) {
      this.settingsConfigService.get(`/api/is_delete_project_revenue_detail/${project_revenue_detail_id}`).subscribe((res:ApiData) => {
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
          project_revenue_detail_adjustment_id: v.project_revenue_detail_adjustment_id,
          tax_id: v.tax_id,
          income: +v.income
        }
      });

      const option:any = {
        adjustment_id: this.adjustInfo.id,

        customer_ids: value.customer_ids,
        partyB: this.validateForm.get('partyB').value,
        partyA_power: value.partyA_power,
        partyB_power: value.partyB_power,
        partyA_condition: value.partyA_condition,
        partyB_condition: value.partyB_condition,
        project_revenue_detail_adjustments: incomeTaxList
      }

      console.log(option, 'sl', value);

      if(this.adjustInfo.project_revenue_adjustment) {
        const updateObj:any = Object.assign(option, {
          category_name: '项目收入调整',
          project_revenue_adjustment_id: this.adjustInfo.project_revenue_adjustment.id,
        });
        this.adjustmentChange.emit(updateObj);

      } else {
        const createObj:any = option;

        this.adjustmentIncomeChange.emit({
          data: createObj,
          type: 'project'
        });
      }
      
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  

  deletedIncome():void {
    const opt:any = { project_revenue_adjustment_id: this.adjustInfo.project_revenue_adjustment.id };
    this.adjustmentIncomeDeleted.emit({ data: opt, type: 'project' });
  }

  cancel():void {}

  currentTaxChange(id:number):string {
    if(id) {
      const items:any[] = this.taxList.filter( v => v.id === id);
      if(items.length !== 0) {
        return (items[0].rate * 100) + '%';
      }
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
  
  incomeListLoading:boolean = false;
  getProjectIncomeList() {
    this.incomeListLoading = true;
    this.settingsConfigService.get(`/api/project_revenue_detail_adjustment/${this.adjustInfo.project_revenue_adjustment.id}`).subscribe((res:ApiData) => {
      this.incomeListLoading = false;
      if(res.code === 200) {
         const projectIncomeList = res.data.project_revenue_detail_adjustment.filter( v => v.active );

        if(projectIncomeList.length !== 0) {
          // 给表单组赋值
          const _incomeArr:any[] = this.validateForm.get('incomeArr').value;
          projectIncomeList.forEach( (el, index) => {
            if(index > 0 && _incomeArr.length < projectIncomeList.length) {
              // 表单组元素长度 小于 数据长度时新增
              this.add();
            }
          });
          this.validateForm.patchValue({
            incomeArr: projectIncomeList.map( v => {
              return {
                project_revenue_detail_id: v.project_revenue_detail ? v.project_revenue_detail.id : null, // 判断是否可以删除的  id
                project_revenue_detail_adjustment_id: v.id,
                tax_id: v.tax.id,
                income: v.income
              }
            })
          })
          
        }
      }
    });
  }

}
