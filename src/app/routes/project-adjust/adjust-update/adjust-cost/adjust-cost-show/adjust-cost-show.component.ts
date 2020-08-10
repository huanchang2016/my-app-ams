import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-adjust-cost-show',
  templateUrl: './adjust-cost-show.component.html',
  styles: [
    `
    .cost_body_show {
      max-width: 1000px;
    }
    `
  ]
})
export class AdjustCostShowComponent implements OnInit {

  @Input() projectInfo:any;

  costList:any[] = [];

  total:number = 0;

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    this.getBudgetData();
  }

  
  getBudgetData() {
    this.settingsConfigService.get(`/api/budget/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      // console.log(res);
      if(res.code === 200) {
        this.getCostList(res.data);
      }
    })
  }

  getCostList(opt:any):void {
    this.settingsConfigService.get(`/api/cost/budget/${opt.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.costList = res.data.cost;
        this.total = this.costList.map(v => v.amount).reduce( (sum1:number, sum2:number) => sum1 + sum2, 0);
      }
    })
  }
  
  
}
