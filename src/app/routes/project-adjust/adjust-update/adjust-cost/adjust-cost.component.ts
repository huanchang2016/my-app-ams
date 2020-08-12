import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-adjust-cost',
  templateUrl: './adjust-cost.component.html',
  styles: [
  ]
})
export class AdjustCostComponent implements OnChanges, OnInit {

  @Input() adjustInfo:any;
  @Input() submitLoading:boolean;
  @Output() adjustmentChange:EventEmitter<any> = new EventEmitter();

  costCategoryArr:any[] = [];
  
  validateForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) {
    if(this.settings.user.company) {
      this.getConfigs(this.settings.user.company.id);
    }
  }

  ngOnChanges() {
    if(this.adjustInfo) {
      // this.submitLoading = false;
      if(this.validateForm && this.adjustInfo.cost_adjustment) {
        this.initForm();
      }
    }
  }

  ngOnInit(): void {

    this.initForm();

  }

  initForm():void {
    this.validateForm = this.fb.group({
      costArr: this.fb.array([
        this.fb.group({
          cost_id: [null], // 判断是否可以删除
          cost_adjustment_id: [null],
          cost_category: [null, [Validators.required]],
          amount: [null, [Validators.required]]
        })
      ])
    });

    if(this.adjustInfo && this.adjustInfo.cost_adjustment) {
      // this.costList = this.adjustInfo.cost_adjustment.cost;
      this.resetForm(this.adjustInfo.cost_adjustment.cost_adjustment);
    }
  }


  resetForm(opt: any[]): void {
    if(opt.length !== 0) {
      // 给表单组赋值
      opt.forEach( (el, index) => {
        if(index > 0) {
          this.add();
        }
      })
      this.validateForm.patchValue({
        costArr: opt.map( v => {
          return {
            cost_id: v.cost ? v.cost.id : null,
            cost_adjustment_id: v.id,
            cost_category: v.cost_category.id,
            amount: v.amount
          }
        })
      });
      this.countTotal();
    }
  }

  get formGroupArrayControls() {
    const group = this.validateForm.get('costArr') as FormArray;
    return group.controls;
  }

  add(e?:Event) {
    if(e) {
      e.preventDefault();
    }
    const groupArray:FormArray = this.validateForm.get('costArr') as FormArray;
    groupArray.push(
      this.fb.group({
        cost_id: [null], // 判断是否可以删除
        cost_adjustment_id: [null],
        cost_category: [null, [Validators.required]],
        amount: [null, [Validators.required]]
      })
    )
  }
  
  deleted(index: number, cost_id:number | null): void {
    const groupArray:FormArray = this.validateForm.get('costArr') as FormArray;
    // 删除时需要判断 当前数据是否可以删除， 如果可以删除，则继续删除。
    // 如果不能删除，则提示用户，当前数据不可删除。
    if(cost_id) {
      this.settingsConfigService.get(`/api/is_delete_cost_adjustment/${cost_id}`).subscribe((res:ApiData) => {
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

  checkIsSelectedCost(id: number): boolean {
    const costList:any[] = this.validateForm.value.costArr;
    if(costList && costList.length !== 0) {
      return costList.filter(v => v.cost_category === id).length > 0;
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


    if (this.validateForm.valid) {
      // 处理 表单组 里面的数据
      const costArr: any = this.validateForm.value.costArr;
      const costArrList:any[] = costArr.map( v => {
        return {
          cost_category_id: v.cost_category,
          cost_adjustment_id: v.cost_adjustment_id,
          amount: +v.amount
        }
      });
      let option:any = {
        adjustment_id: this.adjustInfo.id,
        category_name: '成本调整',

        cost_adjustments: costArrList
      };

      // this.submitLoading = true;
      this.adjustmentChange.emit(option);
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  cancel():void {}

  getConfigs(id:number):void {
    this.settingsConfigService.get(`/api/cost/category/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.costCategoryArr = res.data.cost_category;
        this.dealCostCategoryArr();
      }
    })
  }

  dealCostCategoryArr() {
    const list:any[] = this.costCategoryArr;
    this.costCategoryArr = list.map( v => {
      return {
        id: v.id,
        name: v.name,
        active: this.checkIsSelectedCost(v.id)
      }
    })
  }

  total:number = 0;
  countTotal():void {
    const list:any[] = this.validateForm.get('costArr').value;
    this.total = list.filter(v => v.amount).map( item => Number(item.amount) ).reduce((a:number, b:number) => a + b, 0);
  }
  
}
