import { debounceTime } from 'rxjs/operators';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-list-search-option',
  templateUrl: './list-search-option.component.html',
  styleUrls: ['./list-search-option.component.less']
})
export class ListSearchOptionComponent implements OnInit {
  validateForm: FormGroup;
  controlArray: Array<{ index: number; show: boolean }> = [];

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
      code: [ '' ], // 编码查询  code  || custome_code  ===>   企业识别号 || 客户（企业）编码 同时查两种编码， 取并集
      nature: [ null ], // 性质
      category: [ null ], // 类别：   客户 /  供应商
      is_user: [ -1 ] // 是否有效
    });
    this.validateForm.valueChanges.pipe(debounceTime(300)).subscribe( _ => {
      this.submit();
    });
  }

  submit() {
    let option:any = this.validateForm.value;
    let opt:any = {
      name: option.name,
      code: option.code,
      nature: option.nature,
      category: option.category,
      is_user: option.is_user
    };
    this.searchOptionsEmit.emit(opt);
  }

  resetForm(): void {
    this.validateForm.reset({
      name: '',
      code: '',
      nature: null,
      category: null,
      is_user: -1
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
