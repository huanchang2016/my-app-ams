import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { ContractRoutingModule } from './contract-routing.module';
import { ContractListComponent } from './list/list.component';
import { ContractContractFormComponent } from './component/contract-form/contract-form.component';
import { ContractContractSearchFormComponent } from './component/contract-search-form/contract-search-form.component';

const COMPONENTS = [
  ContractListComponent,
  ContractContractFormComponent,
  ContractContractSearchFormComponent];
const COMPONENTS_NOROUNT = [];

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
