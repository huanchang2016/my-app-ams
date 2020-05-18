import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadChangeParam } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal'
import { Subscription, from, Observable } from 'rxjs';
import { _HttpClient } from '@delon/theme';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { filter, map } from 'rxjs/operators';

const FILETYPE:List[] = [
  { id: 1, name: '会议纪要' },
  { id: 2, name: '合同附件' },
  { id: 3, name: '补充说明' }
];


@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
})
export class UploadFileComponent implements OnInit, OnDestroy {

  fileTypeArray:List[] = []; // 附件类型 配置项

  @Input() attachment_category:string;

  @Output() attachmentChange:EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup;
  isVisible = false;
  isConfirmLoading = false;
  fileList:any[] = [];
  
  getCategoryListFn$: Observable<ApiData>;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingsService: SettingsConfigService
  ) {
    this.fileTypeArray = FILETYPE;
  }

  ngOnInit(): void {
    const opt:any = {
      is_project: this.attachment_category === 'is_project',
      is_contract: this.attachment_category === 'is_contract',
      is_pay: this.attachment_category === 'is_pay',
      is_bill: this.attachment_category === 'is_bill'
    };
    this.getCategoryListFn$ = this.settingsService.post('/api/attachment/category/list', opt);

    this.getCategoryList();

    this.validateForm = this.fb.group({
      file_name: [null, [Validators.required]],
      file_type: [null, [Validators.required]],
      file: [null, [Validators.required]]
    });
  }



  showModal1(ev:Event):void {
    ev.preventDefault();
    ev.stopPropagation();
    this.isVisible = true;
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    this.submitForm();
    // 调用上传文件接口。
  }

  handleCancel(): void {
    this.isVisible = false;
  }


  uploadAttachment$:Subscription;
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log(this.validateForm.value);

    if(this.validateForm.valid) {
      const fileOption = new FormData();
      const object = this.validateForm.value;
      
      fileOption.append('name', object.file_name);
      fileOption.append('category_id', object.file_type);
      console.log(object.file[0])
      fileOption.append('attachment', object.file[0]);
      
      this.uploadAttachment$ = this.settingsService.post('/api/attachment/create', fileOption).subscribe( (res:ApiData) => {
        console.log(res);
        if(res.code === 200) {
          this.attachmentChange.emit({ attachment: res.data.attachment });
          this.isVisible = false;
          this.isConfirmLoading = false;
        }
      })
    }
  }

  
  categoryData$: Subscription;

  getCategoryList() {
    this.categoryData$ = this.getCategoryListFn$.pipe(
      filter(res => res.code === 200),
      map(d => d.data.attachment_category)
    ).subscribe(
      data => this.fileTypeArray = data.map( v => {
        return { id: v.id, name: v.name }
      })
    )
  }

  ngOnDestroy() {
    this.categoryData$.unsubscribe();
    this.uploadAttachment$.unsubscribe();
    this.isVisible = false;
    this.isConfirmLoading = false;
  }

}
