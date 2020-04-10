import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PositionListComponent } from './list/list.component';

const routes: Routes = [
  { path: 'list', component: PositionListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionsRoutingModule { }
