import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsService } from '@delon/theme';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-adjust-project-info',
  templateUrl: './adjust-project-info.component.html',
  styleUrls: ['./adjust-project-info.component.less']
})
export class AdjustProjectInfoComponent implements OnChanges {

  @Input() projectInfo:any;
  @Input() logInfo?:any;

  @Output() logInfoChange:EventEmitter<any> = new EventEmitter();

  project:any = null;
  
  info:any = null;
  
  configs:any = {
    origin: null,
    category: null,
    attachment_category: null
  }; // 项目基础信息配置项（项目类型   客户来源  项目附件）
  
  constructor(
    private settingsConfigService: SettingsConfigService,
    private settings: SettingsService,
    private msg: NzMessageService
  ) {
    if(this.settings.user.department) {
      this.getConfigs();
    }
  }

  ngOnChanges(){
    if(this.projectInfo) {
      this.project = this.projectInfo;
      this.getAttachment();
      if(this.logInfo) {
        this.matchInfo();
      }
    }
  }

  // getDataInfo() {
  //   this.settingsConfigService.get(`/api/project/detail/${this.projectInfo.id}`).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       this.project = res.data;
  //       console.log(this.project, 'project info', this.logInfo);
  //       this.matchInfo();
  //     }
  //   })
  // }

  matchInfo() {
    this.info = Object.assign(this.project, this.logInfo);
    console.log(this.info)
  }

  // 调整内容发生变化
  valueChange(key:string, value: any) {
    this.logInfo[key] = value;
    this.emitLog();
  }
  // 日期被调整
  rangeDateChange(opt:any) {
    const data = opt.data;
    this.logInfo[opt.keys[0]] = data.start;
    this.logInfo[opt.keys[1]] = data.end;
    this.emitLog();
  }

  emitLog() {
    console.log('log info change', this.logInfo);
    this.logInfoChange.emit(this.logInfo);
  }

  getConfigs() {
    const opt:any = {
      is_project: true,
      is_contract: false,
      is_pay: false,
      is_bill: false
    };
    zip(
      this.settingsConfigService.get('/api/project/origin/list'),
      this.settingsConfigService.get(`/api/project_category/department/${this.settings.user.department.id}`),
      this.settingsConfigService.post('/api/attachment/category/list', opt)
    ).pipe(
      map(([res1, res2, res3]) => [res1.data.project_origin, res2.data.project_category, res3.data.attachment_category])
    ).subscribe( ([origin, category, attachment_category]) => {
      this.configs = {
        origin,
        category,
        attachment_category: attachment_category.sort((a:any, b:any) => a.sequence - b.sequence).map( v => {
          return { id: v.id, name: v.name }
        })
      };
      console.log('configs info: ', this.configs);
    })
  }

  // 附件发生变化
  attachmentIdsChange(opt:any[]) {
    this.logInfo['attachment'] = opt;
    this.emitLog();
  }
  
  // 附件上传
  attachment:any[] = [];
  currentAttachmentIds:number[] = [];
  isAttachmentChange:boolean = false;
  attachmentChange(option:any) {
    console.log(option);
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    this.logInfo['attachment'] = this.attachment;

    this.emitLog(); // 传递给 parent c
    // this.bindAttachment(this.info);
  }

  // bindAttachment(projectInfo:any) {
  //   const ids:number[] = this.attachment.map(v => v.id);
  //   const opt:any = {
  //     attachment_ids: ids,
  //     project_id: projectInfo.id,
  //     is_basic: true
  //   };
  //   console.log(opt);
  //   this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res:ApiData) => {
  //     console.log(res);
  //     if(res.code === 200) {
  //       if(this.info) {
  //         this.msg.success('附件绑定成功');
  //         // 将绑定的附件 存到日志里面
  //         this.logInfo['attachment'] = ids;
  //         this.emitLog(); // 传递给 parent c
  //         this.getAttachment();
  //       }
  //     } else {
  //       this.msg.error(res.error || '附件绑定失败')
  //     }
  //   })
  // }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      console.log('项目 基础附件：', res);
      if(res.code === 200) {
        this.attachment = res.data.attachment;
        this.currentAttachmentIds = this.attachment.map(v => v.id);
      }
    })
  }

  compareArray(arr1:number[], arr2:number[]):boolean {
    let isDifferent:boolean = false;
    if(arr1 && arr2) {
      if(arr1.length === arr2.length) {
        arr1.forEach(v => {
          if(!arr2.includes(v)) {
            isDifferent = true;
          }
        });
      }else {
        isDifferent = true;
      }
        
    }else if(!arr2) {
      isDifferent = false;
    }else {
      isDifferent = true;
    }
    
    return isDifferent;
  }
}
