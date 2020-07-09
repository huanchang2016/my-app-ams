import { ProjectIncomeFormCComponent } from './project-income-form-c/project-income-form-c.component';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-project-income-c',
  templateUrl: './project-income-c.component.html',
  styles: [
  ]
})
export class ProjectIncomeCComponent implements OnChanges, OnInit {
  @Input() projectInfo:any;
  @Input() incomeList:any[];

  @Output() listValueChange:EventEmitter<any> = new EventEmitter();
  @Output() incomeChange:EventEmitter<any> = new EventEmitter();

  partACompanyList:any[] = [];
  taxList:any[] = [];

  constructor(
    private modalService: NzModalService,
    private msg: NzMessageService,
    private settings: SettingsService,
    private settingsConfigService: SettingsConfigService
  ) {

    this.getConfigs();
    
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
      nzTitle: (!data ? '新增' : '编辑') + '项目收入',
      nzContent: ProjectIncomeFormCComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        projectInfo: this.projectInfo,
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result) {
        console.log('add or update success');
        this.listValueChange.emit('project');
      }
    });

  }

  confirm(id:number):void {
    const opt:any = { project_revenue_ids: [id] };
    this.settingsConfigService.post('/api/project/revenue/disable', opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('禁用成功');
        this.listValueChange.emit('project');
      }
    });
  }

  cancel():void {}

  getConfigs() {
    // 获取甲方、乙方 单位列表
    this.settingsConfigService.get('/api/company/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        let data: any[] = res.data.company;
        this.partACompanyList = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active);
      }
    });

    // 获取税目类型列表
    if(this.settings.user.department) {
      this.settingsConfigService.get(`/api/tax/department/${this.settings.user.department.id}`).subscribe((res: ApiData) => {
        if (res.code === 200) {
          let data: any[] = res.data.tax;
          this.taxList = data.filter(v => v.active);
        }
      });
    }
  }
  staticOpt:any = null;
  incomeStatisticsChange(option:any) {
    this.staticOpt = option;
    this.incomeChange.emit(option);
  }
}
