import { Component, OnChanges, Input, OnDestroy } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-subsidy-income-form-c',
  templateUrl: './subsidy-income-form-c.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class SubsidyIncomeFormCComponent implements OnChanges, OnDestroy {

  @Input() projectInfo:any;
  @Input() data:any;

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settings: SettingsService,
    private settingsConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {
    const partyB:string = this.settings.user.company ? this.settings.user.company.name : null;
    this.validateForm = this.fb.group({
      company_id: [null, [Validators.required]],
      name: [null, [Validators.required]],
      condition: [null, [Validators.required]],
      calculation_basis: [null, [Validators.required]],
      remark: [null, [Validators.required]]
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
    console.log(this.validateForm.value);
    if(this.validateForm.valid) {
      // this.destroyModal(this.validateForm.value);
      const value = this.validateForm.value;
      if(this.data) {
        //  请求编辑 接口
        this.edit(value);
      }else {
        //  请求 新增接口
        this.create(value);
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  create(value:any) {
    const opt = Object.assign(value, { project_id: this.projectInfo.id });

    this.settingsConfigService.post('/api/subsidy/income/create', opt).subscribe((res:ApiData) => {
      console.log(res, 'create success!');
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal(opt, false);
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  edit(value:any) {
    const obj = Object.assign(value, { income_id: this.data.id });

    this.settingsConfigService.post('/api/subsidy/income/update', obj).subscribe((res:ApiData) => {
      console.log(res, 'update success!');
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
      company_id: data.company.id,
      name: data.name,
      condition: data.condition,
      calculation_basis: data.calculation_basis,
      remark: data.remark
    });
  }


  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }

  ngOnChanges(): void {
  }


  ngOnDestroy() {

  }
}
