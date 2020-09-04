import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-apply-list',
  templateUrl: './my-apply-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class MyApplyListComponent implements OnInit {

  constructor(
  ) { }

  tabs: any[] = [
    {
      id: 0,
      name: '进行中'
    },
    {
      id: 1,
      name: '待执行'
    },
    {
      id: 2,
      name: '已付款'
    },
    {
      id: 3,
      name: '已完成'
    },
    {
      id: 4,
      name: '无法执行'
    },
    {
      id: 5,
      name: '未通过'
    },
  ];

  pos = 0;

  type_id = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  }

  type_name = '进行中';

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
    this.type_name = '进行中';
    this.pageOption.page = 1
    this.pageOption.page_size = 10
    this.pos = 0;
  }

}
