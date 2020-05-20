import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { environment } from '@env/environment';

@Component({
  selector: 'app-upload-file-attachment-show-c',
  templateUrl: './upload-file-attachment-show-c.component.html',
  styles: []
})
export class UploadFileAttachmentShowCComponent implements OnInit {

  environment = environment;
  attachment:any[] = [];

  @Input() attachmentUrl:string;

  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit(): void {
    this.getAttachment(this.attachmentUrl);
  }

  getAttachment(url:string) {
    this.settingsConfigService.get(url).subscribe((res:ApiData) => {
      console.log('项目 基础附件   附件展示：', res);
      if(res.code === 200) {
        this.dealAttachment(res.data.attachment);
      }
    })
  }

  dealAttachment(attachmentArr:any[]) {
    const attachmentCategoryArray:any[] = attachmentArr.reduce( (all:any[], next:any) => {
      all.some((item:any) => item.id === next.attachment_category.id) ? all : all.push(next.attachment_category);
      return all;
    }, [] );
    console.log(attachmentCategoryArray);
    this.attachment = [];
    // 将所有附件 根据分类 分别放置到 对应的类别下面。
    attachmentCategoryArray.sort((a:any, b:any) => a.sequence - b.sequence).forEach( category => {
      const currentArr = attachmentArr.filter(v => v.attachment_category.id === category.id);
      const option = Object.assign(category, { members: currentArr });
      this.attachment.push(option);
    });
    console.log(this.attachment);
  }

  // 附件信息展示
  // attachmentArray:any[] = [];
  // getAttachment() {
  //   this.settingsConfigService.get(`/api/attachment/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
  //     console.log('项目 基础附件：', res);
  //     if(res.code === 200) {
  //       const attachment = res.data.attachment;
  //       const attachmentCategoryArray:any[] = attachment.reduce( (all:any[], next:any) => {
  //         all.some((item:any) => item.id === next.attachment_category.id) ? all : all.push(next.attachment_category);
  //         return all;
  //       }, [] );
  //       console.log(attachmentCategoryArray);
  //       this.attachmentArray = [];
  //       // 将所有附件 根据分类 分别放置到 对应的类别下面。
  //       attachmentCategoryArray.sort((a:any, b:any) => a.sequence - b.sequence).forEach( category => {
  //         const currentArr = attachment.filter(v => v.attachment_category.id === category.id);
  //         const option = Object.assign(category, { members: currentArr });
  //         this.attachmentArray.push(option);
  //       });
  //       console.log(this.attachmentArray);
  //     }
  //   })
  // }

}
