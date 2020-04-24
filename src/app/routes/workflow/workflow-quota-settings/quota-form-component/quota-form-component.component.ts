import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-quota-form-component',
  templateUrl: './quota-form-component.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class QuotaFormComponentComponent implements OnInit {
  @Input() data:any;
  @Input() company:any[];
  @Input() selectCompany:number[];

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      name: [null, [Validators.required ]],
      company_id: [null, [Validators.required]],
      chairman_amount_start: [null, [Validators.required ]],
      chairman_amount_end: [null, [Validators.required ]],
      meeting_amount_start: [null, [Validators.required ]],
      meeting_amount_end: [null, [Validators.required ]],
      resolution_amount_start: [null, [Validators.required ]],
      resolution_amount_end: [null, [Validators.required ]]
    });
    

    if(this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    }
  }
  
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(this.validateForm.valid) {
      if(this.data) {
        //  请求编辑 接口
        this.edit();
      }else {
        //  请求 新增接口
        this.create();
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  create() {
    const value:any = this.validateForm.value;
    const opt:any = {
      company_id: value.company_id,
      name: value.name,
      chairman_amount_start: +value.chairman_amount_start,
      chairman_amount_end: +value.chairman_amount_end,
      meeting_amount_start: +value.meeting_amount_start,
      meeting_amount_end: +value.meeting_amount_end,
      resolution_amount_start: +value.resolution_amount_start,
      resolution_amount_end: +value.resolution_amount_end
    };
    console.log(opt);
    this.settingsConfigService.post('/api/quota/create', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal(opt, false);
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  edit() {
    const value:any = this.validateForm.value;
    const opt:any = {
      quota_id: this.data.id,
      name: value.name,
      chairman_amount_start: +value.chairman_amount_start,
      chairman_amount_end: +value.chairman_amount_end,
      meeting_amount_start: +value.meeting_amount_start,
      meeting_amount_end: +value.meeting_amount_end,
      resolution_amount_start: +value.resolution_amount_start,
      resolution_amount_end: +value.resolution_amount_end
    };

    this.settingsConfigService.post('/api/quota/update', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal(opt, true);
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  setFormValue(data:any) :void {
    this.validateForm.patchValue({
      name: data.name,
      company_id: data.company.id,
      chairman_amount_start: data.chairman_amount_start,
      chairman_amount_end: data.chairman_amount_end,
      meeting_amount_start: data.meeting_amount_start,
      meeting_amount_end: data.meeting_amount_end,
      resolution_amount_start: data.resolution_amount_start,
      resolution_amount_end: data.resolution_amount_end
    });
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }

  isDisabled(id:number):boolean {
    return this.selectCompany.includes(id);
  }
}
