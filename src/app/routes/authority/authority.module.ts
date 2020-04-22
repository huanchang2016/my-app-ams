import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AuthorityRoutingModule } from './authority-routing.module';
import { AuthorityComponent } from './auth-settings/authority.component';
import { AuthorityRolesComponent } from './roles/roles.component';
import { RolesSearchCComponent } from './roles/roles-search-c/roles-search-c.component';
import { RolesFormComponent } from './roles/roles-form/roles-form.component';

const COMPONENTS = [
  AuthorityComponent,
  AuthorityRolesComponent
];
const COMPONENTS_NOROUNT = [
  RolesSearchCComponent,
  RolesFormComponent,
  
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
