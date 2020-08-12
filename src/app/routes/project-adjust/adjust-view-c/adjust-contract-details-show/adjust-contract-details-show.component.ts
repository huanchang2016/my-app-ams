import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-adjust-contract-details-show',
  templateUrl: './adjust-contract-details-show.component.html',
  styles: [
  ]
})
export class AdjustContractDetailsShowComponent implements OnInit {

  @Input() adjustInfo:any;

  list:any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    if(this.adjustInfo) {
      this.list = this.adjustInfo.deal_adjustment.deal_adjustment;
    }
    
  }
}
