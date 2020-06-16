import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-type-amount-list',
  templateUrl: './type-amount-list.component.html',
  styles: [`
    .cost-item {
      line-height: 100%;
    }
    .cost-item-value {
      width: 100px;
      min-width: 100px;
    }
    .cost-item-oper {
      width: 48px;
      min-width: 48px;
    }
  `]
})
export class TypeAmountListComponent implements OnInit {
  @Input() data:any;
  @Input() index:number;

  @Output() deletedCostItem: EventEmitter<any> = new EventEmitter();
  
  isEdit: boolean = false;

  constructor() { }

  ngOnInit() {
    
  }

  edit() {
    this.isEdit = true;
  }
  save() {
    this.isEdit = false;
    this.data.amount = +(+this.data.amount).toFixed(2);
    this.deletedCostItem.emit();
  }
  
  confirm(id:number): void {
    this.deletedCostItem.emit(id);
  }
  cancel(): void {}
  
}
