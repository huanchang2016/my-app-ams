import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-financial-bill-list',
  templateUrl: './financial-bill-list.component.html',
  styles: [`
  :host ::ng-deep .ant-tabs-nav-wrap>div {
    text-align: right;
  }
  `
  ]
})
export class FinancialBillListComponent implements OnInit {

  constructor(
  ) { }

  pos = 0;

  type_id = 0;

  type_name = '已完成';

  ngOnInit(): void {
  }

  readOuter() {
    this.type_name = '已完成';
  }

}
