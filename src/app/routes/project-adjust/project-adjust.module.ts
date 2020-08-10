import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ProjectAdjustRoutingModule } from './project-adjust-routing.module';
import { ProjectAdjustListComponent } from './project-adjust-list/project-adjust-list.component';
import { ProjectAdjustSearchComponent } from './project-adjust-search/project-adjust-search.component';
import { AdjustListListComponent } from './adjust-list/adjust-list-list/adjust-list-list.component';
import { AdjustListSearchComponent } from './adjust-list/adjust-list-search/adjust-list-search.component';
import { MyAdjustListComponent } from './my-adjust/my-adjust-list/my-adjust-list.component';
import { MyAdjustSearchComponent } from './my-adjust/my-adjust-search/my-adjust-search.component';
import { ApprovelAdjustListComponent } from './approvel-adjust/approvel-adjust-list/approvel-adjust-list.component';
import { ApprovelAdjustSearchComponent } from './approvel-adjust/approvel-adjust-search/approvel-adjust-search.component';


@NgModule({
  declarations: [ProjectAdjustListComponent, ProjectAdjustSearchComponent, AdjustListListComponent, AdjustListSearchComponent, MyAdjustListComponent, MyAdjustSearchComponent, ApprovelAdjustListComponent, ApprovelAdjustSearchComponent],
  imports: [
    SharedModule,
    ProjectAdjustRoutingModule
  ]
})
export class ProjectAdjustModule { }
