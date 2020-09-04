import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill-report-table',
  templateUrl: './bill-report-table.component.html',
  styles: [
  ]
})
export class BillReportTableComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
    private router: Router
  ) { }

  @Output() private outer = new EventEmitter();
  @Input() type_id: number;
  @Input() type_name: number;
  @Input() page: number;
  @Input() page_size: number;
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();

  listOfData: any = [];

  loading = false;

  total = 0;

  status: any;

  companyList: any = [];

  departmentList: any = [];

  projectCategory: any = [];

  disableFlag = true;

  company_id: any = null;

  department_id: any = null;

  pageOption: any = {
    page: 1,
    page_size: 10
  }

  tax_amount_sum = 0;

  invoice_amount_sum = 0;

  ngOnInit(): void {
    console.log(this.disableFlag, 'this.disableFlag');
    this.validateForm = this.fb.group({
      company_id: [null],  // 客户单位
      department_id: [null],  // 部门
      page: [1], // 页
      page_size: [10] // 页码
    });
    this.getCompany();
    this.submit();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes, this.type_id, 'this.type_id', this.type_name, 'this.type_name');
    if (this.validateForm) {
      this.validateForm.patchValue({
        status_name: this.type_name,
        page: this.page,
        page_size: this.page_size
      });
      this.pageOption.page = this.validateForm.get('page').value
      this.pageOption.page_size = this.validateForm.get('page_size').value
      this.submit();
      console.log('this.validateForm.value', this.validateForm.value);
    }
  }

  chooseCompany(e) {
    if (e) {
      console.log('e', e);
      this.company_id = e;
      e ? this.disableFlag = false : this.disableFlag = true;
      console.log(this.disableFlag, 'disableFlag');
      this.getDepartment();
    }
  }

  chooseDepartment(e) {
    if (e) {
      this.department_id = e;
      this.getProjectCategory();
    }
  }


  getCompany() {
    this.settingsConfigService.get('/api/company/user/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有单位', res.data);
        this.companyList = res.data.company;
      }
    })
  }

  getDepartment() {
    if (!this.disableFlag) {
      this.settingsConfigService.get('/api/department/' + this.company_id).subscribe((res: ApiData) => {
        if (res.code === 200) {
          console.log('获取部门', res.data);
          this.departmentList = res.data.department;
        }
      })
    }
  }

  getProjectCategory() {
    if (!this.disableFlag) {
      this.settingsConfigService.get('/api/project_category/company/' + this.company_id).subscribe((res: ApiData) => {
        if (res.code === 200) {
          console.log('获取项目类型', res.data);
          this.projectCategory = res.data.project_category;
        }
      })
    }
  }

  view(data: any) {
    this.router.navigateByUrl(`/project/view/${data.id}`);
  }

  submit() {
    const option: any = this.validateForm.value;
    console.log(option, 'option');
    this.listRequest(option);
  }

  pageIndexChange($event: number) {
    this.validateForm.patchValue({
      page: $event,
    })
    this.submit();
  }

  pageSizeChange($event: number) {
    this.validateForm.patchValue({
      page_size: $event,
    })
    this.submit();
  }

  listRequest(option) {
    console.log('listRequest option', option);
    this.settingsConfigService.post('/api/ticket_statistics', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('发票报表');
        this.listOfData = res.data.bill;
        this.total = res.data.count;
        console.log('listRequest listOfData', this.listOfData);
        this.getSum();
        return;
      }
      return;
    });
  }

  resetForm(): void {

    this.outer.emit();
    this.validateForm.patchValue({
      company_id: null,  // 客户单位
      department_id: null,  // 部门
      page: 1, // 页
      page_size: 10 // 页码
    });
    this.submit();

  }

  getSum() {
    for (const item of this.listOfData) {
      this.tax_amount_sum += item.tax_amount
      this.invoice_amount_sum += item.invoice_amount
    }
    console.log(Number((this.tax_amount_sum).toFixed(2)), 'tax_amount_sum', this.invoice_amount_sum, 'invoice_amount_sum');
  }

}