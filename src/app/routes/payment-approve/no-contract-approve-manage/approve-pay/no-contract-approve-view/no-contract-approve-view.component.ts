import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-no-contract-approve-view',
  templateUrl: './no-contract-approve-view.component.html',
  styles: []
})
export class NoContractApproveViewComponent implements OnInit {
  listOfData:any[] = [];

  projectInfo:any = null;
  projectId:number = null;

  treaty_pay_id:number = null;
  treatypayInfo:any = null;
  treaty_id:number = null;

  constructor(
    public msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    public notice: NzNotificationService,
    private settings: SettingsService
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getProjectInfo(); // 项目信息
      }
    });

    this.activatedRoute.queryParams.subscribe(params=> {
      if(params && params['treaty_pay_id']) {
        this.treaty_pay_id = +(params['treaty_pay_id']);
        this.getTreatyPayDetail();
        this.getWorkflow();
      }
    })
    
  }

  ngOnInit() { }

  getTreatyPayDetail():void {
    this.settingsConfigService.get(`/api/treaty/pay/detail/${this.treaty_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '协议支付信息1111');
          if(res.code === 200) {
            this.treaty_id = res.data.id;
            this.treatypayInfo = res.data;
            this.getTreatyPayment();
          }
        })
  }

  getTreatyPayment() {
    this.settingsConfigService.get(`/api/treaty/payment/${this.treaty_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, '协议支付详情列表2222');
          if(res.code === 200) {
            const treatyPayment:any[] = res.data.treaty_payment;
            this.listOfData = treatyPayment;
          }
        })
  }

  getProjectInfo() { // 项目基础信息
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectInfo = res.data;
      }
    })
  }

  cancel(): void {}

  // 流程进程信息
  progressInfo:any = null;
  nodeProcess:any[] = [];
  currentNodeProcess:any = null;
  isCurrentCheck:boolean = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  getWorkflow() {
    this.settingsConfigService
        .get(`/api/treaty/pay/process/${this.treaty_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'workflow');
          if(res.code === 200) {
            this.progressInfo = res.data;
            this.getNodeProcess();
          }
    })
  }

  getNodeProcess():void {
    this.isCurrentCheck = false;
    this.settingsConfigService
        .get(`/api/node/process/${this.progressInfo.id}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'node_process');
          if(res.code === 200) {
            this.nodeProcess = res.data.node_process;
            this.currentNodeProcess = this.nodeProcess.filter( v => v.current)[0];
            console.log(this.currentNodeProcess, this.isCurrentCheck, this.settings.user);
            if(this.currentNodeProcess) {
              this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
            }
          }
    })
  }

  submitCheckCurrentProcess() {
    if(this.checkOption.agree === null) {
      this.notice.error('错误', '是否通过未选择');
      return;
    }
    console.log(this.checkOption, 'agree info submit!');
    const obj:any = {
      ...this.checkOption,
      node_process_id: this.currentNodeProcess.id
    }
    this.settingsConfigService
        .post(`/api/pay/node_process/approval`, obj)
        .subscribe((res:ApiData) => {
          console.log(res, 'approval');
          if(res.code === 200) {
           this.msg.success('审核提交成功');
           this.getWorkflow();
          }
    })
  }

}
