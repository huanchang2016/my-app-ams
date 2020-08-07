import { Component, OnInit, Input } from '@angular/core';
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
export class AdjustCostComponent implements OnInit {

  @Input() adjustInfo:any;

  costList:any[] = [];
  costCategoryArr:any[] = [];
  
  validateForm: FormGroup;

  submitLoading:boolean = false;

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


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      costArr: this.fb.array([
        this.fb.group({
          cost_category: [null, [Validators.required]],
          amount: [null, [Validators.required]]
        })
      ])
    });

    if(this.adjustInfo) {
      this.costList = this.adjustInfo.cost_adjustment.cost;
      this.resetForm(this.adjustInfo.cost_adjustment.cost);
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
            cost_category: v.cost_category.id,
            amount: v.amount
          }
        })
      });
      console.log(this.validateForm.value);
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
        cost_category: [null, [Validators.required]],
        amount: [null, [Validators.required]]
      })
    )
  }
  
  deleted(index: number): void {
    const groupArray:FormArray = this.validateForm.get('costArr') as FormArray;
    groupArray.removeAt(index);
    this.countTotal();
  }

  checkIsSelectedCost(id: number): boolean {
    if (this.costList && this.costList.length !== 0) {
      return this.costList.filter(v => v.cost_category.id === id).length > 0;
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
      // const costArr:any[] = this.validateForm.get('costArr').value;
      // const project:any[] = costArr.map( v => {
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

  getConfigs(id:number):void {
    this.settingsConfigService.get(`/api/cost/category/${id}`).subscribe((res:ApiData) => {
      // console.log(res);
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
    const list:any[] = this.formGroupArrayControls;
    this.total = list.filter(v => v.amount).map( num => +num ).reduce((a:number, b:number) => a + b, 0);
  }
  
}
