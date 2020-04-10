import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { environment } from '@env/environment';

@Component({
  selector: 'app-upload-image-base64',
  templateUrl: './upload-image-base64.component.html',
  styles: [`
    .avatar {
      width: 100%;
      min-width: 128px;
      max-height: 128px;
    }
    .upload-icon {
      font-size: 32px;
      color: #999;
    }
    .ant-upload-text {
      margin-top: 8px;
      color: #666;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadImageBase64Component),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UploadImageBase64Component),
      multi: true
    }
  ]
})
export class UploadImageBase64Component implements ControlValueAccessor {

  private propagateChange = (_: any) => { };
  
  photoBase64:string;

  constructor(
    private msg: NzMessageService
  ) {
    
  }

  writeValue(obj: any): void {
    this.photoBase64 = obj ? environment.SERVER_URL + obj : null;
    
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  validate(control: AbstractControl): ValidationErrors | null {
    if(control.errors && control.errors.required) {
      return this.photoBase64 ? null : {
        natureInvalid: {
          valid: false
        }
      }
    }else {
      return null;
    }
  }

  beforeUpload = (file: File) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isImage) {
        this.msg.error('只允许上传JPG、PNG格式的图片!');
        return;
      }
      const isLt2M = file.size / 1024 / 1024 < 1;
      if (!isLt2M) {
        this.msg.error('图片内容小于1M!');
        return;
      }

      if(isImage && isLt2M) {
        this.getBase64(file, (img: string) => {
          this.photoBase64 = img;

          this.propagateChange(this.photoBase64)
        });
      }
      
      return false;
  };

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  private checkImageDimension(file: File): Promise<boolean> {
    // 检查图片的宽高：像素
    return new Promise(resolve => {
      const img = new Image(); // create image
      img.src = window.URL.createObjectURL(file);
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        window.URL.revokeObjectURL(img.src!);
        // resolve(width === height && width >= 300);
        resolve(width >= height);
      };
    });
  }
}
