import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { _HttpClient } from '@delon/theme';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-contract-view',
  templateUrl: './view.component.html',
})
export class ContractViewComponent implements OnInit {
  
  contractId:number = null;

  contractInfo:any = null;

  constructor(
    public msgSrv: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private settingsConfigService: SettingsConfigService
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.contractId = +params['id'];
        this.getcontractInfo();
      }
    })
  }

  ngOnInit(): void {
    
  }

  getcontractInfo() {
    console.log('通过合同id  获取合同详情');
    this.settingsConfigService.get(`/api/contract/${this.contractId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.contractInfo = res.data;
      }
    })
  }

}
