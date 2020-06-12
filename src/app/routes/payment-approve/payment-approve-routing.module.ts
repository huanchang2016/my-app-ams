import { NoContractExcutePayListComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-pay-list/no-contract-excute-pay-list.component';
import { NoContractApprovePayListComponent } from './no-contract-approve-manage/approve-pay/no-contract-approve-pay-list/no-contract-approve-pay-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

// 无合约执行情况
import { NoContractExcuteNotStartComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-not-start/no-contract-excute-not-start.component';
import { NoContractExcuteFinishedComponent } from './no-contract-approve-manage/excute-pay/no-contract-excute-finished/no-contract-excute-finished.component';
// 合约支付执行情况
import { ContractExcuteNotStartComponent } from './contract-approve-manage/excute-pay/contract-excute-not-start/contract-excute-not-start.component';
import { ContractExcuteFinishedComponent } from './contract-approve-manage/excute-pay/contract-excute-finished/contract-excute-finished.component';


import { ACLGuard, ACLType } from '@delon/acl';

// 路由结构修改
import { ContractApprovePayListComponent } from './contract-approve-manage/approve-pay/contract-approve-pay-list/contract-approve-pay-list.component';
import { ContractApplyForListComponent } from './contract-approve-manage/apply-for/contract-apply-for-list/contract-apply-for-list.component';
import { ExcuteContractPayListComponent } from './contract-approve-manage/excute-pay/excute-contract-pay-list/excute-contract-pay-list.component';
import { NoContractApplyForListComponent } from './no-contract-approve-manage/apply-for/no-contract-apply-for-list/no-contract-apply-for-list.component';

const routes: Routes = [
  // 合约支付列表（草稿、进行中、提交审批通过（未通过））
  // { path: 'contract/apply/draft', component: ApproveNotStartedComponent },
  { path: 'contract/project/list', component: ApproveNotStartedComponent },
  { path: 'contract/apply', component: ContractApplyForListComponent,
    children: [
      { path: '', redirectTo: 'in_progress', pathMatch: 'full' },
      { path: 'in_progress', component: MyApplyForInprogressComponent, data: { title: '审批中' } },
      { path: 'pass', component: MyApplyForPassComponent, data: { title: '已通过' } },
      { path: 'refuse', component: MyApplyForRefuseComponent, data: { title: '未通过' } }
    ],
    data: { title: '合约支付申请管理' }
  },
  // 合约支付流程申请  创建/编辑/提交
  { path: 'contract/apply/pay/:id', component: ProjectContractListComponent, data: { title: '项目合约支付列表' } },
  { path: 'contract/apply/pay/create/:id', component: ContractPayCreateComponent, data: { title: '创建合约支付' } },
  { path: 'contract/apply/pay/edit/:id', component: ContractPayCreateComponent, data: { title: '编辑合约支付' } },
  
  // 支付审批（该我审批、待我审批、审批完成）列表
  { path: 'contract/pay', component: ContractApprovePayListComponent,
    children: [
      { path: '', redirectTo: 'forApproval', pathMatch: 'full' },
      { path: 'forApproval', component: ForApprovalListComponent,
        canActivate: [ACLGuard],
        data: {
          title: '待审批',
          guard: <ACLType>{
            ability: ['contract_pay_approval']
          }
        }
      },
      { path: 'progress', component: InApproveProjectComponent,
        canActivate: [ACLGuard],
        data: {
          title: '我的审批',
          guard: <ACLType>{
            ability: ['contract_pay_approval']
          }
        }
      },
      { path: 'finished', component: FinishedApproveProjectComponent,
        canActivate: [ACLGuard],
        data: {
          title: '已审批',
          guard: <ACLType>{
            ability: ['contract_pay_approval']
          }
        }
      },
      { path: 'without-pass', component: WithoutApprovalListComponent,
        canActivate: [ACLGuard],
        data: {
          title: '未审批未通过',
          guard: <ACLType>{
            ability: ['contract_pay_approval']
          }
        }
      },
    ]
  },
  
  // 合约支付 执行情况
  {
    path: 'contract/excute', component: ExcuteContractPayListComponent,
    children: [
      { path: '', redirectTo: 'my', pathMatch: 'full' },
      { path: 'my', component: ContractExcuteNotStartComponent,
        // canActivate: [ACLGuard],
        // data: {
        //   guard: <ACLType>{
        //     ability: ['contract_pay_approval']
        //   }
        // }
      },
      { path: 'finished', component: ContractExcuteFinishedComponent,
        // canActivate: [ACLGuard],
        // data: {
        //   guard: <ACLType>{
        //     ability: ['contract_pay_approval']
        //   }
        // }
      },
    ]
  },
  
  // 查看合约支付信息  及 流程处理 
  { path: 'contract/pay/view/:id', component: ApplyContractViewComponent, data: { title: '合约支付详情查看' } },
    
  // 无合约  支付申请管理
  { path: 'no-contract/project/list', component: NoContractNotStartedComponent },

  { path: 'no-contract/apply', component: NoContractApplyForListComponent,
    children: [
      { path: '', redirectTo: 'in_progress', pathMatch: 'full' },
      { path: 'in_progress', component: NoContractProjectProgressComponent },
      { path: 'pass', component: NoContractApplyPassComponent },
      { path: 'refuse', component: NoContractApplyRefuseComponent },
    ]
  },
  { path: 'no-contract/apply/pay/:id', component: ProjectNoContractListComponent, data: { title: '非合约项目支付列表' } },
  { path: 'no-contract/apply/pay/create/:id', component: NoContractPayCreateComponent, data: { title: '创建非合约非合约支付' } },
  { path: 'no-contract/apply/pay/edit/:id', component: NoContractPayCreateComponent, data: { title: '编辑非合约非合约支付' } },

  // 无合约 支付审批管理
  { path: 'no-contract/pay', component: NoContractApprovePayListComponent,
    children: [
      { path: '', redirectTo: 'forApproval', pathMatch: 'full' },
      {
        path: 'forApproval', component: NoContractForApproveListComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['treaty_pay_approval']
          }
        }
      },
      {
        path: 'finished', component: NoContractApprovedFinishedListComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['treaty_pay_approval']
          }
        }
      },
      {
        path: 'progress', component: NoContractApproveListComponent,
        canActivate: [ACLGuard],
        data: {
          title: '我的审批',
          guard: <ACLType>{
            ability: ['treaty_pay_approval']
          }
        }
      },
      {
        path: 'without-pass', component: NoContractApprovedWithoutListComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['treaty_pay_approval']
          }
        }
      },
    ]
  },
  
  // 无合约执行情况
  { path: 'no-contract/excute', component: NoContractExcutePayListComponent,
    children: [
      { path: '', redirectTo: 'my', pathMatch: 'full' },
      { path: 'my', component: NoContractExcuteNotStartComponent,
      // canActivate: [ACLGuard],
      // data: {
      //   guard: <ACLType>{
      //     ability: ['contract_pay_approval']
      //   }
      // }
    },
    { path: 'finished', component: NoContractExcuteFinishedComponent,
      // canActivate: [ACLGuard],
      // data: {
      //   guard: <ACLType>{
      //     ability: ['contract_pay_approval']
      //   }
      // }
    },
    ]
  },
  

  // 协议审批  信息查看
  { path: 'no-contract/pay/view/:id', component: NoContractApproveViewComponent, data: { title: '非合约支付详情查看' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentApproveRoutingModule { }
