import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { FinancialProcessingVoucherRoutingModule } from './financial-processing-voucher-routing.module';
import { FinancialProcessingVoucherSearchComponentComponent } from './component/search-component/search-component.component';
import { FinancialProcessingVoucherContractComponent } from './contract/contract.component';
import { FinancialProcessingVoucherTreatyComponent } from './treaty/treaty.component';
import { FinancialProcessingVoucherBillComponent } from './bill/bill.component';
import { FinancialProcessingVoucherBillVoucherDetailsComponent } from './bill/bill-voucher-details/bill-voucher-details.component';
import { FinancialProcessingVoucherContractVoucherDetailsComponent } from './contract/contract-voucher-details/contract-voucher-details.component';
import { FinancialProcessingVoucherTreatyVoucherDetailsComponent } from './treaty/treaty-voucher-details/treaty-voucher-details.component';
import { BillListComponent } from './bill/bill-list/bill-list.component';
import { BillListSearchComponent } from './bill/bill-list-search/bill-list-search.component';
import { MyBillListComponent } from './bill/my-bill-list/my-bill-list.component';
import { MyBillSearchComponent } from './bill/my-bill-search/my-bill-search.component';
import { BillApprovalListComponent } from './bill/bill-approval-list/bill-approval-list.component';
import { BillApprovalSearchComponent } from './bill/bill-approval-search/bill-approval-search.component';
import { BillExcuteListComponent } from './bill/bill-excute-list/bill-excute-list.component';
import { BillExcuteSearchComponent } from './bill/bill-excute-search/bill-excute-search.component';

const COMPONENTS = [
  FinancialProcessingVoucherContractComponent,
  FinancialProcessingVoucherTreatyComponent,
  FinancialProcessingVoucherBillComponent,
  FinancialProcessingVoucherBillVoucherDetailsComponent,
  FinancialProcessingVoucherContractVoucherDetailsComponent,
  FinancialProcessingVoucherTreatyVoucherDetailsComponent];
const COMPONENTS_NOROUNT = [
  FinancialProcessingVoucherSearchComponentComponent
];

@NgModule({
  imports: [
    SharedModule,
    FinancialProcessingVoucherRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    BillListComponent,
    BillListSearchComponent,
    MyBillListComponent,
    MyBillSearchComponent,
    BillApprovalListComponent,
    BillApprovalSearchComponent,
    BillExcuteListComponent,
    BillExcuteSearchComponent
  ],
})
export class FinancialProcessingVoucherModule { }
