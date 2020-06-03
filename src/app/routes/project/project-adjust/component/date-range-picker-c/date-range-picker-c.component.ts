import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { format } from 'date-fns';

@Component({
  selector: 'app-date-range-picker-c',
  templateUrl: './date-range-picker-c.component.html',
  styles: [
  ]
})
export class DateRangePickerCComponent implements OnChanges {

  @Input() rangeDate:any;
  @Input() keys:string[];

  @Output() rangeDateChange: EventEmitter<any> = new EventEmitter();

  dateR:Date[] = [];

  constructor() { }

  ngOnChanges(): void {
    if(this.rangeDate) {
      this.dateR = [this.rangeDate.start, this.rangeDate.end];
    }
  }


  dateValueChange():void {
    const opt = {
      start: format(this.dateR[0], 'yyyy/MM/dd'),
      end: format(this.dateR[1], 'yyyy/MM/dd')
    }
    if(opt.start == this.rangeDate.start && opt.end == this.rangeDate.end) {
      return;
    }

    this.rangeDateChange.emit({
      keys: this.keys,
      data: opt
    });
  }
}
