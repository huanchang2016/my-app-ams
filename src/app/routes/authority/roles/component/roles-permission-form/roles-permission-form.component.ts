import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService, NzFormatEmitEvent } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-roles-permission-form',
  templateUrl: './roles-permission-form.component.html',
  styles: []
})
export class RolesPermissionFormComponent implements OnInit {

  @Input() data:any;
  validateForm: FormGroup;
  submitLoading: boolean = false;

  listOfData:any[] = [];
  nzPermissionLoading:boolean = true;

  selecPermissions:any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingConfigService: SettingsConfigService
  ) {}


  ngOnInit(): void {
    this.validateForm = this.fb.group({
      permission_ids: [null, [Validators.required]],
      // company_id: [ this.companyId, [Validators.required] ],
      // description: [ null ]
    });

    if(this.data) {
      this.getPermissions();
    }
  }
  getPermissions():void {
    this.nzPermissionLoading = true;
    // this.settingConfigService.get(`/api/user/company/${this.data.company.id}`).subscribe((res:ApiData) => {
    //   console.log(res, 'user list ');
    //   if(res.code === 200) {
    //     let permissions:any[] = res.data.permission;
    //     this.listOfData = permissions.filter( v => v.active );
    //   }
    // });
    this.settingConfigService.get(`/api/role/permission/${this.data.id}`).subscribe((res:ApiData) => {
      console.log(res, 'current roles selected permission');
      this.nzPermissionLoading = false;
      if(res.code === 200) {
        let permissions:any[] = res.data.permission;
        this.selecPermissions = permissions;
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
      permission_ids: this.validateForm.value.permission_ids,
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
    const permission_ids:any[] = this.selecPermissions.map( v => v.id);

    this.validateForm.patchValue({
      permission_ids: permission_ids
    });
  }


  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }

  
  //  mock  data
  defaultCheckedKeys = [11];
  defaultSelectedKeys = [11];
  defaultExpandedKeys = [1, 11, 12];

  nodes = [
    {
      title: '0-0',
      key: 1,
      expanded: true,
      children: [
        {
          title: '0-0-0',
          key: 11,
          children: [
            { title: '0-0-0-0', key: 111, isLeaf: true },
            { title: '0-0-0-1', key: 112, isLeaf: true },
            { title: '0-0-0-2', key: 113, isLeaf: true }
          ]
        },
        {
          title: '0-0-1',
          key: 12,
          children: [
            { title: '0-0-1-0', key: 121, isLeaf: true },
            { title: '0-0-1-1', key: 122, isLeaf: true },
            { title: '0-0-1-2', key: 123, isLeaf: true }
          ]
        },
        {
          title: '0-0-2',
          key: 13,
          isLeaf: true
        }
      ]
    },
    {
      title: '0-1',
      key: 2,
      children: [
        { title: '0-1-0-0', key: 21, isLeaf: true },
        { title: '0-1-0-1', key: 22, isLeaf: true },
        { title: '0-1-0-2', key: 23, isLeaf: true }
      ]
    },
    {
      title: '0-2',
      key: 3,
      isLeaf: true
    }
  ];

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
  }
}
