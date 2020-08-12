import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-contract-department-head-search',
  templateUrl: './no-contract-department-head-search.component.html',
  styles: [
  ]
})
export class NoContractDepartmentHeadSearchComponent implements OnInit {

  @Output() private outer = new EventEmitter();
  @Input() type_id: number;
  @Input() type_name: number;

  constructor(
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
    private router: Router
  ) { }
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();

  contract: any = [];

  customer: any = [];

  // customerId: any = null;

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

  supplierList: any = [];

  if_write_off_arr: any = [
    { name: '是', disabled: true },
    { name: '否', disabled: false }
  ];

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      status_name: ['全部'], // 状态名称
      invoice_number: [null],  // 发票编号
      pay_company: [null],  // 支付公司
      if_write_off: [null],  // 是否冲销
      page: [null], // 页
      page_size: [null] // 页码
    });
    const user = JSON.parse(localStorage.getItem('user'));
    // this.customerId = user.company?.id;
    this.getSupplier();
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


  getSupplier() {
    this.settingsConfigService.get('/api/company/supplier/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有供应商', res.data);
        this.supplierList = res.data.company;
      }
    })
  }

  view(data: any) {
    this.router.navigateByUrl(`/approve/no-contract/pay/view/${data.project.id}?treaty_pay_id=${data.id}`);
  }

  routerTo(data: any) {
    this.router.navigateByUrl(`/project/view/${data.project.id}`);
  }

  submit() {
    const option: any = this.validateForm.value;
    console.log(option, 'option');
    this.listRequest(option);
  }

  pageIndexChange($event: number) {
    this.pageOption.page = $event;
    this.submit();
  }

  pageSizeChange($event: number) {
    this.pageOption.page_size = $event;
    this.submit();
  }

  listRequest(option) {
    console.log('listRequest option', option);
    this.settingsConfigService.post('/api/treaty_pay/department_head', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('非合约 支付列表(部门负责人)');
        this.listOfData = res.data.treaty_pay;
        this.total = res.data.count;
        console.log('listRequest listOfData', this.listOfData);
        return;
      }
      return;
    });
  }

  resetForm(): void {
    console.log('........reset start')
    this.outer.emit();
    this.validateForm.patchValue({
      status_name: '全部', // 状态名称
      invoice_number: '',  // 发票编号
      pay_company: '',  // 支付公司
      if_write_off: null,  // 是否冲销
      page: null, // 页
      page_size: null // 页码
    });
    this.submit();
    console.log('........reset end')
  }

}
