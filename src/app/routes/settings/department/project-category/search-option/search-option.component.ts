import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-project-category-search-option',
  templateUrl: './search-option.component.html',
  styleUrls: ['./search-option.component.less']
})
export class SearchOptionComponent implements OnInit {
  validateForm: FormGroup;

  @Input() COMPANY:List[];
  @Input() DEPARTMENT:List[];

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  @Output() companyValueChange: EventEmitter<any> = new EventEmitter();
  @Output() departmentValueChange: EventEmitter<any> = new EventEmitter();
  @Output() addContentEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if(changes.COMPANY) {
    // 请求获取 上层数据， 如： 职位事公司下的数据
      if(this.COMPANY.length === 1) {
        this.validateForm.patchValue({
          company_id: this.COMPANY[0].id
        });
      }
    }
    
  }
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      company_id: [ null ], // 单位
      department: [null ],
      name: [ null ], // 名称
      active: [ true ] // 是否有效
    });

    this.validateForm.get('company_id').valueChanges.subscribe( id => {
      if(id) {
        this.companyChanged(id);
      }
    });

    this.validateForm.get('department').valueChanges.subscribe( id => {
      if(id) {
        this.departmentValueChange.emit( { department_id: id });
      }
    });
  }

  companyChanged(id:number) {
    /**** 单位发生变化
     *    1. 所有的数据列表都需要发生变化
     *    但是，查询表单里面的active 仍然需要重置为 true
     * 
     *    2. 根据单位获取单位下的部门
     * *****/
    this.companyValueChange.emit({company_id: id});
    this.validateForm.patchValue({
      name: '',
      department: null,
      active: true
    });
  }

  submit() {
    let option:any = this.validateForm.value;
    this.searchOptionsEmit.emit(option);
  }

  searchValueChange() {
    this.submit();
  }

  resetForm(): void {
    this.validateForm.patchValue({
      name: '',
      active: true
    });
    this.submit();
  }
  /*** 新增列表内容 ***/
  add() {
    this.addContentEmit.emit();
  }
}
