import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectAdjustListComponent } from './project-adjust-list/project-adjust-list.component';
import { AdjustUpdateComponent } from './adjust-update/adjust-update.component';


const routes: Routes = [
    { path: 'my', component: ProjectAdjustListComponent },
    { path: 'update/:id', component: AdjustUpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectAdjustRoutingModule { }
