import { Component, OnInit } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-bill-apply-projects',
  templateUrl: './bill-apply-projects.component.html',
  styles: []
})
export class BillApplyProjectsComponent implements OnInit {
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

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get('/api/my/pay/project', this.pageOption).subscribe((res:ApiData) => {
      console.log(res, '我的审批项目， 发票管理');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.project;
        this.total = res.data.count;
        
        this.list = data;
        this.searchOptionsChange();
      }
    });
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
