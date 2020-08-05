import { Component, OnInit, Input } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-contract-excute-list-c',
  templateUrl: './contract-excute-list-c.component.html',
  styles: [
  ]
})
export class ContractExcuteListCComponent implements OnInit {
  @Input() postUrl: string;

  // 单位id
  companyId: number = null;
  companyArray: any[] = [];

  list: any[] = [];
  listOfData: any[] = [];
  loading = true;
  searchOption: any = {};

  total = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  };


  constructor(
    private commonFn: CommonFunctionService,
    private settingsConfigService: SettingsConfigService
  ) {
    this.settingsConfigService.get('/api/company/user/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        const data: any[] = res.data.company;
        this.companyArray = data.map(v => {
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
    this.settingsConfigService.get(this.postUrl, this.pageOption).subscribe((res: ApiData) => {
      console.log(res, '该我执行的合约支付');
      this.loading = false;
      if (res.code === 200) {
        const data: any[] = res.data.contract_pay;
        this.total = res.data.count;

        this.list = data;
        this.searchOptionsChange();
      }
    });
  }

  pageIndexChange($event: number) {
    this.pageOption.page = $event;
    this.getDataList();
  }
  pageSizeChange($event: number) {
    this.pageOption.page_size = $event;
    this.getDataList();
  }


  // 搜索条件发生变化
  searchOptionsChange(option?: any) {

    if (option) this.searchOption = option;

    option = option || this.searchOption;

    if (this.list.length !== 0) {
      const object: any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          if (key === 'code') {
            object.supplier_code = element;
          } else {
            object[key] = element;
          }
        }
      }

      this.listOfData = this.commonFn.filterListOfData(this.list, object);
    }
  }
}
