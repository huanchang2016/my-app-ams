import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-search',
  templateUrl: './project-search.component.html',
  styles: [
  ]
})
export class ProjectSearchComponent implements OnInit {
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

  companyList: any = [];

  departmentList: any = [];

  projectCategory: any = [];

  disableFlag = true;

  company_id: any = null;

  department_id: any = null;

  if_write_off_arr: any = [
    { name: '是', disabled: true },
    { name: '否', disabled: false }
  ];

  ngOnInit(): void {
    console.log(this.disableFlag, 'this.disableFlag');
    this.validateForm = this.fb.group({
      name: [null],  // 项目名称
      status_name: ['全部'], // 状态名称
      number: [null],  // 发票编号
      company_id: [null],  // 客户单位
      department_id: [null],  // 部门
      category_id: [null],  // 项目类型
      page: [null], // 页
      page_size: [null] // 页码
    });
    // const user = JSON.parse(localStorage.getItem('user'));
    // this.customerId = user.company?.id;
    this.getCompany();
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
    // this.router.navigateByUrl(`/approve/no-contract/pay/view/${data.project.id}?treaty_pay_id=${data.id}`);
    this.router.navigateByUrl(`/project/view/${data.id}`);
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
    this.settingsConfigService.post('/api/project', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('项目列表');
        this.listOfData = res.data.project;
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
      name: null,  // 项目名称
      status_name: '全部', // 状态名称
      number: null,  // 发票编号
      company_id: null,  // 客户单位
      department_id: null,  // 部门
      category_id: null,  // 项目类型
      page: null, // 页
      page_size: null // 页码
    });
    this.submit();
    console.log('........reset end')
  }
}
