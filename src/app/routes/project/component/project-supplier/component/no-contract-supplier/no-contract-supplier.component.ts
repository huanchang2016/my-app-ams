import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  @Input() supplierInfo:any;
  @Input() serviceCategoryArray:any[];

  validateForm: FormGroup; // 基本资料
  submitLoading:boolean = false;
  
  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) {
    
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      service_category_id: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    if(this.data) {
      console.log(this.data);
      this.validateForm.patchValue({
        service_category_id: this.data.service_category.id,
        amount: this.data.amount
      })
    }
  }

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
          supplier_id: this.supplierInfo.id,
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

  cancel() {}

}
