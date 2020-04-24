import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { NzDrawerRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-list-drawer-search-option',
  templateUrl: './list-drawer-search-option.component.html',
  styleUrls: ['./list-drawer-search-option.component.less']
})
export class ListDrawerSearchOptionComponent implements OnInit {
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
      code: [ '' ], // 编码查询  code  || custome_code  ===>   企业识别号 || 客户（企业）编码 同时查两种编码， 取并集
      nature: [ null ], // 性质
      category: [ null ], // 类别：   客户 /  供应商
      is_user: [ -1 ] // 是否有效
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
      category: null,
      is_user: -1
    });
    this.close();
  }
  setData(): void {
    this.validateForm.patchValue({
      name: this.value.name,
      code: this.value.code,
      nature: this.value.nature,
      category: this.value.category,
      is_user: this.value.is_user
    });
    this.close();
  }

  
  close(): void {
    let option:any = this.validateForm.value;
    let opt:any = {
      name: option.name,
      code: option.code,
      nature: option.nature,
      category: option.category,
      is_user: option.is_user
    };
    this.drawerRef.close(opt);
  }

}
