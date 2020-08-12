import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Component, Input, OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-users-execute-flow',
  templateUrl: './users-execute-flow.component.html',
  styles: [
  ]
})

export class UsersExecuteFlowComponent implements OnChanges {
  @ViewChild('sonComponent') sonComponent: any;
  @ViewChild('nosonComponent') nosonComponent: any;
  @Input() progressInfo: any;

  @Input() payType?: string;
  @Input() payInfo?: any;
  @Input() paymentArr?: any[];
<<<<<<< HEAD

  @Output() executeChange: EventEmitter<any> = new EventEmitter();


=======
  @Input() listOfData?: any[];
  @Input() contract_pay_id?: number;
  @Input() treatypayInfo?: any = [];
  @Input() isCurrentCheck?: boolean;
  @Input() approveFlag?: any;
  @Input() filterUser?: any;


  @Output() executeChange: EventEmitter<any> = new EventEmitter();

  @Output() refresh: EventEmitter<any> = new EventEmitter();
>>>>>>> 0457674505824deb0ca56166216f28b8990ba032

  nodeProcess: any[] = [];

  isExecuteUser = false;


  checkOption: any = {
    status: 'A',
    remark: '' // 备注原因
  }

<<<<<<< HEAD
  billCategoryArray:any[] = []; // 发票类型
=======
  billCategoryArray: any[] = []; // 发票类型

  flag: boolean;

  contractInfo: any = [];
>>>>>>> 0457674505824deb0ca56166216f28b8990ba032

  constructor(
    private settings: SettingsService,
    private notice: NzNotificationService,
    private settingsConfigService: SettingsConfigService
  ) {
<<<<<<< HEAD
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        const list:any = res.data.bill_category;
        if(list.length !== 0) {
          this.billCategoryArray = list.sort((a:any, b:any) => a.sequence - b.sequence);
=======
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        const list: any = res.data.bill_category;
        if (list.length !== 0) {
          this.billCategoryArray = list.sort((a: any, b: any) => a.sequence - b.sequence);
>>>>>>> 0457674505824deb0ca56166216f28b8990ba032
        }
      }
    })
  }

  ngOnChanges() {
    console.log('progressInfoprogressInfoprogressInfoprogressInfoprogressInfo', this.progressInfo);
    console.log('中间组件 listOfData', this.listOfData);
    if (this.progressInfo) {
      this.nodeProcess = [this.progressInfo];
      this.isExecuteUser = this.progressInfo.execute_user.id === this.settings.user.id;

<<<<<<< HEAD
      let status:string = '';
      if(this.progressInfo.workflow_status.name === '待执行') {
        status = 'A';
      }else if(this.progressInfo.workflow_status.name === '已付款') {
        status = 'A';
      }else if(this.progressInfo.workflow_status.name === '无法执行') {
        status = 'C';
      }else if(this.progressInfo.workflow_status.name === '已完成') {
        status = 'B';
      }
      
=======
      let status = '';
      if (this.progressInfo.workflow_status.name === '待执行') {
        status = 'A';
      } else if (this.progressInfo.workflow_status.name === '已付款') {
        status = 'A';
      } else if (this.progressInfo.workflow_status.name === '无法执行') {
        status = 'C';
      } else if (this.progressInfo.workflow_status.name === '已完成') {
        status = 'B';
      }

>>>>>>> 0457674505824deb0ca56166216f28b8990ba032
      this.checkOption.status = status;
    }
  }

  submitCheckCurrentProcess() {
    if (this.checkOption.is_execute === null) {
      this.notice.error('错误', '是否执行未选择');
      return;
    }
    const is_pay = this.checkOption.status === 'A';
    const is_execute = this.checkOption.status === 'B';
<<<<<<< HEAD

    const option = {
      is_pay: is_pay,
      is_execute: is_execute,
      remark: this.checkOption.remark
    }
    this.executeChange.emit(option);
  }

  cancel() { }

=======

    const option = {
      is_pay,
      is_execute,
      remark: this.checkOption.remark
    }

    // 提交
    this.executeChange.emit(option);
    // 刷新列表
    // console.log("触发子元素事件之前 before");
    // console.log(this.sonComponent, 'this.sonComponent');
    // this.sonComponent?.getContractList();  // 通过项目获取合约
    // console.log("触发子元素事件之后 after");
  }

  cancel() { }

  readOuter(isSubmit) {
    this.flag = isSubmit;
    console.log('isSubmit', isSubmit);
  }
  // 来自子组件的数据
  readContractInfo(infoData) {
    this.contractInfo = infoData;
    console.log('this.contractInfo', this.contractInfo);
  }
  readSubmitFlag(submitFlag) {
    this.flag = submitFlag
    console.log('submitFlag', submitFlag);
  }
  refreshPage() {
    this.refresh.emit();
  }

  submitDisplay(flag) {
    this.approveFlag = flag
  }

  submitFilter(flag) {
    this.filterUser = flag;
    console.log(this.filterUser, 'submitFilter');
  }
>>>>>>> 0457674505824deb0ca56166216f28b8990ba032
}
