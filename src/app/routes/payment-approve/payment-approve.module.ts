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

import { ViewApproveProjectComponent } from './contract-approve-manage/view-approve-project/view-approve-project.component';


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

const COMPONENTS = [
  // 有合约  合约审批管理
  ApproveNotStartedComponent,
  MyApplyForInprogressComponent,
  MyApplyForPassComponent,
  MyApplyForRefuseComponent,
  
  ForApprovalListComponent,
  ViewApproveProjectComponent,
  ProjectContractListComponent,
  ContractPayCreateComponent,
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
  ProjectNoContractListComponent,
  NoContractApplyPassComponent,
  NoContractApplyRefuseComponent,
  // 无合约 协议审批
  NoContractApproveListComponent,
  NoContractForApproveListComponent,
  NoContractApprovedFinishedListComponent,
  NoContractApprovedWithoutListComponent,
  NoContractApproveViewComponent
];
const COMPONENTS_NOROUNT = [
  ApproveSearchOptionComponent,
  PaymentContractFormComponent
];

@NgModule({
  imports: [
    SharedModule,
    PaymentApproveRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class PaymentApproveModule { }
