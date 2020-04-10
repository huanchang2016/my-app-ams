import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectCostListComponent } from '../project-settings/project-cost-list/project-cost-list.component';
import { ProjectIncomeListComponent } from './project-income-list/project-income-list.component';
import { ProjectServiceCategoryListComponent } from './project-service-category-list/project-service-category-list.component';

const routes: Routes = [
  { path: 'cost', component: ProjectCostListComponent },
  { path: 'income', component: ProjectIncomeListComponent },
  { path: 'service-category', component: ProjectServiceCategoryListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectSettingsRoutingModule { }
