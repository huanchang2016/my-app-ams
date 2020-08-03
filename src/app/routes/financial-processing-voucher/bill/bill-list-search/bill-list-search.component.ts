import { Component, OnInit, EventEmitter, Output, Input, SimpleChange } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-bill-list-search',
  templateUrl: './bill-list-search.component.html',
  styles: [
  ]
})
export class BillListSearchComponent implements OnInit {
  @Input() statusArr;
  @Input() parent;

  constructor(
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
  ) { }
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();

  bill_category: any = [];

  customer: any = [];

  customerId: any = null;

  taxArr: any = [];

  tax_id: any = [];

  listOfData: any = [];

  loading = false;

  total = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  };

  ngOnInit(): void {
    console.log('status', this.parent.status);
    const user = JSON.parse(localStorage.getItem('user'));
    this.customerId = user.company.id;
    console.log('customerId', this.customerId);
    console.log('..........', this.statusArr);
    this.getBillCategory();
    this.getCustomerList();
    this.getTax();
    this.validateForm = this.fb.group({
      status_name: [null], // 状态名称
      bill_category_id: [null],  // 发票类别
      customer_id: [null],  // 客户id
      customer_contract_code: [null],  // 客户合同编码
      tax_id: [null],  // 税目id
      page: [null], // 页
      page_size: [null] // 页码
    });

  }

  // ngOnChanges(): void {
  //   console.log('11111', this.statusArr);
  //   console.log('status', this.parent.status);
  // }
  ngOnChanges(changes: SimpleChange): void {
    // if (changes.statusArr) {  // 问题
    console.log('11111', this.statusArr);
    console.log('status', this.parent.status);
    // }
  }

  // companyChanged(id: number) {
  //   this.validateForm.patchValue({
  //     status_name: ''
  //     // active: true
  //   });

  // }

  getBillCategory() {
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有发票类型', res.data);
        this.bill_category = res.data.bill_category;
      }
    })
  }

  getCustomerList() {
    this.settingsConfigService.get('/api/company/customer/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有客户列表', res.data);
        this.customer = res.data.company;
      }
    })
  }

  getTax() {
    this.settingsConfigService.get(`/api/tax/company/${this.customerId}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取税目', res.data);
        this.taxArr = res.data.tax;
      }
    })
  }

  submit() {
    const option: any = this.validateForm.value;
    console.log(option);
    this.billList(option);
  }

  searchValueChange() {
    this.submit();
  }
  typeChange(id) {
    console.log('1111')
    this.validateForm.patchValue({
      bill_category_id: id
    });
    console.log('this.validateForm.value', this.validateForm.value);
    this.billList(this.validateForm.value);
  }

  customerChange(id) {
    this.validateForm.patchValue({
      customer_id: id
    });
    this.billList(this.validateForm.value);
  }

  codeChange(code) {
    this.validateForm.patchValue({
      customer_contract_code: code
    });
    this.billList(this.validateForm.value);
  }

  taxChange(id) {
    this.validateForm.patchValue({
      tax_id: id
    });
    this.billList(this.validateForm.value);
  }

  pageIndexChange($event: number) {
    this.pageOption.page = $event;
    // this.getDataList();
    this.billList(this.validateForm.value);
  }

  pageSizeChange($event: number) {
    this.pageOption.page_size = $event;
    // this.getDataList();
    this.billList(this.validateForm.value);
  }

  billList(option) {
    console.log('billList option', option);
    this.settingsConfigService.post('/api/bill', option).subscribe((res: ApiData) => {
      console.log('billList res', res.data);
      if (res.code === 200) {
        console.log('发票列表');
        this.listOfData = res.data.bill;
        this.total = res.data.count;
        console.log('billList listOfData', this.listOfData);
      }
      return;
    });
  }

  resetForm(): void {
    this.validateForm.patchValue({
      status_name: '',
      bill_category_id: '',
      customer_id: '',
      customer_contract_code: '',
      tax_id: '',
      page: '',
      page_size: '',
    });
    this.submit();
  }
}
