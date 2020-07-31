import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinancialProcessingVoucherContractComponent } from './contract/contract.component';
import { FinancialProcessingVoucherTreatyComponent } from './treaty/treaty.component';
import { FinancialProcessingVoucherBillComponent } from './bill/bill.component';
import { FinancialProcessingVoucherBillVoucherDetailsComponent } from './bill/bill-voucher-details/bill-voucher-details.component';
import { FinancialProcessingVoucherContractVoucherDetailsComponent } from './contract/contract-voucher-details/contract-voucher-details.component';
import { FinancialProcessingVoucherTreatyVoucherDetailsComponent } from './treaty/treaty-voucher-details/treaty-voucher-details.component';

const routes: Routes = [
  { path: 'contract', component: FinancialProcessingVoucherContractComponent },
  { path: 'contract/voucher/:id', component: FinancialProcessingVoucherContractVoucherDetailsComponent },
  { path: 'treaty', component: FinancialProcessingVoucherTreatyComponent },
  { path: 'treaty/voucher/:id', component: FinancialProcessingVoucherTreatyVoucherDetailsComponent },
  { path: 'bill', component: FinancialProcessingVoucherBillComponent },
  { path: 'bill/voucher/:id', component: FinancialProcessingVoucherBillVoucherDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialProcessingVoucherRoutingModule { }
