import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DepartmentRoutingModule } from './department-routing.module';
import { DepartmentListComponent } from './list/list.component';
import { DepartmentListSearchOptionComponent } from './list/search-option/search-option.component';
import { DepartmentCategoryComponent } from './category/category.component';
import { DepartmentCategorySearchOptionComponent } from './category/search-option/search-option.component';
import { DepartmentFormComponent } from './list/department-form/department-form.component';
import { DepartmentCategoryFormComponent } from './category/department-category-form/department-category-form.component';
import { ProjectCategoryComponent } from './project-category/project-category.component';
import { SearchOptionComponent } from './project-category/search-option/search-option.component';
import { ProjectCategoryFormComponent } from './project-category/project-category-form/project-category-form.component';

const COMPONENTS = [
  DepartmentListComponent,
  DepartmentCategoryComponent,
  ProjectCategoryComponent
];
const COMPONENTS_NOROUNT = [
  // 部门列表
  DepartmentListSearchOptionComponent,
  DepartmentFormComponent,
  // 部门类型
  DepartmentCategorySearchOptionComponent,
  DepartmentCategoryFormComponent,
  // 部门 相应的  项目类型
  SearchOptionComponent,
  ProjectCategoryFormComponent
];

@NgModule({
  imports: [
    SharedModule,
    DepartmentRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class DepartmentModule { }
