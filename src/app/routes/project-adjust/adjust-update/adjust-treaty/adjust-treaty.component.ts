import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-adjust-treaty',
  templateUrl: './adjust-treaty.component.html',
  styles: [
  ]
})
export class AdjustTreatyComponent implements OnChanges, OnInit {

  @Input() adjustInfo:any;
  @Input() submitLoading:boolean;
  @Output() adjustmentChange:EventEmitter<any> = new EventEmitter();

  supplierList:any[] = []; // 供应商列表
  serviceCategoryList:any[] = []; // 供应商服务类型列表
  limtAmount:number; // 金额限制
  editData:any = null; // 当前编辑的 数据信息
  
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
      if(this.validateForm && this.adjustInfo.treaty_adjustment) {
        this.initForm();
      }
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm():void {
    this.validateForm = this.fb.group({
      treatyArr: this.fb.array([
        this.fb.group({
          treaty_id: [null], // 判断是否可以删除
          treaty_adjustment_id: [null],
          supplier_id: [null, [Validators.required]],
          service_category_id: [null, [Validators.required]],
          amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]] // this.confirmValidator, 金额限制 关闭 
        })
      ])
    });

    if(this.adjustInfo) {
      this.resetForm(this.adjustInfo.treaty_adjustment.treaty_adjustment);
      this.getConfigs();
      // this.countLimitAmount(); // 计算当前的金额限制
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
        treatyArr: opt.map( v => {
          return {
            treaty_id: v.treaty ? v.treaty.id : null, // 判断是否可以删除
            treaty_adjustment_id: v.id,
            supplier_id: v.supplier.id,
            service_category_id: v.service_category.id,
            amount: v.amount
          }
        })
      });
      this.countTotal();
    }
  }

  get formGroupArrayControls() {
    const group = this.validateForm.get('treatyArr') as FormArray;
    return group.controls;
  }

  add(e?:Event) {
    if(e) {
      e.preventDefault();
    }
    const groupArray:FormArray = this.validateForm.get('treatyArr') as FormArray;
    groupArray.push(
      this.fb.group({
        treaty_id: [null], // 判断是否可以删除
        treaty_adjustment_id: [null],
        supplier_id: [null, [Validators.required]],
        service_category_id: [null, [Validators.required]],
        amount: [null, [Validators.required, this.confirmValidator, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
      })
    )
    // this.countLimitAmount();
  }

  deleted(index: number, treaty_id:number | null): void {
    const groupArray:FormArray = this.validateForm.get('treatyArr') as FormArray;
    // 删除时需要判断 当前数据是否可以删除， 如果可以删除，则继续删除。
    // 如果不能删除，则提示用户，当前数据不可删除。
    if(treaty_id) {
      this.settingsConfigService.get(`/api/is_delete_treaty_adjustment/${treaty_id}`).subscribe((res:ApiData) => {
        const data = res.data;
        if(res.code === 200) {
          if(data.delete) {
            groupArray.removeAt(index);
            this.countTotal();
          }else {
            this.msg.warning(data.msg);
          }
          
        }else {
          this.msg.warning(res.error || '删除失败');
        }
      })
    }else {
      groupArray.removeAt(index);
      this.countTotal();
    }
    
  }

  checkIsSelected(id: number): boolean {
    const treatyArr:any[] = this.validateForm.value.treatyArr;
    if (treatyArr && treatyArr.length !== 0) {
      return treatyArr.filter(v => v.supplier_id === id).length > 0;
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
      const treatyArr: any = this.validateForm.value.treatyArr;
      const treatyList:any[] = treatyArr.map( v => {
        return {
          treaty_adjustment_id: v.treaty_adjustment_id,

          supplier_id: v.supplier_id,
          service_category_id: v.service_category_id,
          amount: +v.amount
        }
      });
      let option:any = {
        adjustment_id: this.adjustInfo.id,
        category_name: '非合约调整',
        
        treaty_adjustments: treatyList
      };

      // this.submitLoading = true;
      this.adjustmentChange.emit(option);
        
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  cancel():void {}

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (+control.value > this.limtAmount) {
      return { confirm: true, error: true };
    }
    return {};
  };

  total:number = 0;
  countTotal():void {
    const list:any[] = this.validateForm.get('treatyArr').value;
    this.total = list.filter(v => v.amount).map( item => Number(item.amount) ).reduce((a:number, b:number) => a + b, 0);
    
    // this.countLimitAmount();
  }

  getConfigs():void {
    this.settingsConfigService.get('/api/company/supplier/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        let data:any[] = res.data.company;
        this.supplierList = data.filter(v => v.active).sort((a:any, b:any) => a.sequence - b.sequence);
      }
    })
    this.settingsConfigService.get(`/api/service/category/${this.adjustInfo.project.company.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const list:any[] = res.data.service_category;
        this.serviceCategoryList = list.filter( v => v.active );
      }
    });
  }
  
  countLimitAmount() {
     // 计算 限制金额  重新获取最新的 预算（成本）金额信息计算
     this.settingsConfigService.get(`/api/project/detail/${this.adjustInfo.project.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const info:any = res.data;
        this.limtAmount = info.budget.cost_amount - info.budget.surplus_cost_amount;
        if(this.editData) {
          this.limtAmount = this.limtAmount + this.editData.amount;
        }
      }
    })
  }
}
