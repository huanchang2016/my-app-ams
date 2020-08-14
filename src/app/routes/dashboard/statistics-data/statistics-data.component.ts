import { Component, OnInit } from '@angular/core';
import { SettingsConfigService } from '../../service/settings-config.service';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-statistics-data',
  templateUrl: './statistics-data.component.html',
  styleUrls: ['./statistics-data.component.less']
})
export class StatisticsDataComponent implements OnInit {

  dataV:any = {
    project_count: null,
    pay_count: null,
    income_count: null,
  }

  loadingData:boolean = true;

  permissions:string[] = [];

  constructor(
    public settingsConfigService: SettingsConfigService
  ) {}

  requestUrl:{ [key: string]: any} = {
    project_count: '',
    pay_count: '',
    income_count: ''
  };

  ngOnInit(): void {
    const _permission = JSON.parse(window.localStorage.getItem('cw_permission'));
    if(_permission) {
      this.permissions = _permission;
    }


    if (this.settingsConfigService.isPermissionsIncludes('data_management_list', this.permissions)) {
      // 部门负责人
      this.requestUrl.project_count = '/api/department_head_current_month_submit_project_count';
      this.requestUrl.pay_count = '/api/department_head_project_pay_count';
      this.requestUrl.income_count = '/api/department_head_project_income_count';

    } else if (this.settingsConfigService.isPermissionsIncludes('data_department_management_list', this.permissions)) {
      // 管理员
      this.requestUrl.project_count = '/api/current_month_submit_project_management_count';
      this.requestUrl.pay_count = '/api/project_pay_management_count';
      this.requestUrl.income_count = '/api/project_income_management_count';


    }else {
      // 其他用户访问
      this.requestUrl.project_count = '/api/my_current_month_submit_project_count';
      this.requestUrl.pay_count = '/api/my_project_pay_count';
      this.requestUrl.income_count = '/api/my_project_income_count';

    }


    this.getDataV();
  }
  
  getDataV():void {
    this.loadingData = true;
    zip(
      this.settingsConfigService.get(this.requestUrl.project_count),
      this.settingsConfigService.get(this.requestUrl.pay_count),
      this.settingsConfigService.get(this.requestUrl.income_count),
    ).pipe(
      map(([a, b, c]) => [ a.data, b.data, c.data ])
    ).subscribe(([project_count, pay_count, income_count ]) => {
      this.loadingData = false;

      let pay:any = pay_count;
      let income:any = income_count;
      pay.percent =  Math.abs(pay_count.percent * 100);
      income.percent =  Math.abs(income_count.percent * 100);
      this.dataV = {
        project_count: project_count,
        pay_count: pay,
        income_count: income
      };

      console.log(this.dataV, 'this.datav');
      
    })
  }
}
