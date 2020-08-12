import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// delon
import { AlainThemeModule } from '@delon/theme';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';


import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

// #region third libs
import { CountdownModule } from 'ngx-countdown';
import { DragDropModule } from '@angular/cdk/drag-drop';

const THIRDMODULES = [
  CountdownModule,
  DragDropModule
];
// #endregion

// #region your componets & directives
import { CascaderAreaComponent } from './component/cascader-area/cascader-area.component';
import { UploadImageBase64Component } from './component/upload-image-base64/upload-image-base64.component';
import { RangeDatepickerComponent } from './component/range-datepicker/range-datepicker.component';
import { ShowTextareaContentPipe } from './pipe/show-textarea-content.pipe';
import { UploadFileComponent } from './component/upload-file-modal/upload-file.component';
import { UploadFileTplComponent } from './component/upload-file-modal/upload-file-tpl/upload-file-tpl.component';
import { UploadFileAttachmentShowCComponent } from './component/upload-file-attachment-show-c/upload-file-attachment-show-c.component';
import { CustomerCompanyShowListCComponent } from './component/customer-company-show-list-c/customer-company-show-list-c.component';
import { UsersExecuteFlowComponent } from './component/users-execute-flow/users-execute-flow.component';
import { UploadFileAttachmentTplComponent } from './component/upload-file-attachment-tpl/upload-file-attachment-tpl.component';
import { ProjectInfoShowTplComponent } from './component/project-info-show-tpl/project-info-show-tpl.component';
import { UsersBillExecuteFlowComponent } from './component/users-bill-execute-flow/users-bill-execute-flow.component';
import { PaymentTaxManageComponent } from './component/payment-tax-manage/payment-tax-manage.component';

const COMPONENTS = [
  CascaderAreaComponent,
  UploadImageBase64Component,
  RangeDatepickerComponent,
  UploadFileComponent,
  UploadFileTplComponent,
  UploadFileAttachmentTplComponent,
  UploadFileAttachmentShowCComponent,
  CustomerCompanyShowListCComponent,
  UsersExecuteFlowComponent,
  ProjectInfoShowTplComponent,
  UsersBillExecuteFlowComponent,
  PaymentTaxManageComponent
];

const DIRECTIVES = [
    ShowTextareaContentPipe
  ];
// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonACLModule,
    DelonFormModule,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonACLModule,
    DelonFormModule,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES
  ]
})
export class SharedModule { }
