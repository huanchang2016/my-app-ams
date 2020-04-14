import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { ProjectRoutingModule } from './project-routing.module';

import { DraftListComponent } from './my-project/draft-list/draft-list.component';
import { ProductSearchOptionComponent } from './component/search-option/search-option.component';
import { ProgressListComponent } from './my-project/progress-list/progress-list.component';
import { FinishedListComponent } from './my-project/finished-list/finished-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectDrawerSearchOptionComponent } from './component/project-drawer-search-option/project-drawer-search-option.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { ProjectInfoComponent } from './component/project-info/project-info.component';
import { ProjectBudgetComponent } from './component/project-budget/project-budget.component';
import { ProjectSupplierComponent } from './component/project-supplier/project-supplier.component';
import { ProjectViewDraftComponent } from './component/project-view-draft/project-view-draft.component';
import { BudgetCostManageComponent } from './component/project-budget/budget-cost-manage/budget-cost-manage.component';
import { BudgetCostFormComponent } from './component/project-budget/budget-cost-manage/budget-cost-form/budget-cost-form.component';
import { HasContractSupplierComponent } from './component/project-supplier/component/has-contract-supplier/has-contract-supplier.component';
import { NoContractSupplierComponent } from './component/project-supplier/component/no-contract-supplier/no-contract-supplier.component';
import { ProjectSupplierFormComponent } from './component/project-supplier/component/project-supplier-form/project-supplier-form.component';
import { ProjectContractFormComponent } from './component/project-supplier/component/project-contract-form/project-contract-form.component';
import { SupplierContractListComponent } from './component/project-supplier/component/supplier-contract-list/supplier-contract-list.component';
import { ProjectEditSuccessComponent } from './component/project-edit-success/project-edit-success.component';
import { MyInApprovalListComponent } from './approval-project/my-in-approval-list/my-in-approval-list.component';
import { RefuseProjectListComponent } from './my-project/refuse-project-list/refuse-project-list.component';
import { MyApprovaledListComponent } from './approval-project/my-approvaled-list/my-approvaled-list.component';
import { MyForApprovaledListComponent } from './approval-project/my-for-approvaled-list/my-for-approvaled-list.component';
import { ProjectListCComponent } from './my-project/project-list-c/project-list-c.component';
import { ApprovalProjectListCComponent } from './approval-project/approval-project-list-c/approval-project-list-c.component';

const COMPONENTS = [
  DraftListComponent,
  ProgressListComponent,
  FinishedListComponent,
  ProjectCreateComponent,
  ProjectViewComponent,
  MyInApprovalListComponent,
  RefuseProjectListComponent,
  MyApprovaledListComponent,
  MyForApprovaledListComponent
];
const COMPONENTS_NOROUNT = [
  ProductSearchOptionComponent,
  ProjectDrawerSearchOptionComponent,
  ProjectInfoComponent,
  ProjectBudgetComponent,
  ProjectSupplierComponent,
  ProjectViewDraftComponent,
  BudgetCostManageComponent,
  BudgetCostFormComponent,
  HasContractSupplierComponent,
  NoContractSupplierComponent,
  ProjectSupplierFormComponent,
  ProjectContractFormComponent,
  SupplierContractListComponent,
  SupplierContractListComponent,
  ProjectEditSuccessComponent,
  ProjectListCComponent
];

@NgModule({
  imports: [
    SharedModule,
    ProjectRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    ApprovalProjectListCComponent
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class ProjecttModule { }