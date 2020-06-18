import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { List } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-contract-manage-search-form',
  templateUrl: './contract-search-form.component.html',
  styleUrls: ['./contract-search-form.component.less']
})
export class ContractContractSearchFormComponent implements OnInit {
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  @Output() addContentEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      company_id: [ null ], // 单位
      // department: [null ],
      name: [ null ] // 名称
      // active: [ true ] // 是否有效
    });

    // this.validateForm.get('company_id').valueChanges.subscribe( id => {
    //   this.companyChanged(id);
    // });
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
      name: ''
    });
    this.submit();
  }
  /*** 新增列表内容 ***/
  add() {
    this.addContentEmit.emit();
  }
}
