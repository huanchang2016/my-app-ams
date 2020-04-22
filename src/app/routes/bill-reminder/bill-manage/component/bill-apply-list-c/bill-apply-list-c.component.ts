import { Component, OnInit, Input } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill-apply-list-c',
  templateUrl: './bill-apply-list-c.component.html',
  styles: []
})
export class BillApplyListCComponent implements OnInit {

  @Input() postUrl:string;
  @Input() isApprove?:boolean = false;

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  searchOption:any = {};

  total = 0;

  pageOption:any = {
    page: 1,
    page_size: 10
  };
  
  companyArray:any[] = [];

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

  getDataList() {
    this.loading = true;
    this.settingConfigService.get(this.postUrl, this.pageOption).subscribe((res:ApiData) => {
      console.log('发票列表', res);

      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.bill;
        this.total = res.data.count;
        this.list = data;
        this.searchOptionsChange();
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

  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    if(this.list.length !== 0) {
      let list:any[] = this.list;
      if(option) {
        if(option.company_id) {
          list = this.list.filter( v => v.company.id === option.company_id);
        }
        if(option.name) {
          list = this.list.filter( v => v.name.indexOf(option.name) !== -1);
        }
      }
      this.listOfData = list;
    }
  }
}