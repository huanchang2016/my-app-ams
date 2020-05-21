import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-customer-company-show-list-c',
  templateUrl: './customer-company-show-list-c.component.html',
  styles: [
  ]
})
export class CustomerCompanyShowListCComponent implements OnInit {
  @Input() customer:any[];

  constructor() { }

  ngOnInit(): void {
  }

}
