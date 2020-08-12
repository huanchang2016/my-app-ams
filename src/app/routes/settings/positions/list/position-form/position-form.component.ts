import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';


@Component({
  selector: 'app-position-form',
  templateUrl: './position-form.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class PositionFormComponent implements OnInit {
  @Input() data: any;
  @Input() COMPANY: List[];
  @Input() companyId: number;

  departmentArray: List[] = [];
  departmentLoading = false;

  validateForm: FormGroup;

  submitLoading = false;

  departmentAll: List[] = [];

  department_ids: List[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      company_id: [this.companyId],
      department_id: [null],
      is_leader: [false],
      department_ids: [null],
      description: [null],
      sequence: [null]
    });

    // 获取当前单位下的 部门
    if (this.companyId) {
      this.getDepartment(this.companyId);
    }
    this.validateForm.get('company_id').valueChanges.subscribe(id => {
      this.departmentArray = [];
      this.getDepartment(id);
    });


    if (this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    } else {
      this.validateForm.get('company_id').setValidators(Validators.required);
      this.validateForm.get('department_id').setValidators(Validators.required);
    }

    // 获取所有职位
    this.getDepartmentAll();
  }

  submitForm(): void {
    console.log(this.validateForm.value);
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      // this.destroyModal(this.validateForm.value);
      if (this.data) {
        //  请求编辑 接口
        this.edit();
      } else {
        //  请求 新增接口
        this.create();
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  create() {
    const opt: any = this.validateForm.value;
    this.settingsConfigService.post('/api/position/create', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal(opt, false);
      } else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  edit() {
    const opt: any = {
      name: this.validateForm.value.name,
      is_leader: this.validateForm.value.is_leader,
      sequence: this.validateForm.value.sequence,
      description: this.validateForm.value.description
    };

    const obj: any = { position_id: this.data.id, ...opt };

    this.settingsConfigService.post('/api/position/update', obj).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal(obj, true);
      } else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  setFormValue(data: any): void {
    console.log(data, 'setformvalue data');
    const value: any = this.validateForm.value;
    console.log(value, 'setformvalue value')
    this.department_ids.push(value.department_ids);
    const empty: List[] = [];
    empty.push(null);
    this.validateForm.patchValue({
      name: data.name,
      // company_id: data.company.id,
      department_id: data.department.id,
      is_leader: data.is_leader,
      department_ids: this.department_ids,
      description: data.description,
      sequence: data.sequence
    });
  }

  getDepartment(id: number): void {
    this.departmentLoading = true;
    this.settingsConfigService.get(`/api/department/${id}`).subscribe((res: ApiData) => {
      this.departmentLoading = false;
      if (res.code === 200) {
        const data: any[] = res.data.department;
        this.departmentArray = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active)
          .map(v => {
            return { id: v.id, name: v.name };
          });
      }
    });
  }

  destroyModal(data: any, isEdit: boolean = false): void {
    this.modal.destroy({
      data,
      isEdit
    });
  }

  getDepartmentAll() {
    this.settingsConfigService.get('/api/department/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log(res, 'getDepartmentAll 获取所有职位');
        this.departmentAll = res.data.department
        console.log('departmentAll', this.departmentAll);
      }
    })
  }

}
