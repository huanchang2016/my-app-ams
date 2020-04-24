import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-bill-reminder-invoices-list',
  templateUrl: './invoices-list.component.html',
})
export class BillReminderInvoicesListComponent implements OnInit {

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;

  projectId:number = null;
  projectDetailInfo:any = null;

  constructor(
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getDataList();
        this.getConfig();
      }
    })
  }

  ngOnInit() {

  }

  add() :void {
    this.router.navigateByUrl('/bill/apply/invoices/add?project_id=' + this.projectId );
  }

  edit(data:any): void {
    this.router.navigateByUrl(`/bill/apply/invoices/edit/${data.id}?project_id=${this.projectId}`);
  }

  
  disabled(id:number):void {
    this.settingsConfigService.post('/api/bill/disable', { bill_id: id })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('禁用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.list = this.list.map( v => {
              if(v.id === id ) v.active = false;
              return v;
            });
          }else {
            this.msg.error(res.error || '禁用失败');
          }
    });
  }
  cancel() {}

  submitBillInfo(id:number): void {
    console.log('提交发票 开具申请');
    this.settingsConfigService.post('/api/bill/submit', { bill_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('提交成功');
        this.listOfData = this.listOfData.filter( v => v.id !== id);
      }else {
        this.msg.error(res.error || '发票开具申请提交失败');
      }
    })
  }

  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    if(this.list.length !== 0) {
      let list:any[] = this.list;
      if(option && option.name) list = list.filter( v => (v.bill_category.name).indexOf(option.name) !== -1);
      // if(option) list = list.filter( v => v.active === option.active);
      this.listOfData = list;
    }
  }
  
  getDataList() { // 获取单位下的数据
    this.loading = true;
    console.log(this.projectId);
    
    this.settingsConfigService.get(`/api/bill/draft/${this.projectId}`).subscribe((res:ApiData) => {
      console.log(res);
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.bill;
        this.list = data;
        this.searchOptionsChange();
      }
    });
  }

  getConfig() {
    // 获取客户单位 信息详情
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res:ApiData) => {
      console.log('projectDetailInfo, ', res.data);
      if(res.code === 200) {
        this.projectDetailInfo = res.data;
      }
    })
  }
}
