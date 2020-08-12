import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchCreateComponent } from './dispatch-create/dispatch-create.component'
import { DispathIndexComponent } from './dispath-index/dispath-index.component'


const routes: Routes = [
  { path: 'create', component: DispatchCreateComponent },
  { path: 'index', component: DispathIndexComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchRoutingModule { }
