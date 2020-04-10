import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';


@Component({
  selector: 'app-department-category-form',
  templateUrl: './department-category-form.component.html',
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
export class DepartmentCategoryFormComponent implements OnInit {
  @Input() title:string;
  @Input() data:any;
  @Input() COMPANY:List[];
  @Input() companyId:number;

  companyArray:List[] = [];

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {
    this.companyArray = this.COMPANY; // 默认当前 用户权限的单位 固定

    this.validateForm = this.fb.group({
      company_id: [ this.companyId, Validators.required ],
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
    this.settingConfigService.post('/api/department_category/create', opt).subscribe((res:ApiData) => {
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
      department_category_id: this.data.id,
      name: opt.name
    };
    this.settingConfigService.post('/api/department_category/update', obj).subscribe((res:ApiData) => {
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
      name: data.name
      // company_id: data.company.id
    });
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
