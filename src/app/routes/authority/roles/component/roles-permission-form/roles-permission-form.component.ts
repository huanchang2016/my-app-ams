import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService, NzFormatEmitEvent } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-roles-permission-form',
  templateUrl: './roles-permission-form.component.html',
  styleUrls: ['./roles-permission-form.component.less']
})
export class RolesPermissionFormComponent implements OnInit {

  @Input() data:any;

  submitLoading: boolean = false;

  listOfData:any[] = [];
  nzPermissionLoading:boolean = true;

  selectPermissions:any[] = [];
  selectedKeys:any[] = [];

  constructor(
    private modal: NzModalRef,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) {
    // 获取权限组及其子权限， 整理数据
    this.getPermissionGroup();
  }


  ngOnInit(): void {
    
    if(this.data) {
      this.getPermissions();
    }
  }

  // permissionGroup options
  permissionGroup:any[] = [];
  groupLength:number = 0;
  getPermissionGroup():void {
    this.permissionGroup = [];
    this.settingsConfigService.get(`/api/permission_group/all`).subscribe((res:ApiData) => {
      console.log(res, 'permission_group ');
      if(res.code === 200) {
        const permission_group:any[] = res.data.permission_group;
        this.groupLength = permission_group.length;
        this.getSubPermission(permission_group);
      }
    });
  }
  getSubPermission(groupPermission:any[]):void {
    console.log(1);
    if(groupPermission.length !== 0) {
      groupPermission.forEach(group => {
        this.settingsConfigService.get(`/api/group/permission/${group.id}`).subscribe((res:ApiData) => {
          if(res.code === 200) {
            const subPermission:any[] = res.data.permission;
            const children:any[] = subPermission.map( v => {
              return {
                title: v.name,
                key: v.id,
                isLeaf: true
              };
            })
            this.permissionGroup.push({
              title: group.name,
              key: group.id,
              expanded: true,
              children: children
            });
            if(this.permissionGroup.length === this.groupLength) {
              console.log(this.permissionGroup);
              this.permissionGroup = this.permissionGroup.sort( (a:any, b:any) => a.key - b.key)
            }
            
          }
        });
      });
      
    }
  }
  
  getPermissions():void {
    this.nzPermissionLoading = true;
    this.settingsConfigService.get(`/api/role/permission/${this.data.id}`).subscribe((res:ApiData) => {
      console.log(res, 'current roles selected permission');
      this.nzPermissionLoading = false;
      if(res.code === 200) {
        let permissions:any[] = res.data.permission;
        this.selectedKeys = permissions.map( v => v.id);
      }
    });
  }

  submitPermission():void {
    console.log(this.selectedKeys, 'selectedKeys');
    const option:any = {
      role_id: this.data.id,
      permission_ids: this.selectedKeys
    };
    this.settingsConfigService.post('/api/role/permission/handle', option).subscribe((res:ApiData) => {
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('角色权限绑定成功');
        this.destroyModal(option, false);
      }else {
        this.msg.error(res.error || '绑定权限失败');
      }
    });
  }

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
    this.selectedKeys = event.keys;
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
