import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { NzDrawerRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-project-drawer-search-option',
  templateUrl: './project-drawer-search-option.component.html',
  styleUrls: ['./project-drawer-search-option.component.less']
})
export class ProjectDrawerSearchOptionComponent implements OnInit {
  @Input() value: any;

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private fb: FormBuilder,
    public settingsConfigService: SettingsConfigService
  ) {}

  validateForm: FormGroup;
  controlArray: Array<{ index: number; show: boolean }> = [];

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [ '' ], // 名称
      code: [ '' ], // 编码查询  code  || custome_code  ===>   企业识别号 || 客户（企业）编码   查一个编码， 取交集
      nature: [ null ], // 性质
      active: [ true ] // 是否有效
    });
    if(this.value) {
      this.setData();
    }
  }

  submit() {
    this.close();
  }

  resetForm(): void {
    this.validateForm.reset({
      name: '',
      code: '',
      nature: null,
      active: true
    });
    this.close();
  }

  setData(): void {
    this.validateForm.patchValue({
      name: this.value.name,
      code: this.value.code,
      nature: this.value.nature,
      active: true
    });
  }

  
  close(): void {
    let option:any = this.validateForm.value;
    let opt:any = {
      name: option.name,
      code: option.code,
      nature: option.nature,
      active: option.active
    };
    this.drawerRef.close(opt);
  }
}
