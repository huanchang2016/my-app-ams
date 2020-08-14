import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';

import { ReportRoutingModule } from './report-routing.module';
import { BillReportComponent } from './bill-report/bill-report.component';
import { BillReportTableComponent } from './bill-report/bill-report-table/bill-report-table.component';


@NgModule({
  declarations: [BillReportComponent, BillReportTableComponent],
  imports: [
    SharedModule,
    CommonModule,
    ReportRoutingModule
  ]
})
export class ReportModule { }
