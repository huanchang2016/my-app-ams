import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-for-approval-list',
  templateUrl: './for-approval-list.component.html',
  styles: []
})
export class ForApprovalListComponent implements OnInit {
  // 单位id
  companyId:number = null;
  companyArray:any[] = [];

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  searchOption:any = {};

  total = 0;

  pageOption:any = {
    page: 1,
    page_size: 10
  };

  constructor(
    private commonFn: CommonFunctionService,
    private settingConfigService: SettingsConfigService,
    private router: Router
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
    this.getDataList();
  }

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingConfigService.get('/api/contract/pay/for_approval/my', this.pageOption).subscribe((res:ApiData) => {
      console.log(res, '待我审批的合同支付');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.contract_pay;
        this.total = res.data.count;
        
        this.list = data;
        this.searchOptionsChange();
      }
    });
  }

  
  view(data:any) {
    this.router.navigateByUrl(`/approve/contract/apply/pay/edit/${data.project.id}?contract_pay_id=${data.id}`);
  }
  
  pageIndexChange($event:number) {
    this.pageOption.page = $event;
    this.getDataList();
  }
  pageSizeChange($event:number) {
    this.pageOption.page_size = $event;
    this.getDataList();
  }
  
  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    
    if(option) this.searchOption = option;

    option = option || this.searchOption;

    if(this.list.length !== 0) {
      let object:any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          object[key] = element;
        }
      }

      this.listOfData = this.commonFn.filterListOfData(this.list, object);
    }
  }
}
