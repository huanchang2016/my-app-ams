import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-subsidy-income-show-c',
  templateUrl: './subsidy-income-show-c.component.html',
  styles: [
  ]
})
export class SubsidyIncomeShowCComponent implements OnChanges {

  @Input() incomeList:any[];

  incomeInfo:any = null;

  subsidyIncomeList:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges(): void {
    if(this.incomeList && this.incomeList.length !== 0) {
      this.incomeInfo = this.incomeList[0];
      this.getsubsidyIncomeList(this.incomeInfo.id);
    }
  }

  getsubsidyIncomeList(subsidyId:number) {
    this.settingsConfigService.get(`/api/subsidy_income_detail/subsidy/${subsidyId}`).subscribe((res:ApiData) => {
      // console.log(res, '通过补贴收入获取详情');
      if(res.code === 200) {
        this.subsidyIncomeList = res.data.subsidy_income_detail;
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
    const exclude_tax_income = this.subsidyIncomeList.map( v => v.exclude_tax_income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const income = this.subsidyIncomeList.map( v => v.income ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    const tax_amount = this.subsidyIncomeList.map( v => v.tax_amount ).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
    this.totalOption = {
      income: income,
      tax_amount: tax_amount,
      exclude_tax_income: exclude_tax_income // 不含税收入
    };
  }
}
