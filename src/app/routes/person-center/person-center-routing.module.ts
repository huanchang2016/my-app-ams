import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PersonCenterEditPasswordComponent } from './edit-password/edit-password.component';

const routes: Routes = [

  { path: 'edit-password', component: PersonCenterEditPasswordComponent, data: { title: '更新密码' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonCenterRoutingModule { }
