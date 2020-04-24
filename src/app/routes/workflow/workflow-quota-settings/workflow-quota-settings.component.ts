import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { QuotaFormComponentComponent } from './quota-form-component/quota-form-component.component';

@Component({
  selector: 'app-workflow-quota-settings',
  templateUrl: './workflow-quota-settings.component.html',
  styles: [`
    .quote-box {
      max-width: 400px;
    }
  `]
})
export class WorkflowQuotaSettingsComponent implements OnInit {
// 单位id
companyId:number = null;

company: any[] = []; // 所有的用户单位
selectCompany: number[] = []; // 所有已经有限额的 单位 id 集

list: any[] = [];
listOfData:any[] = [];
loading: boolean = false;
constructor(
  private modalService: NzModalService,
  private settingsConfigService: SettingsConfigService
) {
  this.settingsConfigService.get('/api/company/user/all').subscribe((res:ApiData) => {
    console.log(res, 'user company');
    if(res.code === 200) {
      this.company = res.data.company;
    }
  })
}

ngOnInit() {
  this.getDataList();
}

// view(data:any) {
//   console.log(data);
//   this.settingsConfigService.get(`/api/quota/${data.id}`).subscribe((res:ApiData) => {
//     console.log(res);
//   })
// }

add() :void {
  this.createComponentModal();
}

edit(data:any): void {
  console.log('data', data);
  this.createComponentModal(data);
}

createComponentModal(data:any = null): void {
  console.log(data);
  const modal = this.modalService.create({
    nzTitle: (!data ? '新增' : '编辑') + '流程限额',
    nzContent: QuotaFormComponentComponent,
    nzWrapClassName: 'modal-lg',
    nzMaskClosable: false,
    nzComponentParams: {
      company: this.company,
      selectCompany: this.selectCompany,
      data: data
    },
    nzFooter: null
  });

  // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

  // Return a result when closed
  modal.afterClose.subscribe(result => {
    if(result) {
      this.getDataList();
    }
  });

}

// 搜索条件发生变化
searchOptionsChange(option?:any) {
  if(this.list.length !== 0) {
    if(!option) {
      this.listOfData = this.list;
    }else {
      this.listOfData = this.list.filter( v => v.company.name.indexOf(option.name) !== -1);
    }
  }
}

getDataList() { // 获取单位下的数据
  this.loading = true;
  this.settingsConfigService.get(`/api/quota/all`).subscribe((res:ApiData) => {
    console.log(res);
    this.loading = false;
    if(res.code === 200) {
      this.list = res.data.quota;
      this.selectCompany = this.list.map( v => v.company.id );
      this.searchOptionsChange();
    }
  });
}
}
