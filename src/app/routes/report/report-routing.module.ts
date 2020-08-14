import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillReportComponent } from './bill-report/bill-report.component'


const routes: Routes = [
  { path: 'bill-report', component: BillReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
