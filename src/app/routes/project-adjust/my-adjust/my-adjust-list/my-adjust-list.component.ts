import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-adjust-list',
  templateUrl: './my-adjust-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class MyAdjustListComponent implements OnInit {

  constructor() { }

  tabs: any[] = [
    {
      id: 1,
      name: '草稿'
    },
    {
      id: 2,
      name: '进行中'
    },
    {
      id: 3,
      name: '已通过'
    },
    {
      id: 4,
      name: '未通过'
    },
  ];

  pos = 0;

  type_id = 0;

  type_name = '草稿';

  ngOnInit(): void {
  }
  to(item: any) {
    this.type_id = item.id;
    this.type_name = item.name;
    console.log(this.type_id, 'type_id', item);
    console.log(this.type_name, 'type_name', item);
  }
  readOuter() {
    this.type_name = '草稿';
  }
}
