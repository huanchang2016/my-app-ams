import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { SubsidyIncomeFormCComponent } from './subsidy-income-form-c/subsidy-income-form-c.component';

@Component({
  selector: 'app-subsidy-income-c',
  templateUrl: './subsidy-income-c.component.html',
  styles: [
  ]
})
export class SubsidyIncomeCComponent implements OnInit {
  @Input() projectId:number;
  @Input() incomeList:any[];

  @Output() listValueChange:EventEmitter<any> = new EventEmitter();

  partACompanyList:any[] = [];

  constructor(
    private modalService: NzModalService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) {
    // 获取甲方、乙方 单位列表
    this.settingsConfigService.get('/api/company/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        let data: any[] = res.data.company;
        this.partACompanyList = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active);
      }
    });
  }

  ngOnChanges() {}

  ngOnInit(): void {
  }

  add():void {
    this.createComponentModal();
  }

  edit(data:any):void {
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '补贴收入',
      nzContent: SubsidyIncomeFormCComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        projectId: this.projectId,
        partACompanyList: this.partACompanyList,
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result) {
        console.log('add or update success');
        this.listValueChange.emit('subsidy');
      }
    });

  }

  confirm(id:number):void {
    const opt:any = { income_ids: [id] };
    this.settingsConfigService.post('/api/subsidy/income/disable', opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('禁用成功');
        this.listValueChange.emit('subsidy');
      }
    });
  }

  cancel():void {}


}
