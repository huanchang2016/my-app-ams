import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-adjust-info-details-show',
  templateUrl: './adjust-info-details-show.component.html',
  styles: [`
  :host ::ng-deep .table-box>.sv__detail,
  :host ::ng-deep .income-show-box>.sv__detail
   {
    display: block;
  }
  `
  ]
})
export class AdjustInfoDetailsShowComponent implements OnInit {

  @Input() adjustInfo:any;

  constructor() { }

  ngOnInit(): void {
    console.log('this.adjustInfo', this.adjustInfo)
  }

}
