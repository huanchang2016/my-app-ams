import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-node-form',
  templateUrl: './node-form.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class NodeFormComponent implements OnInit {
  @Input() data:any;
  @Input() workflow_id:number;
  @Input() USERS:any[];

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      user_id: [ null, [Validators.required] ]
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
      workflow_id: this.workflow_id
    };
    this.settingConfigService.post('/api/node/create', obj).subscribe((res:ApiData) => {
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
      node_id: this.data.id
    };

    this.settingConfigService.post('/api/node/update', opt).subscribe((res:ApiData) => {
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
      name: data.name,
      user_id: data.user.id
    });

  }


  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
