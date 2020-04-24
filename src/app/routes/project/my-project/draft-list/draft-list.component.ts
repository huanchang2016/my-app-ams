import { ProjectDrawerSearchOptionComponent } from '../../component/project-drawer-search-option/project-drawer-search-option.component';
import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzMessageService, NzDrawerService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-draft-list',
  templateUrl: './draft-list.component.html',
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
export class DraftListComponent implements OnInit {
  // 单位id
  companyId:number = null;
  companyArray:any[] = [];

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = true;
  searchOption:any = {};

  total = 0;

  pageOption:any = {
    page: 1,
    page_size: 10
  };

  isAllDisplayDataChecked = false;
  isOperating = false;
  isIndeterminate = false;
  listOfDisplayData: any[] = [];
  // listOfData: any[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  selectedMemberIds: number[] = []; // 已选成员

  constructor(
    private commonFn: CommonFunctionService,
    private settingsConfigService: SettingsConfigService,
    private msg: NzMessageService,
    private drawerService: NzDrawerService,
    private router: Router
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
    this.getDataList();
  }

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get('/api/project/draft/my', this.pageOption).subscribe((res:ApiData) => {
      console.log(res);
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.project;
        this.total = res.data.count;
        this.list = data.filter(v => v.draft);
        this.listOfDisplayData = this.list;
        this.searchOptionsChange();
      }
    });
  }
  

  add() :void {
    this.router.navigateByUrl('/project/create');
  }

  edit(data:any): void {
    this.router.navigateByUrl(`/project/edit/${data.id}`);
  }

  
  view(data:any) {
    this.router.navigateByUrl(`/project/view/${data.id}`);
  }
  // TODO: checkbox

  // currentPageDataChange($event: any[]): void {
  //   console.log($event);
  //   this.listOfDisplayData = $event;
  //   this.refreshStatus();
  // }
  pageIndexChange($event:number) {
    this.pageOption.page = $event;
    this.getDataList();
  }
  pageSizeChange($event:number) {
    this.pageOption.page_size = $event;
    this.getDataList();
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
    // this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  companyValueChange(id:number) {
    console.log(id, 'company select change!');
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
    }else {
      this.listOfData = [];
    }
  }

  // 移动端搜索框
  isCollapsed:boolean = false;

  openComponent(): void {
    this.isCollapsed = true;
    const drawerRef = this.drawerService.create<ProjectDrawerSearchOptionComponent, { value: string }, string>({
      nzTitle: '查询',
      nzContent: ProjectDrawerSearchOptionComponent,
      nzContentParams: {
        value: this.searchOption
      }
    });

    // drawerRef.afterOpen.subscribe(() => { });

    drawerRef.afterClose.subscribe(data => {
      this.isCollapsed = false;
      if (data) {
        this.pageOption.page = 1;
        this.searchOptionsChange(data);
      }
    });
  }

  cancel(): void {}

  submitProject(id:number): void {
    this.settingsConfigService
        .post('/api/project/submit', { project_id: id })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('项目已提交');
            this.list = this.list.filter( v => v.id !== id);
            this.searchOptionsChange();
          }else {
            this.msg.error(res.error || '提交失败，请重试');
          }
    })
  }
  deletedProject(id:number): void {
    this.settingsConfigService
        .post('/api/project/disable', { project_ids: id })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('项目已删除');
            this.list = this.list.filter( v => v.id !== id);
            this.searchOptionsChange();
          }else {
            this.msg.error(res.error || '提交失败，请重试');
          }
    })
  }
}
