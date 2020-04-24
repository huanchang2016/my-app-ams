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
import { QrAuthComponent } from './passport/qr-auth/qr-auth.component';

// single pages
import { CallbackComponent } from './callback/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';

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
      { path: 'project', loadChildren: () => import('./project/project.module').then( m => m.ProjecttModule ) },
      { path: 'pro-settings', loadChildren: () => import('./project-settings/project-settings.module').then( m => m.ProjectSettingsModule ) },
      // 支付审批管理
      { path: 'approve', loadChildren: () => import('./payment-approve/payment-approve.module').then( m => m.PaymentApproveModule ) },
      // 账务管理 （发票、账务处理）
      { path: 'bill', loadChildren: () => import('./bill-reminder/bill-reminder.module').then( m => m.BillReminderModule ) },
      // 项目流程管理
      { path: 'workflow', loadChildren: () => import('./workflow/workflow.module').then( m => m.WorkflowModule ) },
      // 基础配置
      { path: 'company', loadChildren: () => import('./settings/company/company.module').then(m => m.CompanyModule) },
      { path: 'department', loadChildren: () => import('./settings/department/department.module').then(m => m.DepartmentModule) },
      { path: 'position', loadChildren: () => import('./settings/positions/positions.module').then(m => m.PositionsModule) },
      // 权限配置
      { path: 'authority', loadChildren: () => import('./authority/authority.module').then(m => m.AuthorityModule) },
      // 用户管理
      { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) }
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
      { path: 'auth', component: QrAuthComponent, data: { title: '扫码登录' } }
      // { path: 'register', component: UserRegisterComponent, data: { title: '注册', titleI18n: 'pro-register' } },
      // { path: 'register-result', component: UserRegisterResultComponent, data: { title: '注册结果', titleI18n: 'pro-register-result' } },
      // { path: 'lock', component: UserLockComponent, data: { title: '锁屏', titleI18n: 'lock' } },
    ]
  },
  // 单页不包裹Layout
  { path: 'callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' },
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
