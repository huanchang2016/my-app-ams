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
import { BudgetCostManageComponent } from './component/project-budget/budget-cost-manage/budget-cost-manage.component';
import { BudgetCostFormComponent } from './component/project-budget/budget-cost-manage/budget-cost-form/budget-cost-form.component';
import { HasContractSupplierComponent } from './component/project-supplier/component/has-contract-supplier/has-contract-supplier.component';
import { NoContractSupplierComponent } from './component/project-supplier/component/no-contract-supplier/no-contract-supplier.component';
import { ProjectSupplierFormComponent } from './component/project-supplier/component/project-supplier-form/project-supplier-form.component';
import { SupplierContractListComponent } from './component/project-supplier/component/supplier-contract-list/supplier-contract-list.component';
import { SupplierNoContractListComponent } from './component/project-supplier/component/supplier-no-contract-list/supplier-no-contract-list.component';

import { ProjectEditSuccessComponent } from './component/project-edit-success/project-edit-success.component';
import { MyInApprovalListComponent } from './approval-project/my-in-approval-list/my-in-approval-list.component';
import { RefuseProjectListComponent } from './my-project/refuse-project-list/refuse-project-list.component';
import { MyApprovaledListComponent } from './approval-project/my-approvaled-list/my-approvaled-list.component';
import { MyForApprovaledListComponent } from './approval-project/my-for-approvaled-list/my-for-approvaled-list.component';
import { ProjectListCComponent } from './my-project/project-list-c/project-list-c.component';
import { ApprovalProjectListCComponent } from './approval-project/approval-project-list-c/approval-project-list-c.component';
import { ProjectInfoShowCComponent } from './component/project-info-show-c/project-info-show-c.component';
import { ProjectLogsComponent } from './component/project-logs/project-logs.component';
import { ProjectAdjustComponent } from './project-adjust/project-adjust.component';
import { AdjustProjectInfoComponent } from './project-adjust/adjust-project-info/adjust-project-info.component';
import { AdjustBudgetInfoComponent } from './project-adjust/adjust-budget-info/adjust-budget-info.component';
import { AdjustSupplierInfoComponent } from './project-adjust/adjust-supplier-info/adjust-supplier-info.component';
import { DateRangePickerCComponent } from './project-adjust/component/date-range-picker-c/date-range-picker-c.component';
import { AdjustSupplierFormCComponent } from './project-adjust/adjust-supplier-info/adjust-supplier-form-c/adjust-supplier-form-c.component';
import { AdjustSupplierContractListCComponent } from './project-adjust/adjust-supplier-info/adjust-supplier-contract-list-c/adjust-supplier-contract-list-c.component';
import { AdjustSupplierTreatyListCComponent } from './project-adjust/adjust-supplier-info/adjust-supplier-treaty-list-c/adjust-supplier-treaty-list-c.component';
import { AdjustSupplierContractFormCComponent } from './project-adjust/adjust-supplier-info/adjust-supplier-contract-form-c/adjust-supplier-contract-form-c.component';
import { AdjustSupplierTreatyFormCComponent } from './project-adjust/adjust-supplier-info/adjust-supplier-treaty-form-c/adjust-supplier-treaty-form-c.component';
import { ProjectIncomeCComponent } from './component/project-budget/budget-index/project-income-c/project-income-c.component';
import { SubsidyIncomeCComponent } from './component/project-budget/budget-index/subsidy-income-c/subsidy-income-c.component';
import { ProjectIncomeFormCComponent } from './component/project-budget/budget-index/project-income-c/project-income-form-c/project-income-form-c.component';
import { SubsidyIncomeFormCComponent } from './component/project-budget/budget-index/subsidy-income-c/subsidy-income-form-c/subsidy-income-form-c.component';
import { ProjectIncomeShowCComponent } from './project-view/project-income-show-c/project-income-show-c.component';
import { SubsidyIncomeShowCComponent } from './project-view/subsidy-income-show-c/subsidy-income-show-c.component';
import { MyProjectListComponent } from './my-project/my-project-list/my-project-list.component';
import { ApprovalProjectListComponent } from './approval-project/approval-project-list/approval-project-list.component';
import { ProjectIncomeTypeAndAmountComponent } from './component/project-budget/budget-index/project-income-type-and-amount/project-income-type-and-amount.component';
import { TypeAmountListComponent } from './component/project-budget/budget-index/project-income-type-and-amount/type-amount-list/type-amount-list.component';

const COMPONENTS = [
  DraftListComponent,
  ProgressListComponent,
  FinishedListComponent,
  ProjectCreateComponent,
  ProjectViewComponent,
  MyInApprovalListComponent,
  RefuseProjectListComponent,
  MyApprovaledListComponent,
  MyForApprovaledListComponent,
  ProjectAdjustComponent
];
const COMPONENTS_NOROUNT = [
  ProductSearchOptionComponent,
  ProjectDrawerSearchOptionComponent,
  ProjectInfoComponent,
  ProjectBudgetComponent,
  BudgetCostManageComponent,
  BudgetCostFormComponent,
  ProjectSupplierComponent,
  HasContractSupplierComponent,
  NoContractSupplierComponent,
  ProjectSupplierFormComponent,
  SupplierContractListComponent,
  SupplierNoContractListComponent,
  ProjectEditSuccessComponent,
  ProjectListCComponent,
  ApprovalProjectListCComponent,
  ProjectInfoShowCComponent,
  SupplierNoContractListComponent,
  ProjectLogsComponent,
  AdjustProjectInfoComponent,
  AdjustBudgetInfoComponent,
  ProjectIncomeCComponent,
  SubsidyIncomeCComponent,
  ProjectIncomeFormCComponent,
  SubsidyIncomeFormCComponent,
  AdjustSupplierInfoComponent,
  DateRangePickerCComponent,
  AdjustSupplierFormCComponent,
  AdjustSupplierContractListCComponent,
  AdjustSupplierTreatyListCComponent,
  AdjustSupplierContractFormCComponent,
  AdjustSupplierTreatyFormCComponent,
  ProjectIncomeShowCComponent,
  SubsidyIncomeShowCComponent
];

@NgModule({
  imports: [
    SharedModule,
    ProjectRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    MyProjectListComponent,
    ApprovalProjectListComponent,
    ProjectIncomeTypeAndAmountComponent,
    TypeAmountListComponent
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class ProjecttModule { }