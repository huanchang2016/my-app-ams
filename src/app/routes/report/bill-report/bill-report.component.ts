import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bill-report',
  templateUrl: './bill-report.component.html',
  styles: [
  ]
})
export class BillReportComponent implements OnInit {

  constructor() { }
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
    console.log(this.type_id, 'type_id');
    console.log(this.type_name, 'type_name');
  }
  readOuter() {
    this.type_name = '全部';
    this.pageOption.page = 1
    this.pageOption.page_size = 10
  }

}
