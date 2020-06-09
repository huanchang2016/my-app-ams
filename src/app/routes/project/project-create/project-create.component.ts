import { Component, OnInit } from '@angular/core';
import { SettingsConfigService } from '../../service/settings-config.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.less']
})
export class ProjectCreateComponent implements OnInit {

  currentSteps = 0;

  project:any = {
    info: null
  };
  isEdit:boolean = false;

  constructor(
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.isEdit = true;
        this.getDataInfo(params['id']);
      }
    })
  }

  ngOnInit() {
  }

  submitChangeSuccess(opt:any):void {
    this.project[opt.key] = opt.data;
    this.next();
  }

  prevStepsChange() {
    this.pre();
  }
  
  nextStepsChange() {
    this.next();
  }

  pre(): void {
    this.currentSteps -= 1;
  }

  next(): void {
    this.currentSteps += 1;
  }

  getDataInfo(id:number):void {
    this.settingsConfigService.get(`/api/project/detail/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.project['info'] = res.data;
      }
    })
  }
  
}
