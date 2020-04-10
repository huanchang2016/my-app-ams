import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorityComponent } from './auth-settings/authority.component';
import { UsersManageComponent } from './users/users.component';

const routes: Routes = [
  { path: 'home', component: AuthorityComponent },
  { path: 'users', component: UsersManageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityRoutingModule { }
