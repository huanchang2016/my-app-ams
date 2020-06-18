import { map } from 'rxjs/operators';
import { SettingsService } from '@delon/theme';
import { zip } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ContractContractFormComponent } from '../component/contract-form/contract-form.component';


@Component({
  selector: 'app-contract-list',
  templateUrl: './list.component.html',
})
export class ContractListComponent implements OnInit {
  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;

  constructor(
    private modalService: NzModalService,
    private commonFn: CommonFunctionService,
    private msg: NzMessageService,
    private settings: SettingsService,
    private settingsConfigService: SettingsConfigService
  ) {
    this.getConfigs();
  }

  ngOnInit() {
    this.getDataList();
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
      nzTitle: (!data ? '新增' : '编辑') + '合同',
      nzContent: ContractContractFormComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        supplierList: this.supplierList,
        companyList: this.companyList
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
    this.settingsConfigService.post('/api/contract/disable', { contract_id: id })
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
      
      this.listOfData.forEach(item => (this.showContractExpand[item.id] = false));
      
    }
  }
  
  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get(`/api/contract/all`).subscribe((res:ApiData) => {
      console.log(res, 'contract category list');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.contract;
        this.list = data.sort((a:any, b:any) => a.sequence - b.sequence);
        this.searchOptionsChange();
      }
    });
  }

  cancel() {}

  showContractExpand:{ [key: string]: boolean } = {};

  splitContract(id:number):void {
    this.showContractExpand[id] = !this.showContractExpand[id];
  }

  supplierList:any[] = [];
  companyList:any[] = [];

  getConfigs() {
    /****
     * 合同创建  
     *    1. 供应商  supplierList
     *    2. 所属单位 companyList  用户单位
     *    3. 所属部门 departmentList  根据单位id获取
     *    4. 服务商类型 根据单位id获取  service_category 
     *    5. 合同类型   contractCategory
     * 
     * ******/
    zip(
      this.settingsConfigService.get('/api/company/supplier/all'),
      this.settingsConfigService.get('/api/company/user/all')
    ).pipe(
      map( ([a, b]) => [a.data.company, b.data.company])
    ).subscribe(([supplierList, companyList]) => {
      this.supplierList = supplierList;
      this.companyList = companyList;
    })
    
  }
}
