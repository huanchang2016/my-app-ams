import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-adjust-cost-details-show',
  templateUrl: './adjust-cost-details-show.component.html',
  styles: [
  ]
})
export class AdjustCostDetailsShowComponent implements OnInit {

  @Input() adjustInfo:any;

  list:any[] = [];
  total:number = 0;
  constructor() { }

  ngOnInit(): void {
    if(this.adjustInfo) {
      this.list = this.adjustInfo.cost_adjustment.cost_adjustment;
      this.total = this.list.map( v => v.amount).reduce((a, b) => a + b, 0);
    }
    
  }

}
