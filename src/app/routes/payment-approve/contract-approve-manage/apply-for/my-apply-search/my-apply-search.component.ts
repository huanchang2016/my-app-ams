import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-apply-search',
  templateUrl: './my-apply-search.component.html',
  styles: [
  ]
})
export class MyApplySearchComponent implements OnInit {
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

  status: any;

  supplierList: any = [];

  start_amount: number;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      status_name: ['进行中'], // 状态名称
      contract_name: [null],  // 合同名称
      contract_number: [null],  // 合同编号
      supplier_id: [null],  // 供应商
      // start_amount: [null], // 起始金额
      // end_amount: [null],  // 终止金额
      invoice_number: [null],  // 发票编号
      page: [1], // 页
      page_size: [10] // 页码
    });
    const user = JSON.parse(localStorage.getItem('user'));
    this.getSupplier();
    this.submit();
  }

  pageOption: any = {
    page: 1,
    page_size: 10
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

  endChange($event: number) {

  }

  startChange($event: number) {

  }

  view(data: any) {
    this.router.navigateByUrl(`/approve/contract/pay/view/${data.project.id}?contract_pay_id=${data.id}`);
  }

  routerTo(data: any) {
    this.router.navigateByUrl(`/project/view/${data.project.id}`);
  }

  listRequest(option) {
    console.log('listRequest option', option);
    this.settingsConfigService.post('/api/contract_pay/my', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('支付列表');
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
      status_name: '进行中', // 状态名称
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

}
