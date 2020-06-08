import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-subject-form-c',
  templateUrl: './subject-form-c.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }

      .phone-select {
        width: 70px;
      }

      .register-are {
        margin-bottom: 8px;
      }
    `
  ]
})
export class SubjectFormCComponent implements OnInit {
  @Input() data:any;
  @Input() COMPANY:List[];
  @Input() companyId:number;

  companyArray:List[] = [];
  departmentArray:List[] = [];
  departmentLoading: boolean = false;

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {
    this.companyArray = this.COMPANY; // 默认当前 用户权限的单位 固定

    this.validateForm = this.fb.group({
      company_id: [ this.companyId, Validators.required ],
      department_id: [ null, Validators.required ],
      name: [null, [Validators.required]],
      code: [null, [Validators.required]]
    });

    if(this.companyId) {
      this.getDepartmentList(this.companyId);
    }

    this.validateForm.get('company_id').valueChanges.subscribe( v => {
      console.log(v, 'company list  select changed')
      if(v) {
        this.getDepartmentList(v);
      }
    })
    

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
      this.submitLoading = true;
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
    let opt:any = this.validateForm.value;
    this.settingsConfigService.post('/api/project/category/subject/create', opt).subscribe((res:ApiData) => {
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
    let opt:any = this.validateForm.value;
    
    let obj:any = {
      subject_id: this.data.id,
      code: opt.code,
      name: opt.name
    };
    this.settingsConfigService.post('/api/project/category/subject/update', obj).subscribe((res:ApiData) => {
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
      code: data.code,
      company_id: data.company.id,
      department_id: data.department.id
    });
  }

  getDepartmentList(id:number) {
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
