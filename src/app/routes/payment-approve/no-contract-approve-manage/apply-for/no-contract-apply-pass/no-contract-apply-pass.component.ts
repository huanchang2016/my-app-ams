import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-contract-apply-pass',
  templateUrl: './no-contract-apply-pass.component.html',
  styles: []
})
export class NoContractApplyPassComponent implements OnInit {

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  searchOption:any = {};

  total = 0;

  pageOption:any = {
    page: 1,
    page_size: 10
  };

  // listOfData: any[] = [];
  selectedMemberIds: number[] = []; // 已选成员
  // TODO: checkbox
  constructor(
    private commonFn: CommonFunctionService,
    private settingConfigService: SettingsConfigService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDataList();
  }

  getDataList() {
    this.loading = true;
    this.settingConfigService.get('/api/treaty/pay/pass/my', this.pageOption).subscribe((res:ApiData) => {
      console.log('协议支付信息，已通过：', res);

      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.treaty_pay;
        this.total = res.data.count;
        this.list = data;
        this.searchOptionsChange();
      }
    });
  }

  view(data:any) {
    this.router.navigateByUrl(`/approve/no-contract/apply/pay/edit/${data.project.id}?treaty_pay_id=${data.id}`);
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
      console.log('项目支付草稿: ', this.listOfData);
    }
  }
}
