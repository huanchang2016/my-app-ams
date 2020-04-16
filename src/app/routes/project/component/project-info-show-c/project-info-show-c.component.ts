import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-project-info-show-c',
  templateUrl: './project-info-show-c.component.html',
  styles: []
})
export class ProjectInfoShowCComponent implements OnInit {

  @Input() projectInfo:any;
  
  constructor() { }

  ngOnInit() {
  }

}
