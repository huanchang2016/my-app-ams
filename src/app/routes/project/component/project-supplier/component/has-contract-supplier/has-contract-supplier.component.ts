import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-has-contract-supplier',
  templateUrl: './has-contract-supplier.component.html',
  styles: [`
    form  {
      max-width: 600px;
      margin: 0 auto;
    }

    ::ng-deep nz-form-control {
            flex-grow: 1;
    }
    ::ng-deep .ant-form-item-label {
        padding: 0;
        line-height: 40px;
        width: 110px;
        text-align: right;
    }
  `]
})
export class HasContractSupplierComponent implements OnInit {

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
    public settingConfigService: SettingsConfigService
  ) {
    
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      service_category_id: [null, [Validators.required]], // 服务商 类型选择
      name: [null, [Validators.required]],
      contract_number: [null, [Validators.required]], // 合约编号
      contract_time: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      pay_company: [null, [Validators.required]],
      bank_account: [null, [Validators.required, Validators.pattern(/^([1-9]{1})(\d{14}|\d{18})$/)]],
      bank_name: [null, [Validators.required]]
    });

    if(this.data) {
      console.log(this.data);
      this.validateForm.patchValue({
        name: this.data.name,
        service_category_id: this.data.service_category.id,
        contract_number: this.data.number,
        contract_time: {
          start: this.data.start_time,
          end: this.data.end_time
        },
        amount: this.data.amount,
        pay_company: this.data.pay_company,
        bank_account: this.data.bank_account,
        bank_name: this.data.bank_name
      })
    }
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(this.validateForm.valid) {
      let value:any = this.validateForm.value;

      this.submitLoading = true;
      console.log(value);
      if(this.data) {
        //  请求编辑 接口
        const option:any = {
          contract_id: this.data.id,
          service_category_id: value.service_category_id,
          name: value.name,
          contract_number: value.contract_number,
          start_time: value.contract_time.start,
          end_time: value.contract_time.end,
          amount: +value.amount,
          pay_company: value.pay_company,
          bank_account: value.bank_account,
          bank_name: value.bank_name
        };
        console.log(option);
        this.editContract(option);
      }else {
        //  请求 新增接口
        const opt:any = {
          project_id: this.projectInfo.id,
          supplier_id: this.supplierInfo.id,
          service_category_id: value.service_category_id,
          name: value.name,
          contract_number: value.contract_number,
          start_time: value.contract_time.start,
          end_time: value.contract_time.end,
          amount: +value.amount,
          pay_company: value.pay_company,
          bank_account: value.bank_account,
          bank_name: value.bank_name
        };
        console.log(opt);
        this.addContract(opt);
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  
  addContract(opt:any) {
    this.settingConfigService.post('/api/contract/create', opt).subscribe((res:ApiData) => {
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
  editContract(opt:any) {

    this.settingConfigService.post('/api/contract/update', opt).subscribe((res:ApiData) => {
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

}
