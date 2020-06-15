import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-users-execute-flow',
  templateUrl: './users-execute-flow.component.html',
  styles: [
  ]
})
export class UsersExecuteFlowComponent implements OnChanges {
  @Input() progressInfo:any;

  @Output() executeChange:EventEmitter<any> = new EventEmitter();

  nodeProcess:any[] = [];

  isExecuteUser:boolean = false;

  
  checkOption: any = {
    is_execute: null,
    remark: '' // 备注原因
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

    this.executeChange.emit(this.checkOption);
  }
  cancel() { }

}
