import { Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.less'],
})
export class ProjectInfoComponent implements OnChanges, OnInit {

  @Input() data: any;
  @Output() submitChangeSuccess: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup;
  submitLoading:boolean = false;

  customerCompanyArray: any[] = [];
  projectCategoryArray: any[] = [];
  projectOriginArray: any[] = [];

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService
  ) {
    this.settingsConfigService.get('/api/company/customer/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        let data: any[] = res.data.company;
        this.customerCompanyArray = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active);
      }
    });
    this.settingsConfigService.get('/api/project/origin/list').subscribe((res: ApiData) => {
      if (res.code === 200) {
        let data: any[] = res.data.project_origin;
        this.projectOriginArray = data.sort( (a:any, b:any) => a.sequence - b.sequence);
      }
    });

    this.getCategoryList();
    // 获取当前用户所在部门 的 项目类型
    if(!this.settings.user.department) {
      return;
    }
    this.settingsConfigService.get(`/api/project_category/company/${this.settings.user.company.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectCategoryArray = res.data.project_category.sort( (a:any, b:any) => a.sequence - b.sequence);
      }
    })
  }

  ngOnChanges() {
    if (this.data) {
      this.setFormValue(this.data);
      this.getAttachment();
    }
  }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      customer_ids: [null, [Validators.required]],
      category_id: [null],
      origin_id: [null],
      plan_time: [null],
      actual_time: [null],
      description: [null]
    });
    if (this.data) {
      this.setFormValue(this.data);
    }
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      console.log(this.validateForm.value);
      let opt: any = this.validateForm.value;
      this.submitLoading = true;
      if (this.data) {
        let _opt: any = Object.assign({ project_id: this.data.id }, opt);
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
      this.submitLoading = false;
      if (res.code === 200) {
        this.submitChangeSuccess.emit({
          data: res.data,
          key: 'info'
        });
        this.bindAttachment(res.data);
      } else {
        this.submitLoading = false;
        this.msg.error(res.error || '提交失败');
      }
    })
  }

  setFormValue(opt: any): void {
    if (this.validateForm && opt) {
      const customer_ids:number[] = opt.customer ? (opt.customer.map( v => v.id)) : []
      this.validateForm.patchValue({
        name: opt.name,
        customer_ids: customer_ids,
        category_id: opt.category ? opt.category.id : null,
        origin_id: opt.origin.id,
        plan_time: {
          start: opt.plan_execution_start_time,
          end: opt.plan_execution_end_time
        },
        actual_time: {
          start: opt.actual_execution_start_time,
          end: opt.actual_execution_end_time
        },
        description: opt.description
      });
    }
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
  }

  bindAttachment(projectInfo:any, isRefer:boolean = false) {
    const opt:any = {
      attachment_ids: this.attachment.map(v => v.id),
      project_id: projectInfo.id,
      is_basic: true
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
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/project/${this.data.id}`).subscribe((res:ApiData) => {
      console.log('项目 基础附件：', res);
      if(res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }


  attachmentCategory:List[] = [];
  getCategoryList() {
    const opt:any = {
      is_project: true,
      is_contract: false,
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

}
