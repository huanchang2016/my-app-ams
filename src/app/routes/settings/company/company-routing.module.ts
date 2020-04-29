import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListAllComponent } from './list-all/list-all.component';
import { CustomerCompanyComponent } from './customer-company/customer-company.component';
import { SupplierCompanyComponent } from './supplier-company/supplier-company.component';
import { ACLGuard, ACLType } from '@delon/acl';

const routes: Routes = [
  { path: 'list', component: ListAllComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['user_company_list']
      }
    }
  },
  { path: 'customer', component: CustomerCompanyComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['customer_company_list']
      }
    }
},
  { path: 'supplier', component: SupplierCompanyComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['supplier_company_list']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
