import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-no-contract-supplier',
  templateUrl: './no-contract-supplier.component.html',
  styles: [`
    form  {
      max-width: 600px;
      margin: 0 auto;
    }

    ::ng-deep nz-form-control {
      flex-grow: 1;
      line-height: 40px;
    }
    ::ng-deep nz-form-control .category-list {
      line-height: 40px !important;
    }
    ::ng-deep .ant-form-item-label {
        padding: 0;
        line-height: 40px;
        width: 110px;
        text-align: right;
    }
  `]
})
export class NoContractSupplierComponent implements OnInit {

  @Input() data?:any;
  @Input() projectInfo:any;
  @Input() selectedOption:{ [key:string] : boolean };
  @Input() supplierList:any[];

  validateForm: FormGroup; // 基本资料
  submitLoading:boolean = false;
  limtAmount:number;

  serviceCategoryList:any[] = [];
  
  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
    console.log(this.selectedOption)
    if(this.projectInfo) {
      this.getServiceCategory();
      // 计算 限制金额  重新获取最新的 预算（成本）金额信息计算
      this.settingsConfigService.get(`/api/project/detail/${this.projectInfo.id}`).subscribe((res:ApiData) => {
        if(res.code === 200) {
          const info:any = res.data;
          this.limtAmount = info.budget.cost_amount - info.budget.surplus_cost_amount;
          if(this.data) {
            this.limtAmount = this.limtAmount + this.data.amount;
          }
        }
      })
    }
    this.validateForm = this.fb.group({
      supplier_id: [null, [Validators.required]],
      service_category_id: [null, [Validators.required]],
      amount: [null, [Validators.required, this.confirmValidator, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    if(this.data) {
      console.log(this.data);
      this.validateForm.patchValue({
        supplier_id: this.data.supplier.id,
        service_category_id: this.data.service_category.id,
        amount: this.data.amount
      })
    }
  }

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (+control.value > this.limtAmount) {
      return { confirm: true, error: true };
    }
    return {};
  };

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(this.validateForm.valid) {
      const value:any = this.validateForm.value;

      this.submitLoading = true;
      if(this.data) {
        //  请求编辑 接口
        const option:any = {
          treaty_id: this.data.id,
          service_category_id: value.service_category_id,
          amount: +value.amount
        };
        this.editNoContract(option);
      }else {
        //  请求 新增接口
        const opt:any = {
          project_id: this.projectInfo.id,
          supplier_id: value.supplier_id,
          service_category_id: value.service_category_id,
          amount: +value.amount
        };
        this.addNoContract(opt);
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  
  addNoContract(opt:any) {
    this.settingsConfigService.post('/api/treaty/create', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal({});
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }
  editNoContract(opt:any) {

    this.settingsConfigService.post('/api/treaty/update', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal({});
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  destroyModal(data:any = null): void {
    this.modal.destroy(data);
  }
  
  getServiceCategory():void {
    this.settingsConfigService.get(`/api/service/category/${this.projectInfo.company.id}`).subscribe((res:ApiData) => {
      // console.log(res);
      if(res.code === 200) {
        const list:any[] = res.data.service_category;
        this.serviceCategoryList = list.filter( v => v.active );
      }
    });
  }

  cancel() {}

}
