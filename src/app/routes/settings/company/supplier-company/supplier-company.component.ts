import { environment } from '@env/environment';
import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService, NzDrawerService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { CompanyFormComponent } from '../component/company-form/company-form.component';
import { CompanyViewComponent } from '../component/company-view/company-view.component';
import { DrawerSearchOptionComponent } from '../component/drawer-search-option/drawer-search-option.component';

@Component({
  selector: 'app-supplier-company',
  templateUrl: './supplier-company.component.html',
  styles: [`
    .search-btn-mobile {
      width: 48px;
      height: 48px;
      line-height: 48px;
      position: fixed;
      right: 0;
      top: 60px;
      z-index: 99;
    }
  `]
})
export class SupplierCompanyComponent implements OnInit {
  environment = environment;
  
  // 单位id
  companyId:number = null;

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  searchOption:any = {};

  // TODO: checkbox
  isAllDisplayDataChecked = false;
  isOperating = false;
  isIndeterminate = false;
  listOfDisplayData: any[] = [];
  // listOfData: any[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  selectedMemberIds: number[] = []; // 已选成员
  // TODO: checkbox
  constructor(
    private modalService: NzModalService,
    private commonFn: CommonFunctionService,
    private settingsConfigService: SettingsConfigService,
    private msg: NzMessageService,
    private drawerService: NzDrawerService
  ) { }

  ngOnInit() {
    this.getDataList();
  }

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get('/api/company/supplier/all').subscribe((res:ApiData) => {
      console.log(res);
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.company;
        this.list = data.sort((a:any, b:any) => a.sequence - b.sequence);
        this.searchOptionsChange();
      }
    });
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
      nzTitle: (!data ? '新增' : '编辑') + '供应商单位',
      nzWrapClassName: 'modal-lg',
      nzContent: CompanyFormComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        type: 'supplier',
        companyId: this.companyId,
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result) {
        this.getDataList();
        // if(result.isEdit) { // 编辑
        //   this.listOfData = this.listOfData.map( v => {
        //     return result.data.company_id === v.id ? result.data : v;
        //   });
        // } else {
        //   this.getDataList();
        // }
      }
    });
  }
  
  view(data:any) {
    const viewModal = this.modalService.create({
      nzTitle: '单位详情预览',
      nzWrapClassName: 'modal-lg',
      nzContent: CompanyViewComponent,
      // nzMaskClosable: false,
      nzComponentParams: {
        data: data
      },
      nzFooter: [
        {
          label: '确定',
          type: 'primary',
          onClick: componentInstance => {
            componentInstance.destroyModal();
          }
        }
      ]
    });
  }
  // TODO: checkbox

  currentPageDataChange($event: any[]): void {
    console.log($event);
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    if(this.listOfDisplayData.length !== 0) {
      this.isAllDisplayDataChecked = this.listOfDisplayData.every(item => this.mapOfCheckedId[item.id]);
      this.isIndeterminate =
        this.listOfDisplayData.some(item => this.mapOfCheckedId[item.id]) &&
        !this.isAllDisplayDataChecked;
    }else {
      this.isIndeterminate = false;
    }
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  operateData($event:string): void {
    console.log(this.mapOfCheckedId);

    if(!this.isOperating) {

      this.selectedMemberIds = [];

      for (const key in this.mapOfCheckedId) {
        if (this.mapOfCheckedId.hasOwnProperty(key)) {
          if(this.mapOfCheckedId[key] === true) {
            this.selectedMemberIds.push(Number(key));
          }
        }
      }
      console.log(this.selectedMemberIds);
      if(this.selectedMemberIds.length !== 0) {
        this.isOperating = true;
        /***
         * 根据导出类型 导出相应的文件类型 
         *    type: string = 'image' || 'pdf' || 'excel';
         * ***/
        console.log($event);
        if($event === 'image') {
          console.log('downLoad image');

        } else if( $event === 'pdf' ) {
          console.log('downLoad PDF');

        }else {
          console.log('downLoad excel ！');
          
        }

        setTimeout(() => {
          this.listOfData.forEach(item => (this.mapOfCheckedId[item.id] = false));
          this.refreshStatus();
          this.isOperating = false;
        }, 1000);

      }else {
        this.msg.warning('选择列表为空');
      }
      

    }else {
      this.msg.warning('操作中，请稍后....');
    }
  }

  // TODO: checkbox

  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    
    if(option) this.searchOption = option;

    option = option || this.searchOption;

    if(this.list.length !== 0) {
      this.isIndeterminate = false;
      let object:any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          if(key === 'code') {
            object['supplier_code'] = element;
          }else {
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

  // 移动端搜索框
  isCollapsed:boolean = false;

  openComponent(): void {
    this.isCollapsed = true;
    const drawerRef = this.drawerService.create<DrawerSearchOptionComponent, { value: string }, string>({
      nzTitle: '查询',
      nzContent: DrawerSearchOptionComponent,
      nzContentParams: {
        value: this.searchOption
      }
    });

    // drawerRef.afterOpen.subscribe(() => { });

    drawerRef.afterClose.subscribe(data => {
      this.isCollapsed = false;
      if (data) {
        this.currentPage = 1;
        this.searchOptionsChange(data);
      }
    });
  }

  currentPage:number = 1;
  mobilePageList:any[] = [];
  nzPageIndexChange(page:number):void {
    this.currentPage = page;
    this.mobilePageList = this.listOfData.slice(this.currentPage * 10 - 10, this.currentPage * 10);
  }
  
  // disabled(id:number):void {
  //   console.log('禁用 ', id);
  //   this.settingsConfigService.post('/api/company/disable', { company_ids: [id]}).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       this.list = this.list.map( v => {
  //         if(v.id === id) {
  //           v.active = false;
  //         }
  //         return v;
  //       });
  //       this.listOfData = this.list.filter(v => v.active);
  //     }
  //   });
  // }
  // enabled(id:number):void {
  //   console.log('启用 ', id);
  // }
}
