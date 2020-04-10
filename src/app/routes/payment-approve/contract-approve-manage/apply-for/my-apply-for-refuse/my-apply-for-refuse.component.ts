import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-my-apply-for-refuse',
  templateUrl: './my-apply-for-refuse.component.html',
  styles: []
})
export class MyApplyForRefuseComponent implements OnInit {

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  searchOption:any = {};

  total = 0;

  pageOption:any = {
    page: 1,
    page_size: 10
  };

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
    private commonFn: CommonFunctionService,
    private settingConfigService: SettingsConfigService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDataList();
  }

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingConfigService.get('/api/contract/pay/refuse/my', this.pageOption).subscribe((res:ApiData) => {
      console.log(res);
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.contract_pay;
        this.total = res.data.count;
        this.list = data;
        this.listOfDisplayData = this.list;
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
    // this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.listOfDisplayData.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    
    if(option) this.searchOption = option;

    option = option || this.searchOption;

    if(this.list.length !== 0) {
      this.isIndeterminate = false;
      let object:any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          object[key] = element;
        }
      }

      this.listOfData = this.commonFn.filterListOfData(this.list, object);
      console.log('合同支付申请（进行中）。。。: ', this.listOfData);
    }
  }

}
