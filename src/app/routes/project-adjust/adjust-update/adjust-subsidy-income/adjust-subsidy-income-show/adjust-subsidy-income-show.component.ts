import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-adjust-subsidy-income-show',
  templateUrl: './adjust-subsidy-income-show.component.html',
  styles: [
  ]
})
export class AdjustSubsidyIncomeShowComponent implements OnInit {

  @Input() projectInfo:any;

  incomeInfo:any = null;
  incomeList:any[] = [];

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
    this.settingsConfigService.get(`/api/subsidy/income/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      console.log('补贴收入', res);
      if(res.code === 200) {
        this.incomeInfo = res.data.subsidy_income[0];
        if(this.incomeInfo) {
          this.getIncomeDetailList();
        }
      }
    });
  }

  getIncomeDetailList() {
     // 获取补贴收入
     this.settingsConfigService.get(`/api/subsidy_income_detail/subsidy/${this.incomeInfo.id}`).subscribe((res: ApiData) => {
      console.log(res, '通过补贴收入获取详情');
      if (res.code === 200) {
        this.incomeList = res.data.subsidy_income_detail;
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
