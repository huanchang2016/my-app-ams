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

  @Output() executeChange: EventEmitter<any> = new EventEmitter();



  nodeProcess: any[] = [];

  isExecuteUser = false;


  checkOption: any = {
    status: 'A',
    remark: '' // 备注原因
  }

  billCategoryArray:any[] = []; // 发票类型

  constructor(
    private settings: SettingsService,
    private notice: NzNotificationService,
    private settingsConfigService: SettingsConfigService
  ) {
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        const list:any = res.data.bill_category;
        if(list.length !== 0) {
          this.billCategoryArray = list.sort((a:any, b:any) => a.sequence - b.sequence);
        }
      }
    })
  }

  ngOnChanges() {
    if (this.progressInfo) {
      this.nodeProcess = [this.progressInfo];
      this.isExecuteUser = this.progressInfo.execute_user.id === this.settings.user.id;

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
      is_pay: is_pay,
      is_execute: is_execute,
      remark: this.checkOption.remark
    }
    this.executeChange.emit(option);
  }

  cancel() { }

}
