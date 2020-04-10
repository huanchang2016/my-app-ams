import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { WorkflowQuotaSettingsComponent } from './workflow-quota-settings/workflow-quota-settings.component';

const routes: Routes = [
  { path: 'list', component: WorkflowListComponent },
  { path: 'quota-settings', component: WorkflowQuotaSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule { }
