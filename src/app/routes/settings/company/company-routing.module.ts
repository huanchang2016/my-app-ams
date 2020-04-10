import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListAllComponent } from './list-all/list-all.component';
import { CustomerCompanyComponent } from './customer-company/customer-company.component';
import { SupplierCompanyComponent } from './supplier-company/supplier-company.component';

const routes: Routes = [
  { path: 'list', component: ListAllComponent },
  { path: 'customer', component: CustomerCompanyComponent },
  { path: 'supplier', component: SupplierCompanyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
