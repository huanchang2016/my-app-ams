import { Component, OnChanges, Input, OnDestroy } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-project-income-form-c',
  templateUrl: './project-income-form-c.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class ProjectIncomeFormCComponent implements OnChanges, OnDestroy {

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
      customer_ids: [null, [Validators.required]],  // 甲方
      partyA_power: [null ],  // 甲方权责界定
      partyA_condition: [null ], // 甲方费用支付条件
      partyB: [partyB, [Validators.required]], // 乙方
      partyB_power: [null ], // 乙方服务内容
      partyB_condition: [null ] // 乙方服务 附加条件
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
      const option = this.validateForm.value;
      const value = {
        customer_ids: option.customer_ids,
        partyA_power: option.partyA_power,
        partyA_condition: option.partyA_condition,
        partyB: option.partyB,
        partyB_power: option.partyB_power,
        partyB_condition: option.partyB_condition
      };
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

    this.settingsConfigService.post('/api/project/revenue/create', opt).subscribe((res:ApiData) => {
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
    const obj = Object.assign(value, { project_revenue_id: this.data.id });

    this.settingsConfigService.post('/api/project/revenue/update', obj).subscribe((res:ApiData) => {
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
    const cus_ids:number[] = data.customers.map( v => v.id );
    this.validateForm.patchValue({
      customer_ids: cus_ids,
      partyA_power: data.partyA_power,
      partyA_condition: data.partyA_condition,
      partyB: data.partyB,
      partyB_power: data.partyB_power,
      partyB_condition: data.partyB_condition,
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
