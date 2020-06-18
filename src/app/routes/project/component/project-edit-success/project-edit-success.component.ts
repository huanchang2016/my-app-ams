import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-edit-success',
  templateUrl: './project-edit-success.component.html',
  styles: [`
    .success-icon {
      font-size: 80px;
    }
    .success-btn-box {
      margin-top: 150px;
    }
  `]
})
export class ProjectEditSuccessComponent implements OnInit {

  @Input() projectInfo:any;

  @Output() prevStepsChange:EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
  }

  prevSteps() {
    this.prevStepsChange.emit();
  }

  viewDetails():void {
    // 查看项目详情
    this.router.navigateByUrl(`/project/view/${this.projectInfo.id}`);
  }

  cancel(): void {}

  submitProject(): void {
    this.settingsConfigService
        .post('/api/project/submit', { project_id: this.projectInfo.id })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('项目已提交');
            this.router.navigateByUrl('/project/list/progress');
          }else {
            this.msg.error(res.error || '提交失败，请重试');
          }
    })
  }
}
