import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DraftListComponent } from './draft-list/draft-list.component';
import { ProgressListComponent } from './progress-list/progress-list.component';
import { FinishedListComponent } from './finished-list/finished-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { RefuseProjectListComponent } from './refuse-project-list/refuse-project-list.component';
import { MyInApprovalListComponent } from './my-in-approval-list/my-in-approval-list.component';
import { MyApprovaledListComponent } from './my-approvaled-list/my-approvaled-list.component';
import { MyForApprovaledListComponent } from './my-for-approvaled-list/my-for-approvaled-list.component';

const routes: Routes = [
  { path: 'my/draft', component: DraftListComponent, data: { title: '项目草稿'} },
  { path: 'my/progress', component: ProgressListComponent, data: { title: '进行中的项目'} },
  { path: 'my/refuse', component: RefuseProjectListComponent, data: { title: '未通过的项目'} },
  { path: 'my/finished', component: FinishedListComponent, data: { title: '提交通过的项目'} },
  { path: 'approve', component: MyInApprovalListComponent, data: { title: '该我审批的项目'} },
  { path: 'forApproved', component: MyForApprovaledListComponent, data: { title: '待审批项目（我的）'} },
  { path: 'approved', component: MyApprovaledListComponent, data: { title: '已审批的项目'} },
  { path: 'create', component: ProjectCreateComponent, data: { title: '创建项目'} },
  { path: 'edit/:id', component: ProjectCreateComponent, data: { title: '编辑项目信息'} },
  { path: 'view/:id', component: ProjectViewComponent, data: { title: '预览项目信息'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
