import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { BillReminderRoutingModule } from './bill-reminder-routing.module';
import { BillReminderInvoicesListComponent } from './control-over-invoices/invoices-list/invoices-list.component';
import { BillReminderInvoicesFormComponent } from './control-over-invoices/invoices-form/invoices-form.component';
import { BillReminderInvoicesSearchComponent } from './control-over-invoices/invoices-search/invoices-search.component';

const COMPONENTS = [
  BillReminderInvoicesListComponent,];
const COMPONENTS_NOROUNT = [
  BillReminderInvoicesFormComponent,
  BillReminderInvoicesSearchComponent
];

@NgModule({
  imports: [
    SharedModule,
    BillReminderRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class BillReminderModule { }
