import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PositionListComponent } from './list/list.component';

import { ACLGuard, ACLType } from '@delon/acl';

const routes: Routes = [
  { path: 'list', component: PositionListComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['position_list']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionsRoutingModule { }
