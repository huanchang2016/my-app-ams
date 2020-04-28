import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// delon
import { AlainThemeModule } from '@delon/theme';
import { DelonABCModule } from '@delon/abc';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';

// #region third libs
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CountdownModule } from 'ngx-countdown';
import { DragDropModule } from '@angular/cdk/drag-drop';
const THIRDMODULES = [
  NgZorroAntdModule,
  CountdownModule,
  DragDropModule
];
// #endregion

// #region your componets & directives
import { CascaderAreaComponent } from './component/cascader-area/cascader-area.component';
import { UploadImageBase64Component } from './component/upload-image-base64/upload-image-base64.component';
import { RangeDatepickerComponent } from './component/range-datepicker/range-datepicker.component';
import { ShowTextareaContentPipe } from './pipe/show-textarea-content.pipe';
import { WebSocketService } from './socket/web-socket.service';

const COMPONENTS = [
  CascaderAreaComponent,
  UploadImageBase64Component,
  RangeDatepickerComponent
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
    DelonABCModule,
    DelonACLModule,
    DelonFormModule,
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
    DelonABCModule,
    DelonACLModule,
    DelonFormModule,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES
  ],
  providers: [
    WebSocketService
  ]
})
export class SharedModule { }
