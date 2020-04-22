import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorityComponent } from './auth-settings/authority.component';
import { AuthorityRolesComponent } from './roles/roles.component';

const routes: Routes = [
  { path: 'home', component: AuthorityComponent }
  // { path: 'users', component: UsersManageComponent }
,
  { path: 'roles', component: AuthorityRolesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityRoutingModule { }
