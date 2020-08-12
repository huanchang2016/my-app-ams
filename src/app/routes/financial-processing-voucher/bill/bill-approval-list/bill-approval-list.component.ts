import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bill-approval-list',
  templateUrl: './bill-approval-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class BillApprovalListComponent implements OnInit {

  constructor() { }

  tabs: any[] = [
    {
      id: 1,
      name: '待审批'
    },
    {
      id: 2,
      name: '待废弃'
    },
    {
      id: 3,
      name: '待红冲'
    },
    {
      id: 4,
      name: '已审批'
    },
  ];

  pos = 0;

  type_id = 0;

  type_name = '待审批';

  ngOnInit(): void {
  }

  to(item: any) {
    this.type_id = item.id;
    this.type_name = item.name;
    console.log(this.type_id, 'type_id', item);
    console.log(this.type_name, 'type_name', item);
  }
  readOuter() {
    this.type_name = '待审批';
  }

}
