import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-adjust-project-income-show',
  templateUrl: './adjust-project-income-show.component.html',
  styles: [
  ]
})
export class AdjustProjectIncomeShowComponent implements OnInit {
  
  @Input() projectInfo:any;

  incomeInfo:any = null;
  projectIncomeList:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    if(this.projectInfo) {
      this.getIncomeList(this.projectInfo.id);
    }
  }

  getIncomeList(proId:number) {
    // 获取项目收入
    this.settingsConfigService.get(`/api/project/revenue/${proId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.incomeInfo = res.data.project_revenue[0];
        if(this.incomeInfo) {
          this.getProjectIncomeList();
        }
        
      }
    });
  }

  getProjectIncomeList() {
    this.settingsConfigService.get(`/api/project_revenue_detail/revenue/${this.incomeInfo.id}`).subscribe((res:ApiData) => {
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
