import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-bill-apply-project-search',
  templateUrl: './bill-apply-project-search.component.html',
  styleUrls: ['./bill-apply-project-search.component.less']
})
export class BillApplyProjectSearchComponent implements OnInit {
  validateForm: FormGroup;

  @Input() COMPANY:any[] = [];
  
  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      company_id: [ null ], // 单位
      name: [ null ] // 名称
    });
  }


  submit() {
    let option:any = this.validateForm.value;
    console.log(option);
    this.searchOptionsEmit.emit(option);
  }

  resetForm(): void {
    this.validateForm.patchValue({
      company_id: null,
      name: ''
    });
    this.searchOptionsEmit.emit(null)
  }

}
