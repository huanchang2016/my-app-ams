import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsService } from '@delon/theme';
import { filter, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SettingsConfigService } from '../../../service/settings-config.service';

@Component({
  selector: 'app-dispatch-info',
  templateUrl: './dispatch-info.component.html',
  styles: [`
  .info-form {
    max-width: 1000px;
    margin: 0 auto;
}

nz-form-label {
    min-width: 120px;
}

nz-form-control {
    flex-grow: 1;
}
  `
  ]
})
export class DispatchInfoComponent implements OnInit {


  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
    private router: Router
  ) {
    this.settingsConfigService.get('/api/company/customer/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        const data: any[] = res.data.company;
        this.customerCompanyArray = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active);
      }
    });
    this.settingsConfigService.get('/api/project/origin/list').subscribe((res: ApiData) => {
      if (res.code === 200) {
        const data: any[] = res.data.project_origin;
        this.projectOriginArray = data.sort((a: any, b: any) => a.sequence - b.sequence);
      }
    });

    this.getCategoryList();
    // 获取当前用户所在部门 的 项目类型
    if (!this.settings.user.department) {
      return;
    }
    this.settingsConfigService.get(`/api/project_category/department/${this.settings.user.department.id}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.projectCategoryArray = res.data.project_category.sort((a: any, b: any) => a.sequence - b.sequence);
      }
    })
  }

  @Input() data: any;
  @Output() submitChangeSuccess: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup;
  submitLoading = false;

  customerCompanyArray: any[] = [];
  projectCategoryArray: any[] = [];
  projectOriginArray: any[] = [];

  // 附件上传
  attachment: any[] = [];
  isAttachmentChange = false;


  attachmentCategory: List[] = [];

  flow_type = [
    { id: 1, name: '开票流程' },
    { id: 2, name: '付款流程' },
  ];  //  流程类型

  priority: any = [];  //  优先级

  selectedType: any = [];  //  选择流程类型

  business_type: any = [];  //  业务类型

  bill_category: any = [];  //  发票类型

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],  //  申请人
      // plan_time: [null],
      // actual_time: [null],
      // description: [null],
      // progress: [null],
      flow_type_id: [null],  //  流程类型
      priority_id: [null],  //  优先级
      theme: [null],  //  主题
      company: [null],  //  公司
      business_type: [null],  //  业务类型
      agreement_name: [null],  //  协议名称
      agreement_num: [null],  //  协议编号
      bill_category_id: [null],  //  发票类型
      bank_account: [null],  //  银行账号
      customer_code: [null],  //  客户代码
      bank_name: [null],  //  开户行名称
      taxpayer_num: [null],  //  纳税人识别号
      company_address: [null],  //  公司地址
      phone: [null],  //  联系电话
    });
    if (this.data) {
      this.setFormValue(this.data);
    }
    this.getPriority();
  }

  ngOnChanges() {
    if (this.data) {
      this.setFormValue(this.data);
      this.getAttachment();
    }
  }

  // 获取所有派遣优先级
  getPriority() {
    this.settingsConfigService.get('/api/priority/pq/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有派遣优先级', res.data.priority);
        this.priority = res.data.priority;
      }
    })
  }

  selectType(flow_type_id: number): void {
    [this.selectedType] = this.flow_type.filter(v => v.id === flow_type_id);
    console.log('selectedType', this.selectedType);
    if (this.selectedType.name === '开票流程' || this.selectedType.name === '付款流程') {
      this.getBusinessType();
    }
  }

  // 获取所有业务类型
  getBusinessType() {
    this.settingsConfigService.get('/api/business_type/pq/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有业务类型', res.data);
        this.business_type = res.data.business_type;
      }
    })
  }

  // 获取所有发票类型
  getBillCategory() {
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有发票类型', res.data);
        // this.bill_category = res.data.business_type;
      }
    })
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      console.log(this.validateForm.value);
      const opt: any = this.validateForm.value;
      this.submitLoading = true;
      if (this.data) {
        const _opt: any = { project_id: this.data.id, ...opt };
        this.edit(_opt);
      } else {
        this.add(opt);
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  edit(data: any): void {
    this.settingsConfigService.post('/api/project/update', data).subscribe((res: ApiData) => {
      console.log(res);
      // this.submitLoading = false;
      if (res.code === 200) {
        this.submitChangeSuccess.emit({
          data: res.data,
          key: 'info'
        });
      } else {
        this.submitLoading = false;
        this.msg.error(res.error || '提交失败');
      }
    })
  }

  add(data: any): void {
    this.settingsConfigService.post('/api/project/create', data).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        this.bindAttachment(res.data);
      } else {
        this.submitLoading = false;
        this.msg.error(res.error || '提交失败');
      }
    })
  }

  setFormValue(opt: any): void {
    if (this.validateForm && opt) {
      this.validateForm.patchValue({
        name: opt.name,
        // category_id: opt.category ? opt.category.id : null,
        // plan_time: {
        //   start: opt.plan_execution_start_time,
        //   end: opt.plan_execution_end_time
        // },
        // actual_time: {
        //   start: opt.actual_execution_start_time,
        //   end: opt.actual_execution_end_time
        // },
        // description: opt.description,
        // progress: opt.progress
      });
    }
  }
  attachmentChange(option: any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if (this.data) {
      this.bindAttachment(this.data, true);
    }
  }

  bindAttachment(projectInfo: any, isRefer: boolean = false) {
    const opt: any = {
      attachment_ids: this.attachment.map(v => v.id),
      project_id: projectInfo.id,
      is_basic: true
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        if (this.data) {
          if (isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        } else {
          this.submitChangeSuccess.emit({
            data: projectInfo,
            key: 'info'
          });
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/project/${this.data.id}`).subscribe((res: ApiData) => {
      console.log('项目 基础附件：', res);
      if (res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }
  getCategoryList() {
    const opt: any = {
      is_project: true,
      is_contract: false,
      is_pay: false,
      is_bill: false
    };
    this.settingsConfigService.post('/api/attachment/category/list', opt).pipe(
      filter(v => v.code === 200),
      map(v => v.data)
    ).subscribe(data => {
      const cateArrData: any[] = data.attachment_category;
      this.attachmentCategory = cateArrData.sort((a: any, b: any) => a.sequence - b.sequence).map(v => {
        return { id: v.id, name: v.name }
      });

    });

  }


}
