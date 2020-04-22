import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersManageComponent } from './user-list/users.component';

const routes: Routes = [
  { path: 'list', component: UsersManageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
