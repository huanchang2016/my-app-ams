import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-contract-search',
  templateUrl: './contract-search.component.html',
  styles: [
  ]
})
export class ContractSearchComponent implements OnInit {
  @Output() private outer = new EventEmitter();
  @Input() type_id: number;
  @Input() type_name: number;

  constructor(
    private fb: FormBuilder,
    private commonFn: CommonFunctionService,
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

  status: any;

  // TODO: checkbox

  isAllDisplayDataChecked = false;

  isIndeterminate = false;

  listOfDisplayData: any[] = [];

  // listOfData: any[] = [];

  mapOfCheckedId: { [key: string]: boolean } = {};

  selectedMemberIds: number[] = []; // 已选成员

  list: any[] = [];

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      status_name: ['已完成'], // 状态名称
      bill_category_id: [null],  // 发票类别
      customer_id: [null],  // 客户id
      customer_contract_code: [null],  // 客户合同编码
      tax_id: [null],  // 税目id
      page: [null], // 页
      page_size: [null] // 页码
    });
    const user = JSON.parse(localStorage.getItem('user'));
    this.customerId = user.company.id;
    this.getBillCategory();
    this.getCustomerList();
    this.getTax();
    this.submit();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes, this.type_id, 'this.type_id', this.type_name, 'this.type_name');
    if (this.validateForm) {
      this.validateForm.patchValue({
        status_name: this.type_name
      });
      this.submit();
      console.log('this.validateForm.value', this.validateForm.value);
    }
  }

  refreshStatus(): void {
    if (this.listOfDisplayData.length !== 0) {
      this.isAllDisplayDataChecked = this.listOfDisplayData.every(item => this.mapOfCheckedId[item.id]);
      this.isIndeterminate =
        this.listOfDisplayData.some(item => this.mapOfCheckedId[item.id]) &&
        !this.isAllDisplayDataChecked;
    } else {
      this.isIndeterminate = false;
    }
  }

  checkAll(value: boolean): void {
    // this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    console.log(this.listOfDisplayData, 'listOfDisplayData');
    this.refreshStatus();
  }


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
    console.log(option, 'option');
    this.billList(option);
  }

  pageIndexChange($event: number) {
    this.pageOption.page = $event;
    this.submit();
  }

  pageSizeChange($event: number) {
    this.pageOption.page_size = $event;
    this.submit();
  }

  billList(option) {
    console.log('billList option', option);
    this.settingsConfigService.post('/api/bill', option).subscribe((res: ApiData) => {
      console.log('billList res', res.data);
      if (res.code === 200) {
        console.log('合同支付');
        const data = res.data.bill
        this.listOfData = data;
        this.total = res.data.count;
        this.list = data;
        this.listOfDisplayData = this.list;
        console.log('billList listOfData', this.listOfData);
        this.searchOptionsChange();
        return;
      }
      return;
    });
  }

  // 搜索条件发生变化
  searchOptionsChange(option?: any) {

    if (this.list.length !== 0) {
      this.isIndeterminate = false;
      const object: any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          object[key] = element;
        }
      }

      this.listOfData = this.commonFn.filterListOfData(this.list, object);
      console.log('合同支付: ', this.listOfData);
    }
  }

  resetForm(): void {
    console.log('........reset start')
    this.outer.emit();
    this.validateForm.patchValue({
      status_name: '已完成',
      bill_category_id: null,
      customer_id: null,
      customer_contract_code: '',
      tax_id: null,
      page: '',
      page_size: '',
    });
    this.submit();
    console.log('........reset end')
  }
}
