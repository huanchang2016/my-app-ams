import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';


@Component({
  selector: 'app-project-supplier-form',
  templateUrl: './project-supplier-form.component.html',
  styleUrls: ['./project-supplier-form.component.less']
})
export class ProjectSupplierFormComponent implements OnInit {

  @Input() data?:any;
  @Input() projectId:any;
  @Input() supplierArray:any;

  basicInfoForm: FormGroup; // 基本资料
  submitBasicLoading:boolean = false;

  // 供应商单位
  companyArray:any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) {
    this.settingsConfigService.get('/api/company/supplier/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        let data:any[] = res.data.company;
        this.companyArray = data.filter(v => v.active).sort((a:any, b:any) => a.sequence - b.sequence);
      }
    })
  }

  supplierIds:number[] = [];

  ngOnInit() {
    this.basicInfoForm = this.fb.group({
      supplier_id: [null, [Validators.required]]
    });

    this.supplierIds = this.supplierArray.map( v => v.id);

    if(this.data) {
      console.log(this.data);
      this.basicInfoForm.patchValue({
        supplier_id: this.data.id
      })
    }
  }

  submitbasicInfoForm(): void {
    for (const i in this.basicInfoForm.controls) {
      this.basicInfoForm.controls[i].markAsDirty();
      this.basicInfoForm.controls[i].updateValueAndValidity();
    }
    if(this.basicInfoForm.valid) {
      let value:any = this.basicInfoForm.value;

      this.submitBasicLoading = true;
      if(this.data) {
        //  请求编辑 接口
        let option:any = {
          project_id: this.projectId,
          new_supplier_id: value.supplier_id,
          old_supplier_id: this.data.id
        };
        this.editBasicInfo(option);
      }else {
        //  请求 新增接口
        let opt:any = {
          project_id: this.projectId,
          supplier_id: value.supplier_id
        };
        this.createBasicInfo(opt);
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  
  createBasicInfo(opt:any) {
    this.settingsConfigService.post('/api/supplier/project/create', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitBasicLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal({});
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }
  editBasicInfo(opt:any) {

    this.settingsConfigService.post('/api/supplier/project/update', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitBasicLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal({});
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  // 禁用已经存在的供应商单位 选项
  isDisabled(id:number):boolean {
    return this.supplierIds.includes(id);
  }

  destroyModal(data:any = null): void {
    this.modal.destroy(data);
  }
}
