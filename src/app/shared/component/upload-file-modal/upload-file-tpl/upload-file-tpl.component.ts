import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';

@Component({
  selector: 'app-upload-file-tpl',
  templateUrl: './upload-file-tpl.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFileTplComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UploadFileTplComponent),
      multi: true
    }
  ]
})
export class UploadFileTplComponent implements ControlValueAccessor {

  private propagateChange = (_: any) => { };
  
  fileList:UploadFile[] = [];

  @Input() isMultiple?:boolean = false;

  constructor(
    private msg: NzMessageService
  ) {
    
  }

  writeValue(obj: any): void {
    this.fileList = [];
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  validate(control: AbstractControl): ValidationErrors | null {
    if(control.errors && control.errors.required) {
      return this.fileList && this.fileList.length !== 0 ? null : {
        isInvalid: {
          valid: false
        }
      }
    }else {
      return null;
    }
  }

  beforeUpload = (file: File, fileList: UploadFile[]) => {
    // console.log(file, fileList);
    this.fileList = fileList;
      // const isLt2M = file.size / 1024 / 1024 < 1;
      // if (!isLt2M) {
      //   this.msg.error('图片内容小于1M!');
      //   return;
      // }

      // if(isImage && isLt2M) {
      //   this.getBase64(file, (img: string) => {
      //     this.photoBase64 = img;

      //     this.propagateChange(this.photoBase64)
      //   });
      // }
      // this.fileList = ['1111', '2222']
      this.propagateChange(this.fileList);
      return false;
  };

  // deletedFile(index:number) :void {
  //   this.fileList.splice(index, 1);
  // }

  
  // customeRequest = (item:any) : Subscription => {
  //   console.log(item);
  //   return this.http.post('/sdfa', {}).subscribe(
  //     res => {
  //       console.log(res);
  //     },
  //     err => console.log(err),
  //     () => console.log(' upload complete!')
  //   )
  // }
}
