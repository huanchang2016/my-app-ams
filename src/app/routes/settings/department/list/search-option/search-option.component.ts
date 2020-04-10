import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { List } from 'src/app/data/interface.data';

@Component({
  selector: 'app-department-list-search-option',
  templateUrl: './search-option.component.html',
  styleUrls: ['./search-option.component.less']
})
export class DepartmentListSearchOptionComponent implements OnChanges, OnInit {
  validateForm: FormGroup;
  controlArray: Array<{ index: number; show: boolean }> = [];
  isCollapse = true;

  @Input() COMPANY:List[];

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  @Output() companyValueChange: EventEmitter<any> = new EventEmitter();
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
      name: [ null ], // 名称
      active: [ true ] // 是否有效
    });


    this.validateForm.get('company_id').valueChanges.subscribe( id => {
      this.companyChanged(id);
    });
  }

  companyChanged(id:number) {
    /**** 单位发生变化
     *    所有的数据列表都需要发生变化
     *    但是，查询表单里面的active 仍然需要重置为 true
     * *****/
    this.companyValueChange.emit({company_id: id});
    this.validateForm.patchValue({
      name: '',
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
  }
  /*** 新增列表内容 ***/
  add() {
    this.addContentEmit.emit();
  }
}
