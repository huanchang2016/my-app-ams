import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-project-category-form',
  templateUrl: './project-category-form.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class ProjectCategoryFormComponent implements OnInit {
  @Input() data:any;
  @Input() COMPANY:List[];
  @Input() companyId:number;
  @Input() departmentId:number;
  @Input() total:number;

  departmentArray:List[] = [];
  departmentLoading:boolean = false;

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
      code: [null, [Validators.required]],
      company_id: [ this.companyId, [Validators.required] ],
      department_id: [ this.departmentId, [Validators.required] ]
    });

    // 获取当前单位下的 部门
    if(this.companyId) {
      this.getDepartment(this.companyId);
    }
    this.validateForm.get('company_id').valueChanges.subscribe( id => {
      console.log(id !== this.companyId, id, this.companyId)
      if(id !== this.companyId) {
        this.departmentArray = [];
        this.getDepartment(id);
      }
      
    });
    

    if(this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    }else {
      this.validateForm.get('company_id').setValidators(Validators.required);
      this.validateForm.get('department_id').setValidators(Validators.required);
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
    let opt:any = {
      name: this.validateForm.value.name,
      code: this.validateForm.value.code,
      company_id: this.validateForm.value.company_id,
      department_id: this.validateForm.value.department_id,
      sequence: this.total
    };

    this.settingsConfigService.post('/api/project_category/create', opt).subscribe((res:ApiData) => {
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
    let opt:any = {
      name: this.validateForm.value.name,
      code: this.validateForm.value.code,
      sequence: this.data.sequence
    };
    
    let obj:any = Object.assign({ category_id: this.data.id }, opt);

    this.settingsConfigService.post('/api/project_category/update', obj).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal(obj, true);
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  setFormValue(data:any) :void {
    this.validateForm.patchValue({
      name: data.name,
      code: data.code,
      company_id: data.company.id,
      department_id: data.department.id
    });
  }

  getDepartment(id:number): void {
    this.companyId = id;
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
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
