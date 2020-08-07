import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ProjectAdjustRoutingModule } from './project-adjust-routing.module';
import { ProjectAdjustListComponent } from './project-adjust-list/project-adjust-list.component';
import { ProjectAdjustSearchComponent } from './project-adjust-search/project-adjust-search.component';


@NgModule({
  declarations: [ProjectAdjustListComponent, ProjectAdjustSearchComponent],
  imports: [
    SharedModule,
    ProjectAdjustRoutingModule
  ]
})
export class ProjectAdjustModule { }
