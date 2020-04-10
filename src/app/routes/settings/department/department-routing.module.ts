import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentListComponent } from './list/list.component';
import { DepartmentCategoryComponent } from './category/category.component';
import { ProjectCategoryComponent } from './project-category/project-category.component';

const routes: Routes = [
  { path: 'list', component: DepartmentListComponent },
  { path: 'category', component: DepartmentCategoryComponent },
  { path: 'project-category', component: ProjectCategoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentRoutingModule { }
