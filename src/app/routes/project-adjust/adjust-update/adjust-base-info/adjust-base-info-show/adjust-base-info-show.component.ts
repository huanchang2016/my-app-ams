import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-adjust-base-info-show',
  templateUrl: './adjust-base-info-show.component.html',
  styles: [`
  :host ::ng-deep .table-box>.sv__detail
   {
    display: block;
  }
  `
  ]
})
export class AdjustBaseInfoShowComponent implements OnInit {

  @Input() projectInfo:any;

  constructor() { }

  ngOnInit(): void {
    console.log('this.projectInfo', this.projectInfo)
  }

}
