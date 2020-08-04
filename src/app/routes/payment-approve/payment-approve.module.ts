import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PaymentApproveRoutingModule } from './payment-approve-routing.module';
import { ApproveSearchOptionComponent } from './component/approve-search-option/approve-search-option.component';

// 有合约  合约审批管理
import { ApproveNotStartedComponent } from './contract-approve-manage/apply-for/approve-not-started/approve-not-started.component';
import { PaymentContractFormComponent } from './component/payment-contract-form/payment-contract-form.component';
import { ProjectContractListComponent } from './contract-approve-manage/apply-for/project-contract-list/project-contract-list.component';
import { ContractPayCreateComponent } from './contract-approve-manage/apply-for/contract-pay-create/contract-pay-create.component';
// 我申请的支付流程（进行中的）
import { MyApplyForInprogressComponent } from './contract-approve-manage/apply-for/my-apply-for-inprogress/my-apply-for-inprogress.component';
// 我申请支付流程（已通过的）
import { MyApplyForPassComponent } from './contract-approve-manage/apply-for/my-apply-for-pass/my-apply-for-pass.component';
// 我申请支付流程（已拒绝的）
import { MyApplyForRefuseComponent } from './contract-approve-manage/apply-for/my-apply-for-refuse/my-apply-for-refuse.component';
// 合约支付审批（该我的、带我审批的、我已审批的、未审批未通过的）
import { ForApprovalListComponent } from './contract-approve-manage/approve-pay/for-approval-list/for-approval-list.component';
import { InApproveProjectComponent } from './contract-approve-manage/approve-pay/in-approve-project/in-approve-project.component';
import { FinishedApproveProjectComponent } from './contract-approve-manage/approve-pay/finished-approve-project/finished-approve-project.component';
import { WithoutApprovalListComponent } from './contract-approve-manage/approve-pay/without-approval-list/without-approval-list.component';

// 查看详情
import { ApplyContractViewComponent } from './contract-approve-manage/approve-pay/apply-contract-view/apply-contract-view.component';


