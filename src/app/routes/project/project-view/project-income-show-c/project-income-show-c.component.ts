import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-income-show-c',
  templateUrl: './project-income-show-c.component.html',
  styles: [
  ]
})
export class ProjectIncomeShowCComponent implements OnChanges {

  @Input() incomeList:any[];

  incomeInfo:any = null;

  projectIncomeList:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges(): void {
    if(this.incomeList && this.incomeList.length !== 0) {
      this.incomeInfo = this.incomeList[0];
      this.getProjectIncomeList(this.incomeInfo.id);
    }
  }

  getProjectIncomeList(revenueId:number) {
    this.settingsConfigService.get(`/api/project_revenue_detail/revenue/${revenueId}`).subscribe((res:ApiData) => {
      // console.log(res, '通过项目收入获取详情');
      if(res.code === 200) {
        this.projectIncomeList = res.data.project_revenue_detail;
        this.countCostTotal();
      }
    });
  }

  totalOption:any = {
    income: 0,
    tax_amount: 0,
    exclude_tax_income: 0 // 不含税收入
  };
  countCostTotal() {
    const exclude_tax_income = this.projectIncomeList.map( v => v.exclude_tax_income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const income = this.projectIncomeList.map( v => v.income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const tax_amount = this.projectIncomeList.map( v => v.tax_amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    this.totalOption = {
      income: income,
      tax_amount: tax_amount,
      exclude_tax_income: exclude_tax_income
    };
  }
  
}
