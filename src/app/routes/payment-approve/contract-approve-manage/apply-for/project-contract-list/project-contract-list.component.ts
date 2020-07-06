import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-contract-list',
  templateUrl: './project-contract-list.component.html',
  styles: []
})
export class ProjectContractListComponent implements OnInit {
  listOfData:any[] = [];


  projectInfo:any = null;
  projectId:number = null;

  contractList:any[] = [];

  pageTitle:string = '';

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
        this.getContractList();
      }
    })
  }

  ngOnInit() {
  }

  getDataList():void {
    this.settingsConfigService.get(`/api/contract/pay/${this.projectId}`).subscribe((res:ApiData) => {
      console.log(res, '项目支付合同列表');
      if(res.code === 200) {
        this.listOfData = res.data.contract_pay;
      }
    })
  }

  getContractList():void {
    this.settingsConfigService.get(`/api/deal/project/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.contractList = res.data.contract;
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
    this.settingsConfigService.post(`/api/contract/pay/disable`, { contract_pay_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('合约支付禁用成功!');
        this.getDataList();
      }
    })
  }
  
  submitContractPay(id:number):void {
    console.log(id, '合约支付信息提交')
    this.settingsConfigService.post('/api/contract_pay/submit', { contract_pay_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('支付信息提交成功');
        this.listOfData = this.listOfData.filter( v => v.id !== id);
      }
    });
  }s

}
