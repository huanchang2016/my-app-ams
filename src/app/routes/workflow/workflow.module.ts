import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { QuotaSearchComponentComponent } from './workflow-quota-settings/quota-search-component/quota-search-component.component';
import { QuotaFormComponentComponent } from './workflow-quota-settings/quota-form-component/quota-form-component.component';
import { WorkflowQuotaSettingsComponent } from './workflow-quota-settings/workflow-quota-settings.component';
import { WorkflowFormComponent } from './workflow-list/workflow-form/workflow-form.component';
import { SearchOptionComponent } from './workflow-list/search-option/search-option.component';
import { NodeListComponent } from './workflow-list/sub-component/node-list/node-list.component';
import { NodeFormComponent } from './workflow-list/sub-component/node-form/node-form.component';

const COMPONENTS = [
  WorkflowListComponent,
  WorkflowQuotaSettingsComponent
];
const COMPONENTS_NOROUNT = [
  QuotaFormComponentComponent,
  QuotaSearchComponentComponent,
  WorkflowFormComponent,
  SearchOptionComponent,
  NodeListComponent,
  NodeFormComponent
];

@NgModule({
  imports: [
    SharedModule,
    WorkflowRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class WorkflowModule { }
