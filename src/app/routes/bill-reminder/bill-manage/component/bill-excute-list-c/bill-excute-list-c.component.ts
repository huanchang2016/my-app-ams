import { Component, OnInit, Input } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-bill-excute-list-c',
  templateUrl: './bill-excute-list-c.component.html',
  styles: [
  ]
})
export class BillExcuteListCComponent implements OnInit {

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
    this.getDataList();
  }

  getDataList() {
    this.loading = true;
    this.settingsConfigService.get(this.postUrl, this.pageOption).subscribe((res:ApiData) => {
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
