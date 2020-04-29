import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectCostListComponent } from '../project-settings/project-cost-list/project-cost-list.component';
import { ProjectIncomeListComponent } from './project-income-list/project-income-list.component';
import { ProjectServiceCategoryListComponent } from './project-service-category-list/project-service-category-list.component';

import { ACLGuard, ACLType } from '@delon/acl';

const routes: Routes = [
  { path: 'cost', component: ProjectCostListComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['cost_list']
      }
    }
  },
  { path: 'income', component: ProjectIncomeListComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['tax_list']
      }
    }
  },
  { path: 'service-category', component: ProjectServiceCategoryListComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['supplier_service_list']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectSettingsRoutingModule { }
