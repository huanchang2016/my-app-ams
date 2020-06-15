import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractListComponent } from './list/list.component';
import { ContractContractSearchFormComponent } from './component/contract-search-form/contract-search-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ContractListComponent }
,
  { path: 'contract-search-form', component: ContractContractSearchFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractRoutingModule { }
