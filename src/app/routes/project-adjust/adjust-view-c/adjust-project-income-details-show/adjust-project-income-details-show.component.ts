import { Component, OnInit, Input } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-adjust-project-income-details-show',
  templateUrl: './adjust-project-income-details-show.component.html',
  styles: [
  ]
})
export class AdjustProjectIncomeDetailsShowComponent implements OnInit {

  @Input() adjustInfo:any;

  incomeInfo:any = null;

  projectIncomeList:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    if(this.adjustInfo) {
      this.incomeInfo = this.adjustInfo.project_revenue_adjustment;
      this.getProjectIncomeList();
    }
    
  }
  getProjectIncomeList() {
    this.settingsConfigService.get(`/api/project_revenue_detail_adjustment/${this.adjustInfo.project_revenue_adjustment.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectIncomeList = res.data.project_revenue_detail_adjustment.filter( v => v.active );
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
