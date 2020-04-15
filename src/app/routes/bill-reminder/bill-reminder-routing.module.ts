import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillReminderInvoicesListComponent } from './control-over-invoices/invoices-list/invoices-list.component';

const routes: Routes = [
  { path: 'invoices', component: BillReminderInvoicesListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillReminderRoutingModule { }
