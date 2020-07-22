import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchCreateComponent } from './dispatch-create/dispatch-create.component'


const routes: Routes = [
  { path: 'list', component: DispatchCreateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchRoutingModule { }
