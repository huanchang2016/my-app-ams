import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-roles-user-form',
  templateUrl: './roles-user-form.component.html',
})
export class RolesUserFormComponent implements OnInit {

  @Input() data:any;
  validateForm: FormGroup;
  submitLoading: boolean = false;

  users:any[] = [];
  nzUsersLoading:boolean = true;

  selectedUsers:any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingConfigService: SettingsConfigService
  ) {}


  ngOnInit(): void {
    this.validateForm = this.fb.group({
      user_ids: [null, [Validators.required]],
      // company_id: [ this.companyId, [Validators.required] ],
      // description: [ null ]
    });

    if(this.data) {
      this.getUsers();
    }
  }
  getUsers():void {
    this.nzUsersLoading = true;
    this.settingConfigService.get(`/api/user/company/${this.data.company.id}`).subscribe((res:ApiData) => {
      console.log(res, 'user list ');
      if(res.code === 200) {
        let users:any[] = res.data.user;
        this.users = users.filter( v => v.active );
      }
    });
    this.settingConfigService.get(`/api/role/user/${this.data.id}`).subscribe((res:ApiData) => {
      console.log(res, 'current roles selected users');
      this.nzUsersLoading = false;
      if(res.code === 200) {
        let users:any[] = res.data.user;
        this.selectedUsers = users;
        this.setFormValue();
      }
    });
  }
  
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(this.validateForm.valid) {
      this.create();
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  create() {
    const opt:any = {
      user_ids: this.validateForm.value.user_ids,
      role_id: this.data.id
    };
    this.settingConfigService.post('/api/role/user/handle', opt).subscribe((res:ApiData) => {
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('绑定用户成功');
        this.destroyModal(opt, false);
      }else {
        this.msg.error(res.error || '绑定用户失败');
      }
    });
  }


  setFormValue() :void {
    const user_ids:any[] = this.selectedUsers.map( v => v.id);

    this.validateForm.patchValue({
      user_ids: user_ids
    });
  }


  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }

}
