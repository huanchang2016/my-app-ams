import { Component, OnInit } from '@angular/core';
import { NzModalService, NzMessageService, NzDrawerService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { CompanyFormComponent } from '../component/company-form/company-form.component';

import html2canvas from 'html2canvas';
import { CompanyViewComponent } from '../component/company-view/company-view.component';
import { ListDrawerSearchOptionComponent } from './list-drawer-search-option/list-drawer-search-option.component';

@Component({
  selector: 'app-list-all',
  templateUrl: './list-all.component.html',
  styles: [`
    ::ng-deep canvas {
      height: auto;
      min-height: 300px;
    }
    ::ng-deep .ant-card-meta-title {
      white-space: normal;
    }
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
export class ListAllComponent implements OnInit {
  // 单位id
  companyId: number = null;

  list: any[] = [];
  listOfData: any[] = [];
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
    private settingsConfigService: SettingsConfigService,
    private msg: NzMessageService,
    private drawerService: NzDrawerService
  ) { }

  ngOnInit() {
    this.getDataList();
  }

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get('/api/company/all').subscribe((res: ApiData) => {
      console.log(res);
      this.loading = false;
      if (res.code === 200) {
        let data: any[] = res.data.company;
        this.list = data.sort((a: any, b: any) => a.sequence - b.sequence);
        // this.listOfData = this.list.filter(v => v.active);
        this.searchOptionsChange();

      }
    });
  }


  add(): void {
    this.createComponentModal();
  }

  edit(data: any): void {
    this.createComponentModal(data);
  }

  createComponentModal(data: any = null): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '用户单位',
      nzWrapClassName: 'modal-lg',
      nzContent: CompanyFormComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        companyId: this.companyId,
        type: 'user',
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
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

  isVisibleModalBox: boolean = false; // 预览容器
  showDownLoadDataList: boolean = false; // 下载数据列表容器： 下载之前展示， 下载后隐藏
  operateType: string = 'image' || 'pdf' || 'excel';

  operateData($event: string): void {

    if (!this.isOperating) {

      this.selectedMemberIds = [];

      for (const key in this.mapOfCheckedId) {
        if (this.mapOfCheckedId.hasOwnProperty(key)) {
          if (this.mapOfCheckedId[key] === true) {
            this.selectedMemberIds.push(Number(key));
          }
        }
      }
      if (this.selectedMemberIds.length !== 0) {
        this.isOperating = true;
        this.isVisibleModalBox = true;
        this.showDownLoadDataList = true;

        /***
         * 根据导出类型 导出相应的文件类型 
         *    type: string = 'image' || 'pdf' || 'excel';
         * ***/
        if ($event === 'image') {
          console.log('downLoad image');
          this.operateType = 'image';
        } else if ($event === 'pdf') {
          console.log('downLoad PDF');
          this.operateType = 'pdf';
        } else {
          console.log('downLoad excel ！');
          this.operateType = 'excel';
        }

        setTimeout(() => {
          this.listOfData.forEach(item => (this.mapOfCheckedId[item.id] = false));
          this.refreshStatus();
          this.isOperating = false;
        }, 1000);

      } else {
        this.msg.warning('选择列表为空');
      }


    } else {
      this.msg.warning('操作中，请稍后....');
    }
  }

  // TODO: checkbox

  downLoad() {
    if (this.operateType === 'image') {
      html2canvas(document.querySelector('#downLoadFileBox .file-box'), { scale: 1 }).then((canvas: any) => {

        this.showDownLoadDataList = false;
        // document.querySelector('#downLoadFileBox').appendChild(canvas);

        let img: any = canvas.toDataURL("image/jpg");

        this.saveFile(img.replace("image/jpeg", "image/octet-stream"), new Date().getTime() + ".jpeg");
        this.isVisibleModalBox = false;
      });

    }



  }

  saveFile(data: any, filename: string) {
    let save_link: any = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
  }
  handleCancel() {
    this.isVisibleModalBox = false;
  }

  // 搜索条件发生变化
  searchOptionsChange(option?: any) {

    if(option) this.searchOption = option;

    option = option || this.searchOption;

    if (this.list.length !== 0) {
      this.isIndeterminate = false;
      let list:any[] = this.list;
      if (option) {
        if (option.name) {
          let name: string = option.name.trim();
          list = list.filter(v => v.indexOf(name) !== -1 ? true : false);
        }
        if (option.code) {
          let code: string = option.code.trim();
          list = list.filter(v => {
            if (v.customer_code) {
              return v.customer_code.indexOf(code) !== -1 ? true : false;
            }

            if (v.supplier_code) {
              return v.supplier_code.indexOf(code) !== -1 ? true : false;
            }
          })
        }
        if (option.nature) {
          list = list.filter(v => !v.nature ? false : v.nature.id === option.nature);
        }

        if(option.category && option.category !== -1) {
          let category:string = option.category;
          list = list.filter( v => {
            return v[category];
          });
        }

        if (option.is_user === true || option.is_user === false) {
          list = list.filter(v => v.is_user === option.is_user)
        }

      }
      
      this.listOfData = list;
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
    const drawerRef = this.drawerService.create<ListDrawerSearchOptionComponent, { value: string }, string>({
      nzTitle: '查询',
      nzContent: ListDrawerSearchOptionComponent,
      nzContentParams: {
        value: ''
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
