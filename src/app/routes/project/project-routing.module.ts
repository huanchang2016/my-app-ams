import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DraftListComponent } from './my-project/draft-list/draft-list.component';
import { ProgressListComponent } from './my-project/progress-list/progress-list.component';
import { FinishedListComponent } from './my-project/finished-list/finished-list.component';
import { RefuseProjectListComponent } from './my-project/refuse-project-list/refuse-project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { MyInApprovalListComponent } from './approval-project/my-in-approval-list/my-in-approval-list.component';
import { MyApprovaledListComponent } from './approval-project/my-approvaled-list/my-approvaled-list.component';
import { MyForApprovaledListComponent } from './approval-project/my-for-approvaled-list/my-for-approvaled-list.component';

import { ACLGuard, ACLType } from '@delon/acl';
import { ProjectAdjustComponent } from './project-adjust/project-adjust.component';

const routes: Routes = [
  { path: 'my/draft', component: DraftListComponent, data: { title: '项目草稿'} },
  { path: 'my/progress', component: ProgressListComponent, data: { title: '进行中的项目'} },
  { path: 'my/refuse', component: RefuseProjectListComponent, data: { title: '未通过的项目'} },
  { path: 'my/finished', component: FinishedListComponent, data: { title: '提交通过的项目'} },
  { path: 'approve', component: MyInApprovalListComponent,
    canActivate: [ACLGuard],
    data: {
      title: '该我审批的项目',
      guard: <ACLType>{
        ability: ['project_approval']
      }
    }
   },
  { path: 'forApproved', component: MyForApprovaledListComponent,
    canActivate: [ACLGuard],
    data: {
      title: '待审批项目（我的）',
      guard: <ACLType>{
        ability: ['project_approval']
      }
    }
  },
  { path: 'approved', component: MyApprovaledListComponent,
    canActivate: [ACLGuard],
    data: {
      title: '已审批的项目',
      guard: <ACLType>{
        ability: ['project_approval']
      }
    }
  },
  { path: 'create', component: ProjectCreateComponent, data: { title: '创建项目'} },
  { path: 'edit/:id', component: ProjectCreateComponent, data: { title: '编辑项目信息'} },
  { path: 'view/:id', component: ProjectViewComponent, data: { title: '预览项目信息'} },
  // { path: 'adjust/:id', component: ProjectAdjustComponent, data: { title: '调整项目信息'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
