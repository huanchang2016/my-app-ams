import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-adjust-treaty-details-show',
  templateUrl: './adjust-treaty-details-show.component.html',
  styles: [
  ]
})
export class AdjustTreatyDetailsShowComponent implements OnInit {

  @Input() adjustInfo:any;

  list:any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    if(this.adjustInfo) {
      this.list = this.adjustInfo.treaty_adjustment.treaty_adjustment;
    }
    
  }
}
