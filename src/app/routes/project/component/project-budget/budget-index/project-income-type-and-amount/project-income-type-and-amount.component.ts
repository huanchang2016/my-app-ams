import { Component, forwardRef, TemplateRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-income-type-and-amount',
  templateUrl: './project-income-type-and-amount.component.html',
  styles: [
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProjectIncomeTypeAndAmountComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ProjectIncomeTypeAndAmountComponent),
      multi: true
    }
  ]
})
export class ProjectIncomeTypeAndAmountComponent implements ControlValueAccessor {
  incomeCategoryArr:any[] = [];
  
  projectIncomeType:any [] = [];

  total:number = null;

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private settingsConfigService: SettingsConfigService,
    private modalService: NzModalService
  ) {
    if(this.settings.user.company) {
      // this.getConfigs(this.settings.user.company.id);
    }
    
    this.validateCostForm = this.fb.group({
      cost_category: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });
  }
  
  private propagateChange = (_: any) => { };


  writeValue(obj: any[]): void {
    this.projectIncomeType = obj || [];
    if(this.projectIncomeType && this.projectIncomeType.length !== 0) {
      this.countCostTotal();
      this.dealIncomeCategoryArr();
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  validate(control: AbstractControl): ValidationErrors | null {
    if(control.errors && control.errors.required) {
      return this.projectIncomeType && this.projectIncomeType.length !== 0 ? null : {
        isInvalid: {
          valid: false
        }
      }
    }else {
      return null;
    }
  }

  
  deletedCostItem(i:number, id?:number) {
    if(id) {
      this.projectIncomeType.splice(i, 1);
      this.dealIncomeCategoryArr();
    }
    this.emitData();
  }

  // 新增 预算成本
  tplModal: NzModalRef;

  validateCostForm:FormGroup;

  createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent): void {
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
    this.tplModal.destroy();
    this.validateCostForm.reset();
  }


  emitData():void {
    this.projectIncomeType = this.projectIncomeType.map( v => {
      v.amount = Number(v.amount);
      return v;
    })
    this.countCostTotal();
    this.propagateChange(this.projectIncomeType);
  }

  countCostTotal() {
    this.total = this.projectIncomeType.map( v => v.amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
  }
  submitForm(): void {
    for (const key in this.validateCostForm.controls) {
      this.validateCostForm.controls[key].markAsDirty();
      this.validateCostForm.controls[key].updateValueAndValidity();
    }
    if(this.validateCostForm.valid) {
      const value = this.validateCostForm.value;
      const cost:any = this.incomeCategoryArr.filter( v => v.id === value.cost_category)[0];
      // 添加成本预算后， 当前 成本类型就变成不可选
      this.incomeCategoryArr = this.incomeCategoryArr.map( v => {
        if(v.id === value.cost_category) {
          v.active = true;
        }
        return v;
      });
      
      let opt:any = {
        cost_category: cost,
        amount: Number(value.amount)
      };
      console.log('opt', opt, this.projectIncomeType);
      this.projectIncomeType.push(opt);
      this.emitData();
      this.closeModal();
    }
  }

  getConfigs(id:number):void {
    this.settingsConfigService.get(`/api/cost/category/${id}`).subscribe((res:ApiData) => {
      // console.log(res);
      if(res.code === 200) {
        this.incomeCategoryArr = res.data.cost_category;
        this.dealIncomeCategoryArr();
      }
    })
  }

  dealIncomeCategoryArr() {
    const list:any[] = this.incomeCategoryArr;
    this.incomeCategoryArr = list.map( v => {
      return {
        id: v.id,
        name: v.name,
        active: this.checkIsSelectedCost(v.id)
      }
    })
  }

  checkIsSelectedCost(id:number):boolean {
    if(this.projectIncomeType && this.projectIncomeType.length !== 0) {
      return this.projectIncomeType.filter( v => v.cost_category.id === id).length > 0;
    }
    return false;
  }
  
}
