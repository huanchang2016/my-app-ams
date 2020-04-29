import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorityRolesComponent } from './roles/list/roles.component';
import { ACLGuard, ACLType } from '@delon/acl';

const routes: Routes = [
  { path: 'roles', component: AuthorityRolesComponent,
    canActivate: [ACLGuard],
    data: {
      guard: <ACLType>{
        ability: ['permission_list']
      }
    }
  }
];
  
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityRoutingModule { }
