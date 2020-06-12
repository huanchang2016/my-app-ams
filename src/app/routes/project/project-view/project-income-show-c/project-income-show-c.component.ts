import { Component, OnChanges, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-income-show-c',
  templateUrl: './project-income-show-c.component.html',
  styles: [
  ]
})
export class ProjectIncomeShowCComponent implements OnChanges {

  @Input() projectId:number;

  incomeList:any[] = [];

  incomeInfo:any = null;

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges(): void {
    if(this.projectId) {
      this.getProjectIncomeList();
    }
  }
  getProjectIncomeList() {
    // 获取项目收入
    this.settingsConfigService.get(`/api/project/revenue/${this.projectId}`).subscribe((res:ApiData) => {
      console.log('项目收入', res);
      if(res.code === 200) {
        this.incomeList = res.data.project_revenue;
        if(this.incomeList.length !== 0) {
          this.incomeInfo = this.incomeList[0];
        }
      }
    });
    
  }
}
