import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { List, ApiData } from 'src/app/data/interface.data';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './list.component.html',
  styles: []
})
export class DepartmentListComponent implements OnInit {
  companyArray: List[] = [];
  // 单位id
  companyId:number = null;

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  searchOption:any = {};

  constructor(
    private modalService: NzModalService,
    private commonFn: CommonFunctionService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) {
    this.settingsConfigService.get('/api/company/user/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        let data:any[] = res.data.company;
        this.companyArray = data.map( v => {
          return { id: v.id, name: v.name };
        });
      }
    })
  }

  ngOnInit() {

  }

  add() :void {
    console.log('新增 内容')
    this.createComponentModal();
  }

  edit(data:any): void {
    console.log('编辑 内容');
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '部门',
      nzContent: DepartmentFormComponent,
      nzMaskClosable: false,
      nzWrapClassName: 'modal-lg',
      nzComponentParams: {
        companyId: this.companyId,
        COMPANY: this.companyArray,
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result) {
        this.getDataList();
      }
    });

  }
  disabled(id:number):void {
    this.settingsConfigService.post('/api/department/disable', { department_ids: [id] })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('禁用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.list = this.list.map( v => {
              if(v.id === id ) v.active = false;
              return v;
            });
          }else {
            this.msg.error(res.error || '禁用失败')
          }
    });
  }
  enabled(id:number):void {
    this.settingsConfigService.post('/api/department/enable', { department_ids: [id] })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('启用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.list = this.list.map( v => {
              if(v.id === id ) v.active = true;
              return v;
            });
          }else {
            this.msg.error(res.error || '启用失败')
          }
    })
  }

  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    if(this.list.length !== 0) {
      let object:any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          if(key !== 'company_id') {
            object[key] = element;
          }
        }
      }
      this.listOfData = this.commonFn.filterListOfData(this.list, object);
      
      if(this.listOfData.length > 10) {
        this.mobilePageList = this.listOfData.slice(0, 10);
      }else {
        this.mobilePageList = this.listOfData;
      }
    }
  }
  // 单位筛选发生变化
  companyValueChange({company_id}):void {
    this.companyId = company_id;
    this.getDataList(company_id);
  }
  getDataList(id:number = this.companyId) { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get(`/api/department/${id}`).subscribe((res:ApiData) => {
      console.log(res);
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.department;
        this.list = data.sort((a:any, b:any) => a.sequence - b.sequence);
        this.searchOptionsChange();
      }
    });
  }
  
  currentPage:number = 1;
  mobilePageList:any[] = [];
  nzPageIndexChange(page:number):void {
    this.currentPage = page;
    this.mobilePageList = this.listOfData.slice(this.currentPage * 10 - 10, this.currentPage * 10);
  }

}
