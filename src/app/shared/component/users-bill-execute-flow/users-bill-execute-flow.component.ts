import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-users-bill-execute-flow',
  templateUrl: './users-bill-execute-flow.component.html',
  styles: [
  ]
})
export class UsersBillExecuteFlowComponent implements OnChanges {
  @Input() progressInfo:any;

  @Output() executeChange:EventEmitter<any> = new EventEmitter();

  nodeProcess:any[] = [];

  isExecuteUser:boolean = false;

  
  // 执行情况：
  //    如果执行成功，需要填写  发票号码 发票金额(不含税)  税额 
  //    如果 未执行 ，需要填写 不能执行的原因
  checkOption: any = {
    is_execute: null,
    remark: '', // 备注原因
    bill_number: null, // 发票号码
    bill_amount: null, // 发票金额
    bill_tax: null // 发票税额
  }

  constructor(
    private settings: SettingsService,
    private notice: NzNotificationService
  ) { }

  ngOnChanges() {
    if(this.progressInfo) {
      console.log(this.progressInfo, 'app-users-execute-flow');
      this.nodeProcess = [this.progressInfo.execute_user];
      this.isExecuteUser = this.progressInfo.execute_user.id === this.settings.user.id;
    }
  }

  submitCheckCurrentProcess() {
    if(this.checkOption.is_execute === null) {
      this.notice.error('错误', '是否执行未选择');
      return;
    }

    let option:any = {};

    if(this.checkOption.is_execute === 'A') { // 已执行
      const bill_number:string = this.checkOption.bill_number.trim();
      const bill_amount:number = +this.checkOption.bill_number;
      const bill_tax:number = this.checkOption.bill_tax;
      if(!bill_number || !bill_amount || !bill_tax) {
        this.notice.error('信息不完整', '执行后信息填写不完整！');
        return;
      }
      option = {
        is_execute: true,
        bill_number,
        bill_amount,
        bill_tax
      }
    }

    if(this.checkOption.is_execute === 'B') { // 未执行
      const _remark:string = this.checkOption.remark.trim();
      if(!_remark) {
        this.notice.error('信息不完整', '未执行的原因不能为空！');
        return;
      }
      option = {
        is_execute: false,
        remark: _remark
      }
    }
    
    this.executeChange.emit(option);
  }
  cancel() { }

}
