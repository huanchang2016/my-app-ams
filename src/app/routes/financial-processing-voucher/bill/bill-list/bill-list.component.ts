import { ApiData, List } from 'src/app/data/interface.data';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';


@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class BillListComponent implements OnInit {
  status: any = {
    id: null,
    name: ''
  };

  tabs: any[] = [
    {
      id: 0,
      name: '所有'
    },
    {
      id: 1,
      name: '进行中'
    },
    {
      id: 2,
      name: '待执行'
    },
    {
      id: 3,
      name: '已付款'
    },
    {
      id: 4,
      name: '已执行'
    },
    {
      id: 5,
      name: '未通过'
    },
  ];

  pos = 0;

  constructor(
    private settingsConfigService: SettingsConfigService,
  ) { }

  ngOnInit(): void {
  }

  to(item: any) {
    console.log('状态', item.name);
    this.status.name = item.name
    this.status.id = item.id
    console.log('status', this.status)
  }

}
