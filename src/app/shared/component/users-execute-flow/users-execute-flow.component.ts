import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
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
  @Input() progressInfo: any;

  @Input() payType?: string;
  @Input() payInfo?: any;
  @Input() paymentArr?: any[];
  @Input() listOfData?: any[];
  @Input() contract_pay_id?: number;
  @Input() treatypayInfo?: any = [];

  @Output() executeChange: EventEmitter<any> = new EventEmitter();

  @Output() refresh: EventEmitter<any> = new EventEmitter();



  nodeProcess: any[] = [];

  isExecuteUser = false;


  checkOption: any = {
    status: 'A',
    remark: '' // 备注原因
  }

  billCategoryArray: any[] = []; // 发票类型

  flag: boolean;

  contractInfo: any = [];

  constructor(
    private settings: SettingsService,
    private notice: NzNotificationService,
    private settingsConfigService: SettingsConfigService
  ) {
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        const list: any = res.data.bill_category;
        if (list.length !== 0) {
          this.billCategoryArray = list.sort((a: any, b: any) => a.sequence - b.sequence);
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

    const option = {
      is_pay,
      is_execute,
      remark: this.checkOption.remark
    }

    // 提交
    this.executeChange.emit(option);
  }

  cancel() { }

  readOuter(isSubmit) {
    this.flag = isSubmit;
    console.log('isSubmit', isSubmit);
  }
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
}
