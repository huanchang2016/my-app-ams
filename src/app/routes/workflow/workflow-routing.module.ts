import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { WorkflowQuotaSettingsComponent } from './workflow-quota-settings/workflow-quota-settings.component';

import { ACLGuard, ACLType } from '@delon/acl';

const routes: Routes = [
  { path: 'list', component: WorkflowListComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['workflow_list']
      }
    }
  },
  { path: 'quota-settings', component: WorkflowQuotaSettingsComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['quota_list']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule { }
