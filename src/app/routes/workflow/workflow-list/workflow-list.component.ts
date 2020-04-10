import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { WorkflowFormComponent } from './workflow-form/workflow-form.component';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.component.html',
  styles: []
})
export class WorkflowListComponent implements OnInit {
  companyArray: List[] = [];
  // 单位id
  companyId:number = null;

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  
  showExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示

  constructor(
    private modalService: NzModalService,
    private commonFn: CommonFunctionService,
    private msg: NzMessageService,
    private settingConfigService: SettingsConfigService
  ) {
    this.settingConfigService.get('/api/company/user/all').subscribe((res:ApiData) => {
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
    this.createComponentModal();
  }

  edit(data:any): void {
    console.log('data', data);
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '流程',
      nzContent: WorkflowFormComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
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

  showNodeList(id:number):void { // 切换供应商合约展示 与否 ？
    this.showExpand[id] = !this.showExpand[id];
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
    }
  }
  // 单位筛选发生变化
  companyValueChange({company_id}):void {
    this.companyId = company_id;
    this.listOfData = this.list = []; // 单位变化时， 数据重置
    this.getDataList(company_id);
  }
  getDataList(id:number = this.companyId) { // 获取单位下的数据
    if(!id) {
      return;
    }
    this.loading = true;
    this.settingConfigService.get(`/api/workflow/company/${id}`).subscribe((res:ApiData) => {
      console.log(res, 'workflow/company');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.workflow;
        this.list = data;
        this.searchOptionsChange();
      }
    });
  }
}
