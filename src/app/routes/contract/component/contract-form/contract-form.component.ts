import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { filter, map } from 'rxjs/operators';
import { zip } from 'rxjs';

@Component({
  selector: 'app-contract-contract-form',
  templateUrl: './contract-form.component.html',
  styles: [`
    form  {
      max-width: 600px;
      margin: 0 auto;
    }
    ::ng-deep nz-form-control {
      flex-grow: 1;
      line-height: 40px;
    }
    ::ng-deep .ant-form-item-label {
      padding: 0;
      line-height: 40px;
      width: 110px;
      text-align: right;
  }
  `]
})
/****
 * 合同创建  
 *    1. 供应商  supplierList
 *    2. 所属单位 companyList
 *    3. 所属部门 departmentList
 *    4. 服务商类型  service_category
 *    5. 合同类型   contractCategory
 * 
 * ******/
export class ContractContractFormComponent implements OnInit {

  @Input() data?:any;
  @Input() supplierList:any[];
  @Input() companyList:any[];

  validateForm: FormGroup; // 基本资料
  submitLoading:boolean = false;

  contractCategoryList:any[] = [];

  limtAmount:number;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
    this.validateForm = this.fb.group({
      supplier_id: [null, [Validators.required]],
      company_id: [null, [Validators.required]],
      is_split: [ false, [Validators.required]], // 是否分割合同，默认 false （不分割）
      department_id: [null],
      service_category_id: [null, [Validators.required]], // 服务商 类型选择
      contract_category_id: [null, [Validators.required]],
      name: [null, [Validators.required]],
      contract_number: [null, [Validators.required]], // 合约编号
      contract_time: [null, [Validators.required]],
      pay_company: [ null, [Validators.required]],
      bank_account: [null, [Validators.required]], // Validators.pattern(/^([1-9]{1})(\d{14}|\d{18})$/)
      bank_name: [null, [Validators.required]],
      is_amount: [null, [Validators.required]],
      amount: [null, [Validators.required, this.confirmValidator, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    this.getCategoryList();

    if(this.data) {
      console.log(this.data);
      this.getConfigs(this.data.company.id);

      this.validateForm.patchValue({
        supplier_id: this.data.supplier.id,
        company_id: this.data.company.id,
        department_id: this.data.is_split ? null : this.data.department.id,
        name: this.data.name,
        contract_category_id: this.data.contract_category ? this.data.contract_category.id : null,
        service_category_id: this.data.service_category.id,
        contract_number: this.data.number,
        contract_time: {
          start: this.data.start_time,
          end: this.data.end_time
        },
        is_amount: this.data.contract_amount ? 'A' : 'B',
        amount: this.data.contract_amount ? this.data.contract_amount : this.data.request_amount,
        pay_company: this.data.pay_company,
        bank_account: this.data.bank_account,
        bank_name: this.data.bank_name
      });
      
      this.getAttachment();
    }
  }

  isSplitChange(required: boolean): void {
    if (required) {
      this.validateForm.get('department_id')!.clearValidators();
      this.validateForm.get('department_id')!.markAsPristine();
    } else {
      this.validateForm.get('department_id')!.setValidators(Validators.required);
      this.validateForm.get('department_id')!.markAsDirty();
    }
    this.validateForm.get('department_id')!.updateValueAndValidity();
  }

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (+control.value > this.limtAmount) {
      return { confirm: true, error: true };
    }
    return {};
  };

  attachmentError:boolean = false;
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(this.validateForm.valid && this.attachment.length !== 0) {
      let value:any = this.validateForm.value;

      this.submitLoading = true;
      if(this.data) {
        //  请求编辑 接口
        let option:any = {
          contract_id: this.data.id,
          supplier_id: this.data.supplier.id,
          company_id: this.data.company.id,
          department_id: this.data.is_split ? null : this.data.department.id,
          service_category_id: value.service_category_id,
          contract_category_id: value.contract_category_id,
          name: value.name,
          contract_number: value.contract_number,
          start_time: value.contract_time.start,
          end_time: value.contract_time.end,
          pay_company: value.pay_company,
          bank_account: value.bank_account,
          bank_name: value.bank_name
        };
        let amountT = {};
        if(this.validateForm.value.is_amount === 'A') {
          amountT = {
            contract_amount: +value.amount,
            request_amount: 0
          };
        }else {
          amountT = {
            request_amount: +value.amount,
            contract_amount: 0
          };
        }
        option = Object.assign(option, amountT);
        console.log(option);
        this.editContract(option);
      }else {
        //  请求 新增接口
        let opt:any = {
          supplier_id: value.supplier_id,
          company_id: value.company_id,
          department_id: this.data.is_split ? null : value.department_id,
          service_category_id: value.service_category_id,
          contract_category_id: value.contract_category_id,
          name: value.name,
          contract_number: value.contract_number,
          start_time: value.contract_time.start,
          end_time: value.contract_time.end,
          pay_company: value.pay_company,
          bank_account: value.bank_account,
          bank_name: value.bank_name
        };
        let amountT = {};
        if(this.validateForm.value.is_amount === 'A') {
          amountT = {
            contract_amount: +value.amount,
            request_amount: 0
          };
        }else {
          amountT = {
            request_amount: +value.amount,
            contract_amount: 0
          };
        }
        opt = Object.assign(opt, amountT);
        console.log(opt);
        this.addContract(opt);
      }
    } else {
      if(this.attachment.length === 0) {
        this.attachmentError = true;
      }
      this.msg.warning('信息填写不完整');
    }
  }

  
  addContract(opt:any) {
    this.settingsConfigService.post('/api/contract/create', opt).subscribe((res:ApiData) => {
      console.log(res);
      // this.submitLoading = false;
      if(res.code === 200) {
        // this.msg.success('创建成功');
        this.bindAttachment(res.data);
      }else {
        this.submitLoading = false;
        this.msg.error(res.error || '创建失败');
      }
    });
  }
  editContract(opt:any) {
    this.settingsConfigService.post('/api/contract/update', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal({});
      }else {
        this.submitLoading = false;
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  destroyModal(data:any = null): void {
    this.modal.destroy(data);
  }

  
  // 附件上传
  attachment:any[] = [];
  isAttachmentChange:boolean = false;
  attachmentChange(option:any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if(this.data) {
      this.bindAttachment(this.data, true);
    }
    if(this.attachment.length !== 0) {
      this.attachmentError = false;
    }
  }

  bindAttachment(contractInfo:any, isRefer:boolean = false) {
    const opt:any = {
      attachment_ids: this.attachment.map(v => v.id),
      contract_id: contractInfo.id,
      is_basic: false
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        if(this.data) {
          if(isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        }else {
         this.destroyModal({});
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/contract/${this.data.id}`).subscribe((res:ApiData) => {
      console.log('项目 基础附件：', res);
      if(res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }


  attachmentCategory:List[] = [];
  getCategoryList() {
    const opt:any = {
      is_project: false,
      is_contract: true,
      is_pay: false,
      is_bill: false
    };
    this.settingsConfigService.post('/api/attachment/category/list', opt).pipe(
      filter(v => v.code === 200),
      map(v => v.data)
    ).subscribe( data => {
      const cateArrData:any[] = data.attachment_category;
      this.attachmentCategory = cateArrData.sort((a:any, b:any) => a.sequence - b.sequence).map( v => {
        return { id: v.id, name: v.name }
      });

    });
    
  }

  selectedCompanyChange(id:number) {
    if(id) {
      this.getConfigs(id);
    }
  }
  configsOption:any = {
    department: [],
    serviceCategory: [],
    contractCategory: [] 
  };

  getConfigs(companyId:number) {
    // 根据单位id  获取  部门  服务商类型  合同类型

    zip(
      this.settingsConfigService.get(`/api/department/${companyId}`),
      this.settingsConfigService.get(`/api/service/category/${companyId}`),
      this.settingsConfigService.get(`/api/contract/category/${companyId}`)
    ).pipe(
      map(([a, b, c]) => [a.data.department, b.data.service_category, c.data.contract_category])
    ).subscribe(([department, serviceCategory, contractCategory]) => {
      this.configsOption = {
        department: department,
        serviceCategory: serviceCategory,
        contractCategory: contractCategory 
      };
    })
  }
}
