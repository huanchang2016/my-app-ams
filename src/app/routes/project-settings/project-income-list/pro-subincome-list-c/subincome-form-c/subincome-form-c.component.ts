import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-subincome-form-c',
  templateUrl: './subincome-form-c.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class SubincomeFormCComponent implements OnInit {
  @Input() data:any;
  @Input() tax_id:number;

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
      name: [null, [Validators.required]]
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
      // this.destroyModal(this.validateForm.value);
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
    const obj:any = {
      ...this.validateForm.value,
      tax_id: this.tax_id
    };
    this.settingsConfigService.post('/api/tax/fee/create', obj).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal(res.data, false);
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  edit() {
    const opt:any = {
      ...this.validateForm.value,
      tax_fee_id: this.data.id
    };

    this.settingsConfigService.post('/api/tax/fee/update', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal(null, true);
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  setFormValue(data:any) :void {
    console.log(data);
    
    this.validateForm.patchValue({
      name: data.name
    });

  }


  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
