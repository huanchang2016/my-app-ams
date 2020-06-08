import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentListComponent } from './list/list.component';
import { DepartmentCategoryComponent } from './category/category.component';
import { ProjectCategoryComponent } from './project-category/project-category.component';

import { ACLGuard, ACLType } from '@delon/acl';
import { CategorySubjectComponent } from './category-subject/category-subject.component';

const routes: Routes = [
  { path: 'list', component: DepartmentListComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['department_list']
      }
    }
  },
  { path: 'category', component: DepartmentCategoryComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['department_category_list']
      }
    }
  },
  { path: 'project-category', component: ProjectCategoryComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['project_category_list']
      }
    }
  },
  { path: 'category-subject', component: CategorySubjectComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['project_category_list']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentRoutingModule { }
