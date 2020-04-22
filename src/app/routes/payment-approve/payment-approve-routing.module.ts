import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewApproveProjectComponent } from './contract-approve-manage/view-approve-project/view-approve-project.component';

  // 有合约  合约审批管理
import { ApproveNotStartedComponent } from './contract-approve-manage/apply-for/approve-not-started/approve-not-started.component';
import { ProjectContractListComponent } from './contract-approve-manage/apply-for/project-contract-list/project-contract-list.component';
import { ContractPayCreateComponent } from './contract-approve-manage/apply-for/contract-pay-create/contract-pay-create.component';

// 我申请的支付流程（进行中的）
import { MyApplyForInprogressComponent } from './contract-approve-manage/apply-for/my-apply-for-inprogress/my-apply-for-inprogress.component';
// 我申请支付流程（已通过的）
import { MyApplyForPassComponent } from './contract-approve-manage/apply-for/my-apply-for-pass/my-apply-for-pass.component';
// 我申请支付流程（已拒绝的）
import { MyApplyForRefuseComponent } from './contract-approve-manage/apply-for/my-apply-for-refuse/my-apply-for-refuse.component';
// 合约支付审批（该我的、带我审批的、我已审批的）
import { InApproveProjectComponent } from './contract-approve-manage/approve-pay/in-approve-project/in-approve-project.component';
import { ForApprovalListComponent } from './contract-approve-manage/approve-pay/for-approval-list/for-approval-list.component';
import { FinishedApproveProjectComponent } from './contract-approve-manage/approve-pay/finished-approve-project/finished-approve-project.component';
import { WithoutApprovalListComponent } from './contract-approve-manage/approve-pay/without-approval-list/without-approval-list.component';
// 查看合约支付信息  及 流程处理
import { ApplyContractViewComponent } from './contract-approve-manage/approve-pay/apply-contract-view/apply-contract-view.component';

// 无合约  非合约支付 申请管理
import { NoContractNotStartedComponent } from './no-contract-approve-manage/apply-for/no-contract-not-started/no-contract-not-started.component';
import { NoContractPayCreateComponent } from './no-contract-approve-manage/apply-for/no-contract-pay-create/no-contract-pay-create.component';
import { NoContractProjectProgressComponent } from './no-contract-approve-manage/apply-for/no-contract-project-progress/no-contract-project-progress.component';
import { ProjectNoContractListComponent } from './no-contract-approve-manage/apply-for/project-no-contract-pay-list/project-no-contract-list.component';
import { NoContractApplyPassComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-pass/no-contract-apply-pass.component';
import { NoContractApplyRefuseComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-refuse/no-contract-apply-refuse.component';

// 无合约 非合约支付审批 (我的， 该我审批， 审批完成， 未审批已被拒绝的)
import { NoContractApproveListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approve-list/no-contract-approve-list.component';
import { NoContractForApproveListComponent } from './no-contract-approve-manage/approve-pay/no-contract-for-approve-list/no-contract-for-approve-list.component';
import { NoContractApprovedFinishedListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approved-finished-list/no-contract-approved-finished-list.component';
import { NoContractApprovedWithoutListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approved-without-list/no-contract-approved-without-list.component';
import { NoContractApproveViewComponent } from './no-contract-approve-manage/approve-pay/no-contract-approve-view/no-contract-approve-view.component';


const routes: Routes = [
  // 合约支付列表（草稿、进行中、提交审批通过（未通过））
  { path: 'contract/apply/draft', component: ApproveNotStartedComponent },
  { path: 'contract/apply/in_progress', component: MyApplyForInprogressComponent },
  { path: 'contract/apply/pass', component: MyApplyForPassComponent },
  { path: 'contract/apply/refuse', component: MyApplyForRefuseComponent },
  // 合约支付流程申请  创建/编辑/提交
  { path: 'contract/apply/pay/:id', component: ProjectContractListComponent, data: { title: '项目合约支付列表' } },
  { path: 'contract/apply/pay/create/:id', component: ContractPayCreateComponent, data: { title: '创建合约支付' } },
  { path: 'contract/apply/pay/edit/:id', component: ContractPayCreateComponent, data: { title: '编辑合约支付' } },
  
  // 支付审批（该我审批、待我审批、审批完成）列表
  { path: 'contract/pay/progress', component: InApproveProjectComponent },
  { path: 'contract/pay/forApproval', component: ForApprovalListComponent },
  { path: 'contract/pay/finished', component: FinishedApproveProjectComponent },
  { path: 'contract/pay/without-pass', component: WithoutApprovalListComponent },
  // 查看合约支付信息  及 流程处理
  { path: 'contract/pay/view/:id', component: ApplyContractViewComponent, data: { title: '合约支付详情查看' } },
    
  // 项目信息查看
  { path: 'contract/view/:id', component: ViewApproveProjectComponent, data: { title: '项目审批详情' } },
  
  { path: 'no-contract/view/:id', component: ViewApproveProjectComponent, data: { title: '项目审批详情' } },
  
  // 无合约  支付申请管理
  { path: 'no-contract/apply/draft', component: NoContractNotStartedComponent },
  { path: 'no-contract/apply/in_progress', component: NoContractProjectProgressComponent },
  { path: 'no-contract/apply/pass', component: NoContractApplyPassComponent },
  { path: 'no-contract/apply/refuse', component: NoContractApplyRefuseComponent },
  { path: 'no-contract/apply/pay/:id', component: ProjectNoContractListComponent, data: { title: '非合约项目支付列表' } },
  { path: 'no-contract/apply/pay/create/:id', component: NoContractPayCreateComponent, data: { title: '创建非合约非合约支付' } },
  { path: 'no-contract/apply/pay/edit/:id', component: NoContractPayCreateComponent, data: { title: '编辑非合约非合约支付' } },

  // 无合约 支付审批管理
  { path: 'no-contract/pay/progress', component: NoContractApproveListComponent },
  { path: 'no-contract/pay/forApproval', component: NoContractForApproveListComponent },
  { path: 'no-contract/pay/finished', component: NoContractApprovedFinishedListComponent },
  { path: 'no-contract/pay/without-pass', component: NoContractApprovedWithoutListComponent },

  // 协议审批  信息查看
  { path: 'no-contract/pay/view/:id', component: NoContractApproveViewComponent, data: { title: '非合约支付详情查看' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentApproveRoutingModule { }
