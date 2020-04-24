import { debounceTime } from 'rxjs/operators';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-company-search-option',
  templateUrl: './search-option.component.html',
  styleUrls: ['./search-option.component.less']
})
export class CompanySearchOptionComponent implements OnInit {
  validateForm: FormGroup;
  controlArray: Array<{ index: number; show: boolean }> = [];
  isCollapse = true;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  @Output() addContentEmit: EventEmitter<any> = new EventEmitter();
  @Output() operateDataEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [ '' ], // 名称
      code: [ '' ], // 编码查询  code  || custome_code  ===>   企业识别号 || 客户（企业）编码   查一个编码， 取交集
      nature: [ null ], // 性质
      active: [ true ] // 是否有效
    });
    this.validateForm.valueChanges.pipe(debounceTime(300)).subscribe( _ => {
      this.searchOptionsEmit.emit(this.validateForm.value);
    });
  }

  submit() {
    let option:any = this.validateForm.value;
    this.searchOptionsEmit.emit(option);
  }

  resetForm(): void {
    this.validateForm.reset({
      name: '',
      code: '',
      nature: null,
      active: true
    });
    // this.searchOptionsEmit.emit(null)
  }
  /*** 新增列表内容 ***/
  add() {
    this.addContentEmit.emit();
  }

  /***
   * 多选操作， 可以传递参数
   *    参数用于区分操作内容，如：  下载、导出等功能
   * ****/
  operateData(type:string) {
    this.operateDataEmit.emit(type);
  }

}
