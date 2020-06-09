import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { ProjectSettingsRoutingModule } from './project-settings-routing.module';
import { ProjectCostListComponent } from './project-cost-list/project-cost-list.component';
import { CostSearchComponentComponent } from './project-cost-list/cost-search-component/cost-search-component.component';
import { CostFormComponentComponent } from './project-cost-list/cost-form-component/cost-form-component.component';
import { ProjectIncomeListComponent } from './project-income-list/project-income-list.component';
import { IncomeFormComponentComponent } from './project-income-list/income-form-component/income-form-component.component';
import { IncomeSearchComponentComponent } from './project-income-list/income-search-component/income-search-component.component';
import { ProjectServiceCategoryListComponent } from './project-service-category-list/project-service-category-list.component';
import { ServiceCategoryFormComponent } from './project-service-category-list/service-category-form/service-category-form.component';
import { ServiceCategorySearchComponent } from './project-service-category-list/service-category-search/service-category-search.component';
import { ProSubincomeListCComponent } from './project-income-list/pro-subincome-list-c/pro-subincome-list-c.component';
import { SubincomeFormCComponent } from './project-income-list/pro-subincome-list-c/subincome-form-c/subincome-form-c.component';
import { ContractCategoryComponent } from './contract-category-list/contract-category.component';
import { ContractCategoryFormCComponent } from './contract-category-list/contract-category-form-c/contract-category-form-c.component';
import { ContractCategorySearchCComponent } from './contract-category-list/contract-category-search-c/contract-category-search-c.component';

const COMPONENTS = [
  ProjectCostListComponent,
  ProjectIncomeListComponent,
  ProjectServiceCategoryListComponent,
  ContractCategoryComponent
];
const COMPONENTS_NOROUNT = [
  CostSearchComponentComponent,
  CostFormComponentComponent,
  IncomeFormComponentComponent,
  IncomeSearchComponentComponent,
  ServiceCategoryFormComponent,
  ServiceCategorySearchComponent,
  ProSubincomeListCComponent,
  SubincomeFormCComponent,
  ContractCategoryFormCComponent,
  ContractCategorySearchCComponent
];

@NgModule({
  imports: [
    SharedModule,
    ProjectSettingsRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class ProjectSettingsModule { }
