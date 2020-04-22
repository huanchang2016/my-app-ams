import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { UsersRoutingModule } from './users-routing.module';

import { UsersManageComponent } from './user-list/users.component';
import { UserFormsComponent } from './user-forms/user-forms.component';
import { UserSearchOptionComponent } from './user-search-option/user-search-option.component';

const COMPONENTS = [
  UsersManageComponent
];
const COMPONENTS_NOROUNT = [
  UserFormsComponent,
  UserSearchOptionComponent
];

@NgModule({
  imports: [
    SharedModule,
    UsersRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class UsersModule { }
