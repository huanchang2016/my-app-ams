import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.less']
})
export class ProjectInfoComponent implements OnChanges, OnInit {

  @Input() data: any;
  @Output() submitChangeSuccess: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup;

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
      if (this.data) {
        let _opt: any = Object.assign({ project_id: this.data.id }, opt);
        this.edit(_opt);
      } else {
        this.add(opt);
      }

      // this.destroyModal(this.validateForm.value);
      // if(this.data) {
      //  请求编辑 接口

      // }else {
      //  请求 新增接口

      // }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  edit(data: any): void {
    this.settingsConfigService.post('/api/project/update', data).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        this.submitChangeSuccess.emit({
          data: res.data,
          key: 'info'
        });
      } else {
        this.msg.error(res.error || '提交失败');
      }
    })
  }

  add(data: any): void {
    this.settingsConfigService.post('/api/project/create', data).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        this.submitChangeSuccess.emit({
          data: res.data,
          key: 'info'
        });
      } else {
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

}
