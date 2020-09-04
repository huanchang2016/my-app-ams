import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-apply-approve-list',
  templateUrl: './no-apply-approve-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class NoApplyApproveListComponent implements OnInit {



  constructor() { }

  tabs: any[] = [
    {
      id: 0,
      name: '待执行'
    },
    {
      id: 1,
      name: '已付款'
    },
    {
      id: 2,
      name: '已完成'
    },
    {
      id: 3,
      name: '无法执行'
    },
  ];

  pos = 0;

  type_id = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  }

  type_name = '待执行';

  ngOnInit(): void {
  }
  to(item: any) {
    this.type_id = item.id;
    this.type_name = item.name;
    this.pos = this.type_id;
    console.log(this.type_id, 'type_id', item);
    console.log(this.type_name, 'type_name', item);
  }
  readOuter() {
    this.type_name = '待执行';
    this.pageOption.page = 1
    this.pageOption.page_size = 10
    this.pos = 0;
  }

}
