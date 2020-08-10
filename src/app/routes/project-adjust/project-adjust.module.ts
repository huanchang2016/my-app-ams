import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ProjectAdjustRoutingModule } from './project-adjust-routing.module';
import { ProjectAdjustListComponent } from './project-adjust-list/project-adjust-list.component';
import { ProjectAdjustSearchComponent } from './project-adjust-search/project-adjust-search.component';
import { AdjustUpdateComponent } from './adjust-update/adjust-update.component';
// 调整表单
import { AdjustBaseInfoComponent } from './adjust-update/adjust-base-info/adjust-base-info.component';
import { AdjustProjectIncomeComponent } from './adjust-update/adjust-project-income/adjust-project-income.component';
import { AdjustSubsidyIncomeComponent } from './adjust-update/adjust-subsidy-income/adjust-subsidy-income.component';
import { AdjustCostComponent } from './adjust-update/adjust-cost/adjust-cost.component';
import { AdjustContractComponent } from './adjust-update/adjust-contract/adjust-contract.component';
import { AdjustTreatyComponent } from './adjust-update/adjust-treaty/adjust-treaty.component';
// 调整之前的信息展示
import { AdjustBaseInfoShowComponent } from './adjust-update/adjust-base-info/adjust-base-info-show/adjust-base-info-show.component';
import { AdjustTreatyShowComponent } from './adjust-update/adjust-treaty/adjust-treaty-show/adjust-treaty-show.component';
import { AdjustContractShowComponent } from './adjust-update/adjust-contract/adjust-contract-show/adjust-contract-show.component';
import { AdjustCostShowComponent } from './adjust-update/adjust-cost/adjust-cost-show/adjust-cost-show.component';
import { AdjustSubsidyIncomeShowComponent } from './adjust-update/adjust-subsidy-income/adjust-subsidy-income-show/adjust-subsidy-income-show.component';
import { AdjustProjectIncomeShowComponent } from './adjust-update/adjust-project-income/adjust-project-income-show/adjust-project-income-show.component';
import { AdjustContractFormCComponent } from './adjust-update/adjust-contract/adjust-contract-form-c/adjust-contract-form-c.component';


import { AdjustListListComponent } from './adjust-list/adjust-list-list/adjust-list-list.component';
import { AdjustListSearchComponent } from './adjust-list/adjust-list-search/adjust-list-search.component';
import { MyAdjustListComponent } from './my-adjust/my-adjust-list/my-adjust-list.component';
import { MyAdjustSearchComponent } from './my-adjust/my-adjust-search/my-adjust-search.component';
import { ApprovelAdjustListComponent } from './approvel-adjust/approvel-adjust-list/approvel-adjust-list.component';
import { ApprovelAdjustSearchComponent } from './approvel-adjust/approvel-adjust-search/approvel-adjust-search.component';


@NgModule({
  declarations: [
    ProjectAdjustListComponent,
    ProjectAdjustSearchComponent,
    AdjustUpdateComponent,
    AdjustBaseInfoComponent,
    AdjustProjectIncomeComponent,
    AdjustSubsidyIncomeComponent,
    AdjustCostComponent,
    AdjustContractComponent,
    AdjustTreatyComponent,
    AdjustBaseInfoShowComponent,
    AdjustTreatyShowComponent,
    AdjustContractShowComponent,
    AdjustCostShowComponent,
    AdjustSubsidyIncomeShowComponent,
    AdjustProjectIncomeShowComponent,
    AdjustContractFormCComponent,
    ProjectAdjustListComponent,
    ProjectAdjustSearchComponent,
    AdjustListListComponent,
    AdjustListSearchComponent,
    MyAdjustListComponent,
    MyAdjustSearchComponent,
    ApprovelAdjustListComponent,
    ApprovelAdjustSearchComponent],
  imports: [
    SharedModule,
    ProjectAdjustRoutingModule
  ],
  entryComponents: [
    AdjustContractFormCComponent
  ]
})
export class ProjectAdjustModule { }
