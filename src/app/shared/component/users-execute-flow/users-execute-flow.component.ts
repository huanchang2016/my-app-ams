import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
// import { ContractContractFormComponent } from '../../../routes/contract/component/contract-form/contract-form.component';
import { UsersExecuteModalComponent } from '../users-execute-modal/users-execute-modal.component'
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

  @Output() executeChange: EventEmitter<any> = new EventEmitter();

  list: any[] = [];

  listOfData: any[] = [];

  loading = false;

  isVisible = false;

  nodeProcess: any[] = [];

  isExecuteUser = false;

  supplierList: any[] = [];

  companyList: any[] = [];


  checkOption: any = {
    is_execute: 'A',
    remark: '' // 备注原因
  }

  tax: null; // 税额

  invoice: null; // 发票额

  radioValue: 'A'; // A专票 B普票

  constructor(
    private settings: SettingsService,
    private notice: NzNotificationService,
    private modalService: NzModalService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges() {
    if (this.progressInfo) {
      console.log(this.progressInfo, 'app-users-execute-flow');
      this.nodeProcess = [this.progressInfo.execute_user];
      this.isExecuteUser = this.progressInfo.execute_user.id === this.settings.user.id;
    }
  }

  submitCheckCurrentProcess() {
    if (this.checkOption.is_execute === null) {
      this.notice.error('错误', '是否执行未选择');
      return;
    }

    this.executeChange.emit(this.checkOption);
  }
  cancel() { }

  // modal

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  // use component
  // edit(data: any): void {
  //   console.log('data', data);
  //   this.createComponentModal(data);
  // }

  // createComponentModal(data: any = null): void {
  //   console.log(data);
  //   const modal = this.modalService.create({
  //     nzTitle: '再次确认',
  //     nzContent: UsersExecuteModalComponent,
  //     nzWrapClassName: 'modal-lg',
  //     nzMaskClosable: false,
  //     nzComponentParams: {
  //       data,
  //       supplierList: this.supplierList,
  //       companyList: this.companyList
  //     },
  //     nzFooter: null
  //   });

  //   // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

  //   // Return a result when closed
  //   modal.afterClose.subscribe(result => {
  //     if (result) {
  //       this.getDataList();
  //     }
  //   });

  // }

  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingsConfigService.get(`/api/contract/all`).subscribe((res: ApiData) => {
      console.log(res, 'contract category list');
      this.loading = false;
      if (res.code === 200) {
        const data: any[] = res.data.contract;
        this.list = data.sort((a: any, b: any) => a.sequence - b.sequence);
      }
    });
  }
}
