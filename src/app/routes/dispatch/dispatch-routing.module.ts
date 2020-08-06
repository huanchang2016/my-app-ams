import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { DispatchCreateComponent } from './dispatch-create/dispatch-create.component'
// import { DispathIndexComponent } from './dispath-index/dispath-index.component'


const routes: Routes = [
  // { path: '', component: DispathIndexComponent },
  // { path: '', redirectTo: 'dispatch/index', component: DispathIndexComponent },
  // { path: '', component: DispathIndexComponent },
  // { path: 'dispatch/create', component: DispatchCreateComponent },
  // { path: 'dispatch/index', component: DispathIndexComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchRoutingModule { }
