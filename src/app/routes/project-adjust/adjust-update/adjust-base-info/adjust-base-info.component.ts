import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { filter, map } from 'rxjs/operators';
import { zip } from 'rxjs';

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
export class AdjustBaseInfoComponent implements OnInit {

  @Input() adjustInfo:any;
  @Input() configs:any;
  
  validateForm: FormGroup;


  submitLoading:boolean = false;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
  ) {
    this.getCategoryList();
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

    if(this.adjustInfo) {
      this.resetForm(this.adjustInfo.info_adjustment);
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
    console.log(this.validateForm, 'submit');

    if (this.validateForm.valid) {
      let opt: any = this.validateForm.value;
      
        
        
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
      info_adjustment_id: this.adjustInfo.info_adjustment.id,
      is_basic: true
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('附件绑定成功');
        this.getAttachment();
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.post(`/api/info_adjustment/attachment`, { info_adjustment_id: this.adjustInfo.info_adjustment.id }).subscribe((res:ApiData) => {
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
