import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approve-search',
  templateUrl: './approve-search.component.html',
  styles: [
  ]
})
export class ApproveSearchComponent implements OnInit {
  @Output() private outer = new EventEmitter();
  @Input() type_id: number;
  @Input() type_name: number;
  @Input() page: number;
  @Input() page_size: number;

  constructor(
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
    private router: Router
  ) { }
  validateForm: FormGroup;

  @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();

  listOfData: any = [];

  loading = false;

  total = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  };

  status: any;

  supplierList: any = [];

  start_amount: number;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      status_name: ['待审批'], // 状态名称
      contract_name: [null],  // 合同名称
      contract_number: [null],  // 合同编号
      supplier_id: [null],  // 供应商
      // start_amount: [null], // 起始金额
      // end_amount: [null],  // 终止金额
      invoice_number: [null],  // 发票编号
      page: [1], // 页
      page_size: [10] // 页码
    });
    console.log(this.pageOption, 'pageOption');
    const user = JSON.parse(localStorage.getItem('user'));
    this.getSupplier();
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


  getSupplier() {
    this.settingsConfigService.get('/api/company/supplier/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('获取所有供应商', res.data);
        this.supplierList = res.data.company;
      }
    })
  }

  submit() {
    const option: any = this.validateForm.value;
    console.log(option, 'option');
    this.listRequest(option);
  }

  pageIndexChange($event: number) {
    this.pageOption.page = $event;
    console.log(this.pageOption.page, 'page');
    this.submit();
  }

  pageSizeChange($event: number) {
    this.pageOption.page_size = $event;
    console.log(this.pageOption.page_size, 'page_size');
    this.submit();
  }

  endChange($event: number) {

  }

  startChange($event: number) {

  }

  listRequest(option) {
    console.log('listRequest option', option);
    this.settingsConfigService.post('/api/contract_pay/approval/list', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('支付审批');
        this.listOfData = res.data.contract_pay;
        this.total = res.data.count;
        console.log('listRequest listOfData', this.listOfData);
        return;
      }
      return;
    });
  }

  resetForm(): void {

    this.outer.emit();
    this.validateForm.patchValue({
      status_name: '待审批', // 状态名称
      contract_name: '',  // 合同名称
      contract_number: null,  // 合同编号
      supplier_id: null,  // 供应商
      // start_amount: null, // 起始金额
      // end_amount: null,  // 终止金额
      invoice_number: '',  // 发票编号
      page: 1, // 页
      page_size: 10 // 页码
    });
    this.submit();

  }

  view(data: any) {
    this.router.navigateByUrl(`/project/view/${data.project.id}`);
  }
}
