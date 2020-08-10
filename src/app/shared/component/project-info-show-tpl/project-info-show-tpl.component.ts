import { Component, OnChanges, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-info-show-tpl',
  templateUrl: './project-info-show-tpl.component.html',
  styles: [
  ]
})
export class ProjectInfoShowTplComponent implements OnChanges {

  @Input() projectInfo: any;
  constructor(
    private router: Router
  ) { }

  ngOnChanges(): void {

  }

  view(data: any) {
    this.router.navigateByUrl(`/project/view/${data.id}`);
  }
}
