import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-adjust-contract-show',
  templateUrl: './adjust-contract-show.component.html',
  styles: [
    `
    .cost_body_show {
      max-width: 1000px;
    }
    `
  ]
})
export class AdjustContractShowComponent implements OnInit {

  @Input() projectInfo:any;

  contractList:any[] = [];
  loadingContract:boolean = true;

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    this.getDataList();
  }

  

  getDataList():void {
    this.loadingContract = true;
    this.settingsConfigService.get(`/api/deal/project/${this.projectInfo.id}`).subscribe((res: ApiData) => {
      this.loadingContract = false;
      if (res.code === 200) {
        const data:any[] = res.data.deal;
        this.contractList = data.filter( v => v.active );
      }
    })
  }
}
