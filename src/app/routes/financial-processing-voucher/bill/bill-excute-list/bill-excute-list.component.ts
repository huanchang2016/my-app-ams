import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bill-excute-list',
  templateUrl: './bill-excute-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `]
})
export class BillExcuteListComponent implements OnInit {

  constructor() { }

  tabs: any[] = [
    {
      id: 1,
      name: '待执行'
    },
    {
      id: 2,
      name: '已完成'
    },
    {
      id: 3,
      name: '无法执行'
    },
    {
      id: 4,
      name: '待废弃'
    },
    {
      id: 5,
      name: '已废弃'
    },
    {
      id: 6,
      name: '待红冲'
    },
    {
      id: 7,
      name: '已红冲'
    },
  ];

  pos = 0;

  type_id = 0;

  type_name = '待执行';

  ngOnInit(): void {
  }

  to(item: any) {
    this.type_id = item.id;
    this.type_name = item.name;
    console.log(this.type_id, 'type_id', item);
    console.log(this.type_name, 'type_name', item);
  }
  readOuter() {
    this.type_name = '待执行';
  }

}
