import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { BillReminderRoutingModule } from './bill-reminder-routing.module';

import { BillApplyProjectsComponent } from './bill-manage/bill-apply/bill-apply-projects/bill-apply-projects.component';
import { BillReminderInvoicesListComponent } from './bill-manage/control-over-invoices/invoices-list/invoices-list.component';
import { InvoicesFormManageComponent } from './bill-manage/control-over-invoices/invoices-form-manage/invoices-form-manage.component';
import { BillReminderInvoicesInfoViewComponent } from './bill-manage/control-over-invoices/invoices-info-view/invoices-info-view.component';
import { BillReminderBillApplyInProgressComponent } from './bill-manage/bill-apply/bill-apply-in-progress/bill-apply-in-progress.component';
import { BillApplyPassComponent } from './bill-manage/bill-apply/bill-apply-pass/bill-apply-pass.component';
import { BillApplyRefusedComponent } from './bill-manage/bill-apply/bill-apply-refused/bill-apply-refused.component';

import { BillReminderInvoicesSearchComponent } from './bill-manage/component/invoices-search/invoices-search.component';
import { BillApplyProjectSearchComponent } from './bill-manage/component/bill-apply-project-search/bill-apply-project-search.component';
import { InvoicesTaxFeesCComponent } from './bill-manage/control-over-invoices/invoices-form-manage/invoices-tax-fees-c/invoices-tax-fees-c.component';
import { ViewTaxFeesListComponent } from './bill-manage/control-over-invoices/invoices-info-view/view-tax-fees-list/view-tax-fees-list.component';
import { BillApplyListCComponent } from './bill-manage/component/bill-apply-list-c/bill-apply-list-c.component';
import { BillApproveBemyComponent } from './bill-manage/bill-approve/bill-approve-bemy/bill-approve-bemy.component';
import { BillApproveFormyComponent } from './bill-manage/bill-approve/bill-approve-formy/bill-approve-formy.component';
import { BillApproveFinishedComponent } from './bill-manage/bill-approve/bill-approve-finished/bill-approve-finished.component';
import { BillApproveWithoutComponent } from './bill-manage/bill-approve/bill-approve-without/bill-approve-without.component';
import { BillExcuteFinishedComponent } from './bill-manage/bill-excute/bill-excute-finished/bill-excute-finished.component';
import { BillExcuteNotStartComponent } from './bill-manage/bill-excute/bill-excute-not-start/bill-excute-not-start.component';
import { BillExcuteListCComponent } from './bill-manage/component/bill-excute-list-c/bill-excute-list-c.component';
import { BillApplyListComponent } from './bill-manage/bill-apply/bill-apply-list/bill-apply-list.component';
import { BillApproveListComponent } from './bill-manage/bill-approve/bill-approve-list/bill-approve-list.component';
import { BillExcuteListComponent } from './bill-manage/bill-excute/bill-excute-list/bill-excute-list.component';
import { BillDepartmentHeadListComponent } from './bill-manage/bill-department-head/bill-department-head-list/bill-department-head-list.component';
import { BillDepartmentHeadSearchComponent } from './bill-manage/bill-department-head/bill-department-head-search/bill-department-head-search.component';

const COMPONENTS = [
  BillApplyProjectsComponent,
  BillReminderInvoicesListComponent,
  InvoicesFormManageComponent,
  BillReminderInvoicesInfoViewComponent,
  BillReminderBillApplyInProgressComponent,
  BillApplyListCComponent,
  BillApplyPassComponent,
  BillApplyRefusedComponent,
  // 审批 开票
  BillApproveBemyComponent,
  BillApproveFormyComponent,
  BillApproveFinishedComponent,
  BillApproveWithoutComponent,
  // 开票执行情况
  BillExcuteFinishedComponent,
  BillExcuteNotStartComponent
];
const COMPONENTS_NOROUNT = [
  BillReminderInvoicesSearchComponent,
  BillApplyProjectSearchComponent,
  InvoicesTaxFeesCComponent,
  ViewTaxFeesListComponent,
  BillExcuteListCComponent,
];

@NgModule({
  imports: [
    SharedModule,
    BillReminderRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    BillApplyListComponent,
    BillApproveListComponent,
    BillExcuteListComponent,
    BillDepartmentHeadListComponent,
    BillDepartmentHeadSearchComponent,
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class BillReminderModule { }
