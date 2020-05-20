import { Component, OnInit, Input } from '@angular/core';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-info-show-c',
  templateUrl: './project-info-show-c.component.html',
  styles: []
})
export class ProjectInfoShowCComponent implements OnInit {

  @Input() projectInfo:any;
  
  constructor(
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
    
  }

}
