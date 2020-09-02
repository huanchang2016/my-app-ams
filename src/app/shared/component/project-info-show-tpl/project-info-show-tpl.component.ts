import { Component, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-project-info-show-tpl',
  templateUrl: './project-info-show-tpl.component.html',
  styles: [
  ]
})
export class ProjectInfoShowTplComponent implements OnChanges {

  @Input() projectInfo: any;
  constructor() { }

  ngOnChanges(): void {

  }

}
