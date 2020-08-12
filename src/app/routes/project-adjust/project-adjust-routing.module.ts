import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectAdjustListComponent } from './project-adjust-list/project-adjust-list.component';
import { AdjustUpdateComponent } from './adjust-update/adjust-update.component';
import { MyAdjustListComponent } from './my-adjust/my-adjust-list/my-adjust-list.component'
import { ApprovelAdjustListComponent } from './approvel-adjust/approvel-adjust-list/approvel-adjust-list.component'
import { AdjustListListComponent } from './adjust-list/adjust-list-list/adjust-list-list.component'
// 调整后的详情查看
import { AdjustViewCComponent } from './adjust-view-c/adjust-view-c.component';

const routes: Routes = [
    { path: 'my', component: ProjectAdjustListComponent },
    { path: 'update/:id', component: AdjustUpdateComponent }, // 项目调整更新
    { path: 'myAdjust', component: MyAdjustListComponent },
    { path: 'view/:id', component: AdjustViewCComponent }, // 项目调整 预览  及 审批页面  id  为调整 id:  使用项目id project_id
    { path: 'approvel', component: ApprovelAdjustListComponent },
    { path: 'list', component: AdjustListListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectAdjustRoutingModule { }
