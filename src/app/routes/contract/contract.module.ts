import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { ContractRoutingModule } from './contract-routing.module';
import { ContractListComponent } from './list/list.component';
import { ContractContractFormComponent } from './component/contract-form/contract-form.component';
import { ContractContractSearchFormComponent } from './component/contract-search-form/contract-search-form.component';
import { ContractViewComponent } from './view/view.component';
import { ContractSplitListComponent } from './split-list/split-list.component';

const COMPONENTS = [
  ContractListComponent,
  ContractViewComponent,
];
const COMPONENTS_NOROUNT = [
  ContractContractFormComponent,
  ContractContractSearchFormComponent,
  ContractSplitListComponent
];

@NgModule({
  imports: [
    SharedModule,
    ContractRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class ContractModule { }
