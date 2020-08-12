import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-adjust-treaty-show',
  templateUrl: './adjust-treaty-show.component.html',
  styles: [
    `
    .cost_body_show {
      max-width: 1000px;
    }
    `
  ]
})
export class AdjustTreatyShowComponent implements OnInit {

  @Input() projectInfo:any;

  treatyList:any[] = [];
  loadingTreaty:boolean = true;

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    this.getDataList();
  }

  

  getDataList():void {
    this.loadingTreaty = true;
    this.settingsConfigService.get(`/api/treaty/${this.projectInfo.id}`).subscribe((res: ApiData) => {
      this.loadingTreaty = false;
      if (res.code === 200) {
        const treatyList:any[] = res.data.treaty;
        this.treatyList = treatyList.filter(v => v.active); // 只显示有效的数据
      }
    })
  }
}
