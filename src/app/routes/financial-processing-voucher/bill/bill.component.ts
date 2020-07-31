import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { SettingsConfigService } from '../../service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-financial-processing-voucher-bill',
  templateUrl: './bill.component.html',
})
export class FinancialProcessingVoucherBillComponent implements OnInit {
  listOfData:any[] = [];
  loading: boolean = true;
  searchOption:any = {};

  total = 0;

  pageOption:any = {
    page: 1,
    page_size: 10
  };

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
    this.getDataList();
  }
  
  getDataList(id:number = null) { // 获取单位下的数据
    this.loading = true;
    let url:string = id ?  `/api/bill/finished/${id}` : '/api/bill/finished/all';
    this.settingsConfigService.get(url, this.pageOption).subscribe((res:ApiData) => {
      console.log(res, '支付凭证： 发票管理');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.bill;
        this.total = res.data.count;
        
        this.listOfData = data;
      }
    });
  }
  
  pageIndexChange($event:number) {
    this.pageOption.page = $event;
    this.getDataList();
  }
  pageSizeChange($event:number) {
    this.pageOption.page_size = $event;
    this.getDataList();
  }
  
  // 项目变化， 从新获取所有数据
  selectProjectChange(projectId:any) {
    this.getDataList(projectId);
  }
  // 搜索条件发生变化
  searchValueChange(option?:any) {
    console.log(option, 'search value changes');
  }

}
