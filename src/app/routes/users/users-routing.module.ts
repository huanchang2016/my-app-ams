import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersManageComponent } from './user-list/users.component';

import { ACLGuard, ACLType } from '@delon/acl';

const routes: Routes = [
  { path: 'list', component: UsersManageComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['user_list']
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
