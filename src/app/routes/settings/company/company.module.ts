import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { CompanyRoutingModule } from './company-routing.module';

import { CompanySearchOptionComponent } from './component/search-option/search-option.component';
import { CompanyFormComponent } from './component/company-form/company-form.component';
import { CustomerCompanyComponent } from './customer-company/customer-company.component';
import { SupplierCompanyComponent } from './supplier-company/supplier-company.component';
import { ListAllComponent } from './list-all/list-all.component';
import { ListSearchOptionComponent } from './list-all/list-search-option/list-search-option.component';
import { CompanyViewComponent } from './component/company-view/company-view.component';
import { ListDrawerSearchOptionComponent } from './list-all/list-drawer-search-option/list-drawer-search-option.component';
import { DrawerSearchOptionComponent } from './component/drawer-search-option/drawer-search-option.component';

const COMPONENTS = [
  CustomerCompanyComponent,
  SupplierCompanyComponent,
  ListAllComponent,
  ];
const COMPONENTS_NOROUNT = [
  ListSearchOptionComponent,
  ListDrawerSearchOptionComponent,
  CompanySearchOptionComponent,
  CompanyFormComponent,
  CompanyViewComponent,
  DrawerSearchOptionComponent
];

@NgModule({
  imports: [
    SharedModule,
    CompanyRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class CompanyModule { }
