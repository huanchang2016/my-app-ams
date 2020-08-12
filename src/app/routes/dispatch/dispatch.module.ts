import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { CommonModule } from '@angular/common';

import { DispatchRoutingModule } from './dispatch-routing.module';
import { DispatchCreateComponent } from './dispatch-create/dispatch-create.component';
import { DispathIndexComponent } from './dispath-index/dispath-index.component';
import { DraftListComponent } from './my-dispatch/draft-list/draft-list.component';
import { DispatchSearchComponent } from './component/dispatch-search/dispatch-search.component';
import { DispatchInfoComponent } from './component/dispatch-info/dispatch-info.component';
// import { ProductSearchOptionComponent } from './component/search-option/search-option.component';
// import { ProductSearchOptionComponent } from '../project/component/search-option/search-option.component';

const COMPONENTS = [
  DispatchCreateComponent,
  DispathIndexComponent,
  DraftListComponent,
  DispatchSearchComponent,
  DispatchInfoComponent,];


@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    // ProductSearchOptionComponent,
    SharedModule,
    CommonModule,
    DispatchRoutingModule
  ]
})
export class DispatchModule { }
