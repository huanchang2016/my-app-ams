import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PositionsRoutingModule } from './positions-routing.module';
import { PositionListComponent } from './list/list.component';
import { PositionSearchOptionComponent } from './list/search-option/search-option.component';
import { PositionFormComponent } from './list/position-form/position-form.component';

const COMPONENTS = [
  PositionListComponent
];
const COMPONENTS_NOROUNT = [
  PositionSearchOptionComponent,
  PositionFormComponent
];

@NgModule({
  imports: [
    SharedModule,
    PositionsRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class PositionsModule { }
