import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-budget-cost-form',
  templateUrl: './budget-cost-form.component.html',
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
export class BudgetCostFormComponent implements OnInit {
  @Input() data:any;

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
