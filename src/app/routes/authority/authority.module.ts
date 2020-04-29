import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AuthorityRoutingModule } from './authority-routing.module';
import { AuthorityRolesComponent } from './roles/list/roles.component';
import { RolesSearchCComponent } from './roles/component/roles-search-c/roles-search-c.component';
import { RolesFormComponent } from './roles/component/roles-form/roles-form.component';
import { RolesUserFormComponent } from './roles/component/roles-user-form/roles-user-form.component';
import { RolesPermissionFormComponent } from './roles/component/roles-permission-form/roles-permission-form.component';

const COMPONENTS = [
  AuthorityRolesComponent
];
const COMPONENTS_NOROUNT = [
  RolesSearchCComponent,
  RolesFormComponent,
  RolesUserFormComponent,
  RolesPermissionFormComponent,
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
