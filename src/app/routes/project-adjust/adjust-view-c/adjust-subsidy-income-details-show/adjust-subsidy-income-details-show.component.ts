import { Component, OnInit, Input } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-adjust-subsidy-income-details-show',
  templateUrl: './adjust-subsidy-income-details-show.component.html',
  styles: [
  ]
})
export class AdjustSubsidyIncomeDetailsShowComponent implements OnInit {

  @Input() adjustInfo:any;

  incomeInfo:any = null;

  incomeList:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    if(this.adjustInfo) {
      this.incomeInfo = this.adjustInfo.subsidy_income_adjustment;
      this.getSubsidyIncomeList();
    }
    
  }
  getSubsidyIncomeList() {
    this.settingsConfigService.get(`/api/subsidy_income_detail_adjustment/${this.adjustInfo.subsidy_income_adjustment.id}`).subscribe((res:ApiData) => {
        if(res.code === 200) {
          this.incomeList = res.data.subsidy_income_detail_adjustment.filter(v => v.active);
          this.countCostTotal();
        }
    });
  }
  
  staticOpt:any = null;
  countCostTotal() {
    const total = this.incomeList.map(v => v.exclude_tax_income).reduce((sum1: number, sum2: number) => sum1 + sum2, 0);
    const sub_income = this.incomeList.map(v => v.income).reduce((sum1: number, sum2: number) => sum1 + sum2, 0);
    const tax_amount = this.incomeList.map(v => v.tax_amount).reduce((sum1: number, sum2: number) => sum1 + sum2, 0);
    
    this.staticOpt = {
      sub_income,
      tax_amount,
      exclude_tax_income: total // 不含税收入
    }
  }
}
