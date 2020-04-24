import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-project-logs',
  templateUrl: './project-logs.component.html',
  styles: []
})
export class ProjectLogsComponent implements OnInit {
  @Input() logs:any[] = [];

  constructor() { }

  ngOnInit() {
    console.log(this.logs);
  }

}
