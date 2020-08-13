import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-department-head-list',
  templateUrl: './project-department-head-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class ProjectDepartmentHeadListComponent implements OnInit {

  constructor() { }

  tabs: any[] = [
    {
      id: 1,
      name: '全部'
    },
    {
      id: 2,
      name: '已提交，待审核'
    },
    {
      id: 3,
      name: '已提交，未通过'
    },
    {
      id: 4,
      name: '进行中'
    },
    {
      id: 5,
      name: '已完成'
    },
  ];

  pos = 0;

  type_id = 0;

  type_name = '全部';

  ngOnInit(): void {
  }
  to(item: any) {
    this.type_id = item.id;
    this.type_name = item.name;
    console.log(this.type_id, 'type_id', item);
    console.log(this.type_name, 'type_name', item);
  }
  readOuter() {
    this.type_name = '全部';
  }
}