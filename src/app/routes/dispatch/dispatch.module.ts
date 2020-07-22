import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispatchRoutingModule } from './dispatch-routing.module';
import { DispatchCreateComponent } from './dispatch-create/dispatch-create.component';


@NgModule({
  declarations: [DispatchCreateComponent],
  imports: [
    CommonModule,
    DispatchRoutingModule
  ]
})
export class DispatchModule { }
