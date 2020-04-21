import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-bill-reminder-invoices-search',
  templateUrl: './invoices-search.component.html',
  styleUrls: ['./invoices-search.component.less']
})
export class BillReminderInvoicesSearchComponent implements OnInit {
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  @Output() addContentEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [ null ], // 名称
      active: [ true ] // 是否有效
    });

  }

  companyChanged(id:number) {
    /**** 单位发生变化
     *    1. 所有的数据列表都需要发生变化
     *    但是，查询表单里面的active 仍然需要重置为 true
     * 
     *    2. 根据单位获取单位下的部门
     * *****/
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
    this.submit();
  }
  /*** 新增列表内容 ***/
  add() {
    this.addContentEmit.emit();
  }
}
