import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PersonCenterRoutingModule } from './person-center-routing.module';
import { PersonCenterEditPasswordComponent } from './edit-password/edit-password.component';

const COMPONENTS = [
  PersonCenterEditPasswordComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    PersonCenterRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class PersonCenterModule { }
