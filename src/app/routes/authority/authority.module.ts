import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AuthorityRoutingModule } from './authority-routing.module';
import { AuthorityComponent } from './auth-settings/authority.component';
import { UsersManageComponent } from './users/users.component';
import { UserFormsComponent } from './users/user-forms/user-forms.component';
import { UserSearchOptionComponent } from './users/user-search-option/user-search-option.component';

const COMPONENTS = [
  AuthorityComponent,
  UsersManageComponent
];
const COMPONENTS_NOROUNT = [
  UserFormsComponent,
  UserSearchOptionComponent
];

@NgModule({
  imports: [
    SharedModule,
    AuthorityRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class AuthorityModule { }
