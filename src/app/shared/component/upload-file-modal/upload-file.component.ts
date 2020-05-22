import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription, from, Observable } from 'rxjs';
import { _HttpClient } from '@delon/theme';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { environment } from '@env/environment';


@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
})
export class UploadFileComponent implements OnChanges, OnInit, OnDestroy {

  fileTypeArray:List[] = []; // 附件类型 配置项

  environment = environment;

  @Input() Attachment:any[];
  @Input() AttachmentCategory:List[];
  @Input() isAttachmentChange:boolean;

  @Output() attachmentChange:EventEmitter<any> = new EventEmitter();

  attachmentArray:any[] = [];

  validateForm: FormGroup;
  isVisible = false;
  isConfirmLoading = false;
  fileList:any[] = [];
  
  getCategoryListFn$: Observable<ApiData>;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingsService: SettingsConfigService
  ) { }

  ngOnChanges(changes:SimpleChanges) {
    // console.log(changes);
    if(this.AttachmentCategory || this.Attachment) {
      console.log(this.AttachmentCategory, this.Attachment)
      // 过滤处理 附件，将附件根据类型不同来分类展示
      this.selectAttachment();
    }
  }

  ngOnInit(): void {
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
    this.submitForm();
    // 调用上传文件接口。
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isConfirmLoading = false;
    this.validateForm.reset();
  }


  uploadAttachment$:Subscription;
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log(this.validateForm.value);

    if(this.validateForm.valid) {
      this.isConfirmLoading = true;
      const fileOption = new FormData();
      const object = this.validateForm.value;
      
      fileOption.append('name', object.file_name);
      fileOption.append('category_id', object.file_type);
      fileOption.append('attachment', object.file[0]);
      
      this.uploadAttachment$ = this.settingsService.post('/api/attachment/create', fileOption).subscribe( (res:ApiData) => {
        console.log(res);
        if(res.code === 200) {
          this.attachmentChange.emit(res.data.attachment);
          this.handleCancel();
        }
      })
    }
  }

  deletedAttachment(id:number, category_id:number) {
    this.settingsService.post('/api/attachment/delete', { attachment_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        // this.msg.success('附件删除成功');
        this.attachmentArray = this.attachmentArray.map(v => {
          if(v.id === category_id) {
            const members = v.members.filter(item => item.id !== id);
            v.members = members;
          }
          return v.members.length !== 0 ? v : null;
        }).filter( v => v);
        // console.log(this.attachmentArray);
      }else {
        this.msg.error(res.error || '附件删除失败');
      }
    })
  }

  cancel():void { }

  selectAttachment() {
    this.attachmentArray = [];
    
      // 将所有附件 根据分类 分别放置到 对应的类别下面。
      this.AttachmentCategory.forEach( category => {
        const currentArr = this.Attachment.filter(v => v.attachment_category.id === category.id);
        const option = {
          id: category.id,
          name: category.name,
          members: currentArr
        };
        this.attachmentArray.push(option);
      });
  }

  ngOnDestroy() {
    if(this.uploadAttachment$) this.uploadAttachment$.unsubscribe();
    this.handleCancel();
  }

}
