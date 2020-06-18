import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractListComponent } from './list/list.component';
import { ContractViewComponent } from './view/view.component';
import { ContractSplitListComponent } from './split-list/split-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ContractListComponent },
  { path: 'view/:id', component: ContractViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractRoutingModule { }
