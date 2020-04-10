import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-quota-search-component',
  templateUrl: './quota-search-component.component.html',
  styleUrls: ['./quota-search-component.component.less']
})
export class QuotaSearchComponentComponent implements OnInit {
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  @Output() addContentEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [ null ]
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
