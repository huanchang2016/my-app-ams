import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-financial-processing-voucher-search-component',
  templateUrl: './search-component.component.html',
  styleUrls: ['./search-component.component.less']
})
export class FinancialProcessingVoucherSearchComponentComponent implements OnInit {
  projectList:any[] = [];
  validateForm: FormGroup;

  @Output() selectProjectChange:EventEmitter<any> = new EventEmitter();
  @Output() searchValueChange:EventEmitter<any> = new EventEmitter();

  constructor(
    private settingsConfigService: SettingsConfigService,
    private fb: FormBuilder
  ) {
    this.getConfigs();
  }
  
  ngOnInit() {
    this.validateForm = this.fb.group({
      project_id: [ null ], // 项目
      // number: [ null ] // 项目编号
    });

    // this.validateForm.valueChanges.pipe(debounceTime(300)).subscribe(_ => {
    //   this.searchValueChange.emit(this.validateForm.value);
    // })
  }

  getConfigs() {
    this.settingsConfigService.get('/api/project/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectList = res.data.project;
      }
    });
    // this.settingsConfigService.get('/api/company/user/all').subscribe((res:ApiData) => {
    //   if(res.code === 200) {
    //     let data:any[] = res.data.company;
    //     this.companyArray = data.map( v => {
    //       return { id: v.id, name: v.name };
    //     });
    //     if(this.companyArray.length === 1) {
    //       this.validateForm.patchValue({
    //         project_id: this.companyArray[0].id
    //       });
    //     }
    //   }
    // });
  }

  projectChange():void {
    this.selectProjectChange.emit(this.validateForm.value.project_id);
  }
  
  


  submit() {
    let option:any = this.validateForm.value;
    console.log(option);
  }

  resetForm(e:Event): void {
    e.preventDefault();
    this.validateForm.patchValue({
      project_id: null,
      // number: ''
    });
  }
}
