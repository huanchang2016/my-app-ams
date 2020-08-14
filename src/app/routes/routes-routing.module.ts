import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutFullScreenComponent } from '../layout/fullscreen/fullscreen.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
// dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { RoutesResetPasswordComponent } from './passport/reset-password/reset-password.component';
import { QrAuthComponent } from './passport/qr-auth/qr-auth.component';
// project
import { ProjectListComponent } from './project/project-list-search/project-list/project-list.component'
import { ProjectMyProjectListComponent } from './project/my-project/list-search/project-my-project-list/project-my-project-list.component'
import { ProjectApprovalListComponent } from './project/approval-project/list-search/project-approval-list/project-approval-list.component'

// single pages
import { CallbackComponent } from './callback/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
import { BillListComponent } from './financial-processing-voucher/bill/bill-list/bill-list.component'
import { MyBillListComponent } from './financial-processing-voucher/bill/my-bill-list/my-bill-list.component'
import { BillApprovalListComponent } from './financial-processing-voucher/bill/bill-approval-list/bill-approval-list.component'
import { BillExcuteListComponent } from './financial-processing-voucher/bill/bill-excute-list/bill-excute-list.component'

// 合约支付列表
import { ApplyListIndexComponent } from './payment-approve/contract-approve-manage/apply-list/apply-list-index/apply-list-index.component'
import { MyApplyListComponent } from './payment-approve/contract-approve-manage/apply-for/my-apply-list/my-apply-list.component'
import { ApproveListComponent } from './payment-approve/contract-approve-manage/apply-for/approve-list/approve-list.component'
import { ApplyExcuteListComponent } from './payment-approve/contract-approve-manage/apply-for/apply-excute-list/apply-excute-list.component'
// 非合约支付列表
import { NoContractApplyListIndexComponent } from './payment-approve/no-contract-approve-manage/apply-list/no-contract-apply-list-index/no-contract-apply-list-index.component'
import { NoMyApplyListComponent } from './payment-approve/no-contract-approve-manage/apply-for/no-contract-list-search/my-apply/no-my-apply-list/no-my-apply-list.component'
import { NoApplyApproveListComponent } from './payment-approve/no-contract-approve-manage/apply-for/no-contract-list-search/apply-approve/no-apply-approve-list/no-apply-approve-list.component'
import { NoApplyExcuteListComponent } from './payment-approve/no-contract-approve-manage/apply-for/no-contract-list-search/apply-excute/no-apply-excute-list/no-apply-excute-list.component'
// 凭证
import { ContractListComponent } from './financial-processing-voucher/contract/contract-list-search/contract-list/contract-list.component'
import { TreatyListComponent } from './financial-processing-voucher/treaty/list-search/treaty-list/treaty-list.component'
import { FinancialBillListComponent } from './financial-processing-voucher/bill/list-search/financial-bill-list/financial-bill-list.component'

const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    canActivate: [SimpleGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { title: '数据中心', titleI18n: '数据中心' } },
      { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
      // 业务子模块
      // { path: 'widgets', loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule) },
      // 新增模块
      // 项目管理
      { path: 'project', loadChildren: () => import('./project/project.module').then(m => m.ProjectModule) },
      { path: 'pro-settings', loadChildren: () => import('./project-settings/project-settings.module').then(m => m.ProjectSettingsModule) },
      { path: 'project/my-project', component: ProjectMyProjectListComponent },
      { path: 'project/approvalList', component: ProjectApprovalListComponent },
      { path: 'project/projectList', component: ProjectListComponent },
      // 项目调整
      { path: 'adjust', loadChildren: () => import('./project-adjust/project-adjust.module').then(m => m.ProjectAdjustModule) },

      // 支付审批管理
      { path: 'approve', loadChildren: () => import('./payment-approve/payment-approve.module').then(m => m.PaymentApproveModule) },
      // 账务管理 （发票、账务处理）
      { path: 'bill', loadChildren: () => import('./bill-reminder/bill-reminder.module').then(m => m.BillReminderModule) },
      { path: 'bill/list', component: BillListComponent },
      { path: 'bill/myBill', component: MyBillListComponent },
      { path: 'bill/approveList', component: BillApprovalListComponent },
      { path: 'bill/excuteList', component: BillExcuteListComponent },
      // 合约 合同管理
      { path: 'contract', loadChildren: () => import('./contract/contract.module').then(m => m.ContractModule) },
      { path: 'approve/contract/list', component: ApplyListIndexComponent },
      { path: 'approve/contract/myApply', component: MyApplyListComponent },
      { path: 'approve/contract/approve', component: ApproveListComponent },
      { path: 'approve/contract/excuteList', component: ApplyExcuteListComponent },
      // 非合约 合同管理
      { path: 'approve/no-contract/applyList', component: NoContractApplyListIndexComponent },
      { path: 'approve/no-contract/myApply', component: NoMyApplyListComponent },
      { path: 'approve/no-contract/excuteList', component: NoApplyApproveListComponent },
      { path: 'approve/no-contract/approve', component: NoApplyExcuteListComponent },
      // 财务处理凭证
      { path: 'financial', loadChildren: () => import('./financial-processing-voucher/financial-processing-voucher.module').then(m => m.FinancialProcessingVoucherModule) },
      { path: 'financial/contractList', component: ContractListComponent },
      { path: 'financial/treatyList', component: TreatyListComponent },
      { path: 'financial/billList', component: FinancialBillListComponent },
      // 项目流程管理
      { path: 'workflow', loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule) },
      // 基础配置
      { path: 'company', loadChildren: () => import('./settings/company/company.module').then(m => m.CompanyModule) },
      { path: 'department', loadChildren: () => import('./settings/department/department.module').then(m => m.DepartmentModule) },
      { path: 'position', loadChildren: () => import('./settings/positions/positions.module').then(m => m.PositionsModule) },
      // 权限配置
      { path: 'authority', loadChildren: () => import('./authority/authority.module').then(m => m.AuthorityModule) },
      // 用户管理
      { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
      // 个人中心
      { path: 'person-center', loadChildren: () => import('./person-center/person-center.module').then(m => m.PersonCenterModule) },
      // 派遣
      { path: 'dispatch', loadChildren: () => import('./dispatch/dispatch.module').then(m => m.DispatchModule) },
      // 报表
      { path: 'report', loadChildren: () => import('./report/report.module').then(m => m.ReportModule) },
      // { path: 'dispatch/create', component: DispatchCreateComponent },
      // { path: 'dispatch/index', component: DispathIndexComponent },
    ]
  },
  // 全屏布局
  // {
  //     path: 'fullscreen',
  //     component: LayoutFullScreenComponent,
  //     children: [
  //     ]
  // },
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: 'login', component: UserLoginComponent, data: { title: '登录' } },
      { path: 'reset', component: RoutesResetPasswordComponent, data: { title: '找回密码' } },
      { path: 'auth', component: QrAuthComponent, data: { title: '扫码登录' } }
      // { path: 'register', component: UserRegisterComponent, data: { title: '注册', titleI18n: 'pro-register' } },
      // { path: 'register-result', component: UserRegisterResultComponent, data: { title: '注册结果', titleI18n: 'pro-register-result' } },
      // { path: 'lock', component: UserLockComponent, data: { title: '锁屏', titleI18n: 'lock' } },
    ]
  },
  // 单页不包裹Layout
  { path: 'callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top',
    }
    )],
  exports: [RouterModule],
})
export class RouteRoutingModule { }
