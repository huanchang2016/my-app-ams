import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { filter, map } from 'rxjs/operators';
import { zip } from 'rxjs';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';

@Component({
  selector: 'app-adjust-base-info',
  templateUrl: './adjust-base-info.component.html',
  styles: [
    `
    .info-form nz-form-label {
      width: 110px;
    }
    `
  ]
})
export class AdjustBaseInfoComponent implements OnChanges, OnInit {

  @Input() adjustInfo:any;
  @Input() projectInfo:any;
  @Input() configs:any;
  @Input() submitLoading:boolean;
  
  @Output() adjustmentChange:EventEmitter<any> = new EventEmitter();
  
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) {
    this.getCategoryList();
  }

  ngOnChanges():void {
    if(this.adjustInfo) {
      if(this.validateForm) {
        this.resetForm(this.adjustInfo.info_adjustment);
      }
    }
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      customer_ids: [null, [Validators.required]],
      category_id: [null],
      origin_id: [null],
      plan_time: [null],
      // actual_time: [null],
      description: [null],
      progress: [null], // 项目基础信息  end

    });

    if(this.adjustInfo.info_adjustment) {
      this.resetForm(this.adjustInfo.info_adjustment);
      this.getAttachment();
    }

  }

  resetForm(opt: any): void {

    let customer_ids:number[] = [];
    const customers:any[] = this.adjustInfo.project.customer;
    if(customers) {
      customer_ids = customers.map( v => v.id);
    }
    this.validateForm.patchValue({
      name: opt.name,
      customer_ids: customer_ids,
      category_id: opt.category ? opt.category.id : null,
      origin_id: opt.origin.id,
      plan_time: {
        start: opt.plan_execution_start_time,
        end: opt.plan_execution_end_time
      },
      description: opt.description,
      progress: opt.progress
    });
  }


  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    if (this.validateForm.valid) {
      const value: any = this.validateForm.value;
      const option:any = {
        adjustment_id: this.adjustInfo.id,
        category_name: '项目信息调整',

        project_category_id: value.category_id,
        project_origin_id: value.origin_id,
        project_name: value.name,
        description: value.description,
        progress: value.progress,
        plan_execution_start_time: value.plan_time.start,
        plan_execution_end_time: value.plan_time.end
      };
      this.adjustmentChange.emit(option);
      
      
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  
  cancel():void {}

  
  // 附件上传
  attachment:any[] = [];
  isAttachmentChange:boolean = false;
  attachmentChange(option:any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
      this.bindAttachment();
  }

  bindAttachment() {
    const opt:any = {
      attachment_ids: this.attachment.map(v => v.id),
      info_adjustment_id: this.adjustInfo.info_adjustment.id
    };
    this.settingsConfigService.post('/api/attachment_adjustment/bind', opt).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('附件绑定成功');
        this.getAttachment();
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment_adjustment/${this.adjustInfo.info_adjustment.id}`).subscribe((res:ApiData) => {
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
