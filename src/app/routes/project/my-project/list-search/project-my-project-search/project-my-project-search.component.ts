import { ApiData, List } from 'src/app/data/interface.data';
import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzMessageService, NzDrawerService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-project-my-project-search',
  templateUrl: './project-my-project-search.component.html',
  styles: [
  ]
})
export class ProjectMyProjectSearchComponent implements OnInit {

  @Output() private outer = new EventEmitter();

  @Input() type_id: number;

  @Input() type_name: number;

  // @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  constructor(
    // private commonFn: CommonFunctionService,
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
    private msg: NzMessageService,
    private router: Router
  ) { }
  validateForm: FormGroup;


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

  list: any[] = [];

  // searchOption: any = {};

  // isIndeterminate = false;

  swithFlag = true;

  ngOnInit(): void {
    console.log(this.disableFlag, 'this.disableFlag');
    this.validateForm = this.fb.group({
      name: [null],  // 项目名称
      status_name: ['草稿'], // 状态名称
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
      console.log(this.validateForm.get('status_name').value, 'status_name value');
      if (this.validateForm.get('status_name').value === '草稿') {
        this.swithFlag = true;
        console.log(this.swithFlag, 'this.swithFlag1');
      } else {
        this.swithFlag = false;
        console.log(this.swithFlag, 'this.swithFlag2');
      }
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

  add(): void {
    this.router.navigateByUrl('/project/create');
  }

  edit(data: any): void {
    this.router.navigateByUrl(`/project/edit/${data.id}`);
  }

  view(data: any) {
    // this.router.navigateByUrl(`/approve/no-contract/pay/view/${data.project.id}?treaty_pay_id=${data.id}`);
    this.router.navigateByUrl(`/project/view/${data.id}`);
  }

  submitProject(id: number): void {
    this.settingsConfigService
      .post('/api/project/submit', { project_id: id })
      .subscribe((res: ApiData) => {
        if (res.code === 200) {
          this.msg.success('项目已提交');
          // this.list = this.list.filter(v => v.id !== id);
          // this.searchOptionsChange();
          this.submit();
        } else {
          this.msg.error(res.error || '提交失败，请重试');
        }
      })
  }

  deletedProject(id: number): void {
    this.settingsConfigService
      .post('/api/project/disable', { project_ids: id })
      .subscribe((res: ApiData) => {
        if (res.code === 200) {
          this.msg.success('项目已删除');
          // this.list = this.list.filter(v => v.id !== id);
          // this.searchOptionsChange();
          this.submit();
        } else {
          this.msg.error(res.error || '删除失败，请重试');
        }
      })
  }

  cancel(): void { }

  // 搜索条件发生变化
  // searchOptionsChange(option?: any) {

  //   if (option) this.searchOption = option;

  //   option = option || this.searchOption;

  //   if (this.list.length !== 0) {
  //     this.isIndeterminate = false;
  //     const object: any = {};
  //     for (const key in option) {
  //       if (option.hasOwnProperty(key)) {
  //         const element = option[key];
  //         if (key === 'code') {
  //           object.supplier_code = element;
  //         } else {
  //           object[key] = element;
  //         }
  //       }
  //     }

  //     this.listOfData = this.commonFn.filterListOfData(this.list, object);
  //   } else {
  //     this.listOfData = [];
  //   }
  // }

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
    this.settingsConfigService.post('/api/project/my', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('我的项目');
        this.listOfData = res.data.project;
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
      status_name: '草稿', // 状态名称
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
