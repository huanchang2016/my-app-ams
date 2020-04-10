import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-no-contract-list',
  templateUrl: './project-no-contract-list.component.html',
  styles: []
})
export class ProjectNoContractListComponent implements OnInit {
  listOfData:any[] = [];


  projectInfo:any = null;
  projectId:number = null;

  contractList:any[] = [];

  constructor(
    public msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getProjectInfo()
        this.getDataList();
      }
    })
  }

  ngOnInit() {
  }

  getDataList():void {
    this.settingsConfigService.get(`/api/treaty/pay/${this.projectId}`).subscribe((res:ApiData) => {
      console.log(res, '非合同项目支付列表');
      if(res.code === 200) {
        this.listOfData = res.data.treaty_pay;
      }
    })
  }

  getProjectInfo() {
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectInfo = res.data;
      }
    })
  }
  
  cancel(): void {}

  disabled(id:number): void {
    this.settingsConfigService.post(`/api/treaty/pay/disable`, { treaty_pay_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('合同支付禁用成功!');
        this.getDataList();
      }
    })
  }

}