// 无合约  协议审批管理
import { NoContractNotStartedComponent } from './no-contract-approve-manage/apply-for/no-contract-not-started/no-contract-not-started.component';
import { NoContractPayCreateComponent } from './no-contract-approve-manage/apply-for/no-contract-pay-create/no-contract-pay-create.component';
import { NoContractProjectProgressComponent } from './no-contract-approve-manage/apply-for/no-contract-project-progress/no-contract-project-progress.component';
import { ProjectNoContractListComponent } from './no-contract-approve-manage/apply-for/project-no-contract-pay-list/project-no-contract-list.component';
import { NoContractApplyPassComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-pass/no-contract-apply-pass.component';
import { NoContractApplyRefuseComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-refuse/no-contract-apply-refuse.component';
import { NoContractApproveListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approve-list/no-contract-approve-list.component';
import { NoContractForApproveListComponent } from './no-contract-approve-manage/approve-pay/no-contract-for-approve-list/no-contract-for-approve-list.component';
import { NoContractApprovedFinishedListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approved-finished-list/no-contract-approved-finished-list.component';
import { NoContractApprovedWithoutListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approved-without-list/no-contract-approved-without-list.component';
import { NoContractApproveViewComponent } from './no-contract-approve-manage/approve-pay/no-contract-approve-view/no-contract-approve-view.component';
import { ApplyListCComponent } from './contract-approve-manage/apply-for/apply-list-c/apply-list-c.component';
import { ApproveListCComponent } from './contract-approve-manage/approve-pay/approve-list-c/approve-list-c.component';
import { NoContractPayListCComponent } from './no-contract-approve-manage/approve-pay/no-contract-pay-list-c/no-contract-pay-list-c.component';
import { NoContractApplyListCComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-list-c/no-contract-apply-list-c.component';
import { NoContractExcuteNotStartComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-not-start/no-contract-excute-not-start.component';
import { NoContractExcuteFinishedComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-finished/no-contract-excute-finished.component';
import { NoContractExcuteListCComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-list-c/no-contract-excute-list-c.component';
import { ContractExcuteNotStartComponent } from './contract-approve-manage/excute-pay/contract-excute-not-start/contract-excute-not-start.component';
import { ContractExcuteFinishedComponent } from './contract-approve-manage/excute-pay/contract-excute-finished/contract-excute-finished.component';
import { ContractExcuteListCComponent } from './contract-approve-manage/excute-pay/contract-excute-list-c/contract-excute-list-c.component';

import { ContractApprovePayListComponent } from './contract-approve-manage/approve-pay/contract-approve-pay-list/contract-approve-pay-list.component';
import { ContractApplyForListComponent } from './contract-approve-manage/apply-for/contract-apply-for-list/contract-apply-for-list.component';
import { ExcuteContractPayListComponent } from './contract-approve-manage/excute-pay/excute-contract-pay-list/excute-contract-pay-list.component';
import { NoContractApplyForListComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-for-list/no-contract-apply-for-list.component';
import { NoContractApprovePayListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approve-pay-list/no-contract-approve-pay-list.component';
import { NoContractExcutePayListComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-pay-list/no-contract-excute-pay-list.component';
import { ContractPayPendExecuteComponent } from './contract-approve-manage/apply-for/contract-pay-pend-execute/contract-pay-pend-execute.component';
import { NoContractPayPendExecuteComponent } from './no-contract-approve-manage/apply-for/no-contract-pay-pend-execute/no-contract-pay-pend-execute.component';
import { NoContractPayPayedComponent } from './no-contract-approve-manage/apply-for/no-contract-pay-payed/no-contract-pay-payed.component';
import { NoContractExcutePayedListComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-payed-list/no-contract-excute-payed-list.component';
import { ContractPayForPayedComponent } from './contract-approve-manage/apply-for/contract-pay-for-payed/contract-pay-for-payed.component';
import { ContractExcuteForPayedComponent } from './contract-approve-manage/excute-pay/contract-excute-for-payed/contract-excute-for-payed.component';
import { ApplyListIndexComponent } from './contract-approve-manage/apply-list/apply-list-index/apply-list-index.component';
import { ApplyListSearchComponent } from './contract-approve-manage/apply-list/apply-list-search/apply-list-search.component';
import { NoContractApplyListIndexComponent } from './no-contract-approve-manage/apply-list/no-contract-apply-list-index/no-contract-apply-list-index.component';
import { NoContractApplyListSearchComponent } from './no-contract-approve-manage/apply-list/no-contract-apply-list-search/no-contract-apply-list-search.component';

const COMPONENTS = [
  // 有合约  合约审批管理
  ApproveNotStartedComponent,
  MyApplyForInprogressComponent,
  MyApplyForPassComponent,
  MyApplyForRefuseComponent,

  ForApprovalListComponent,
  ProjectContractListComponent,
  ContractPayCreateComponent,
  ContractPayForPayedComponent,
  // 合约审批
  InApproveProjectComponent,
  ForApprovalListComponent,
  FinishedApproveProjectComponent,
  WithoutApprovalListComponent,
  ApplyContractViewComponent, // 审批查看 合约信息

  // 无合约  协议 申请管理
  NoContractNotStartedComponent,
  NoContractPayCreateComponent,
  NoContractProjectProgressComponent,
  NoContractPayPayedComponent,
  ProjectNoContractListComponent,
  NoContractApplyPassComponent,
  NoContractApplyRefuseComponent,
  // 无合约 协议审批
  NoContractApproveListComponent,
  NoContractForApproveListComponent,
  NoContractApprovedFinishedListComponent,
  NoContractApprovedWithoutListComponent,
  NoContractApproveViewComponent,
  NoContractExcutePayedListComponent,
  // 合约支付 执行情况
  ContractExcuteNotStartComponent,
  ContractExcuteFinishedComponent,
  ContractPayPendExecuteComponent,
  ContractExcuteForPayedComponent,
  // 无合约执行情况
  NoContractExcuteNotStartComponent,
  NoContractExcuteFinishedComponent,
  NoContractPayPendExecuteComponent,

  ContractApprovePayListComponent,
  NoContractApproveListComponent,
  ContractApplyForListComponent,
  ExcuteContractPayListComponent,
  NoContractApplyForListComponent,
  NoContractApprovePayListComponent,
  NoContractExcutePayListComponent
];
const COMPONENTS_NOROUNT = [
  ApproveSearchOptionComponent,
  PaymentContractFormComponent,
  ApplyListCComponent,
  ApproveListCComponent,
  NoContractPayListCComponent,
  NoContractApplyListCComponent,
  NoContractExcuteListCComponent,
  ContractExcuteListCComponent,
];

@NgModule({
  imports: [
    SharedModule,
    PaymentApproveRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    ApplyListIndexComponent,
    ApplyListSearchComponent,
    NoContractApplyListIndexComponent,
    NoContractApplyListSearchComponent

  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class PaymentApproveModule { }
