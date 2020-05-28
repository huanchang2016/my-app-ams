import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-workflow-form',
  templateUrl: './workflow-form.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class WorkflowFormComponent implements OnInit {
  @Input() data:any;
  @Input() COMPANY:List[];
  @Input() companyId:number;

  departmentArray:List[] = [];
  departmentLoading:boolean = false;
  userList:List[] = [];
  usersLoading:boolean = false;
  workflowCategoryArray:List[] = [];
  workflowCategoryLoading:boolean = false;

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
      name: [null, [Validators.required]],
      company_id: [ this.companyId, [Validators.required] ],
      department_id: [ null, [Validators.required] ],
      execute_user_id: [ null ],
      workflow_category_id: [ null, [Validators.required] ],
      is_large: [ null, [Validators.required]]
    });

    if(this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    }else {
      this.validateForm.get('company_id').setValidators(Validators.required);
      this.validateForm.get('department_id').setValidators(Validators.required);
      // 获取当前单位下的 部门
      if(this.companyId) {
        this.getDepartmentAndWorkflowCategory(this.companyId);
        this.getUserList(this.companyId);
      }
      this.validateForm.get('company_id').valueChanges.subscribe( id => {
        this.departmentArray = [];
        this.userList = [];
        this.workflowCategoryArray = [];
        this.getDepartmentAndWorkflowCategory(id);
        this.getUserList(id);
      });
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
    const opt:any = this.validateForm.value;
    this.settingsConfigService.post('/api/workflow/create', opt).subscribe((res:ApiData) => {
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
    const opt:any = {
      name: this.validateForm.value.name,
      execute_user_id: this.validateForm.value.execute_user_id,
      workflow_id: this.data.id
    };

    this.settingsConfigService.post('/api/workflow/update', opt).subscribe((res:ApiData) => {
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
    console.log(data);
    
    this.validateForm.patchValue({
      name: data.name,
      company_id: data.company.id,
      department_id: data.department.id,
      execute_user_id: data.execute_user? data.execute_user.id : null,
      workflow_category_id: data.workflow_category.id,
      is_large: data.is_large
    });

    this.validateForm.get('company_id').disable();
    this.validateForm.get('department_id').disable();
    this.validateForm.get('execute_user_id').disable();
    this.validateForm.get('workflow_category_id').disable();
    this.validateForm.get('is_large').disable();
  }

  getDepartmentAndWorkflowCategory(id:number): void {
    this.departmentLoading = true;
    this.settingsConfigService.get(`/api/department/${id}`).subscribe((res:ApiData) => {
      this.departmentLoading = false;
      if(res.code === 200) {
        let data:any[] = res.data.department;
        this.departmentArray = data.sort((a:any, b:any) => a.sequence - b.sequence)
                                   .filter( v => v.active )
                                   .map( v => {
                                     return { id: v.id, name: v.name };
                                   });
      }
    });
    this.workflowCategoryLoading = true;
    this.settingsConfigService.get(`/api/workflow/category/${id}`).subscribe((res:ApiData) => {
      this.workflowCategoryLoading = false;
      if(res.code === 200) {
        let data:any[] = res.data.workflow_category;
        this.workflowCategoryArray = data.filter( v => v.active )
                                   .map( v => {
                                     return { id: v.id, name: v.name };
                                   });
      }
    });
  }

  getUserList(id:number) {
    this.settingsConfigService.get(`/api/user/company/${id}`).subscribe((res:ApiData) => {
      console.log(res, 'users')
      if(res.code === 200) {
        let data:any[] = res.data.user;
        this.userList = data.map( v => {
          return { id: v.id, name: v.name };
        });
      }
    })
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
