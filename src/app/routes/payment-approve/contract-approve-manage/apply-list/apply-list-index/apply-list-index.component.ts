import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-apply-list-index',
  templateUrl: './apply-list-index.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `]
})
export class ApplyListIndexComponent implements OnInit {

  constructor() { }

  tabs: any[] = [
    {
      id: 0,
      name: '全部'
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
      name: '已完成'
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

  type_name = '全部';

  ngOnInit(): void {
  }
  to(item: any) {
    this.type_id = item.id;
    this.type_name = item.name;
    this.pos = this.type_id;
    console.log(this.pos, 'pos');
    console.log(this.type_id, 'type_id');
    console.log(this.type_name, 'type_name');
  }
  readOuter() {
    this.type_name = '全部';
    this.pos = 0;
    this.pageOption.page = 1
    this.pageOption.page_size = 10
  }

}
