import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-subsidy-income-show-c',
  templateUrl: './subsidy-income-show-c.component.html',
  styles: [
  ]
})
export class SubsidyIncomeShowCComponent implements OnChanges {

  @Input() projectId:number;

  incomeList:any[] = [];

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges(): void {
    if(this.projectId) {
      this.getSubsidyIncomeList();
    }
  }

  getSubsidyIncomeList() {
    // 获取补贴收入
    this.settingsConfigService.get(`/api/subsidy/income/${this.projectId}`).subscribe((res:ApiData) => {
      console.log('补贴收入', res);
      if(res.code === 200) {
        this.incomeList = res.data.subsidy_income;
      }
    });
  }
}
