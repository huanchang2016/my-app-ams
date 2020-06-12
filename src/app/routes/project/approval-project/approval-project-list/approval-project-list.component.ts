import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-approval-project-list',
  templateUrl: './approval-project-list.component.html',
  styles: [
    `
    :host ::ng-deep .ant-tabs-nav-wrap>div {
      text-align: right;
    }
    `
  ]
})
export class ApprovalProjectListComponent implements OnInit, OnDestroy {
  private router$: Subscription;
  tabs: any[] = [
    {
      key: 'my',
      tab: '该我审批'
    },
    {
      key: 'pending',
      tab: '待审批'
    },
    {
      key: 'finished',
      tab: '已审批'
    }
  ];

  pos = 0;

  constructor(private router: Router) {}

  private setActive() {
    const key = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);
    const idx = this.tabs.findIndex(w => w.key === key);
    if (idx !== -1) {
      this.pos = idx;
    }
  }

  ngOnInit(): void {
    this.router$ = this.router.events.pipe(filter(e => e instanceof ActivationEnd)).subscribe(() => this.setActive());
    this.setActive();
  }

  to(item: any) {
    this.router.navigateByUrl(`/project/approval/${item.key}`);
  }

  ngOnDestroy() {
    this.router$.unsubscribe();
  }
}
