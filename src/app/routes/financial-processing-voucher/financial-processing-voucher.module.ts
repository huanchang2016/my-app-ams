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
    ...COMPONENTS_NOROUNT
  ],
})
export class FinancialProcessingVoucherModule { }
