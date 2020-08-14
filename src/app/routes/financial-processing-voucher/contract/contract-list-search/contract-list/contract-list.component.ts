import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class ContractListComponent implements OnInit {


  constructor(
  ) { }

  type_id = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  }

  type_name = '已完成';

  ngOnInit(): void {
  }

  readOuter() {
    this.type_name = '已完成';
  }
}
