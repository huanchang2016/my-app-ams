import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-adjust-list',
  templateUrl: './project-adjust-list.component.html',
  styles: [
  ]
})
export class ProjectAdjustListComponent implements OnInit {

  constructor() { }

  pos = 0;

  type_id = 0;

  type_name = '进行中';

  ngOnInit(): void {
  }
  
  readOuter() {
    this.type_name = '进行中';
  }
}
