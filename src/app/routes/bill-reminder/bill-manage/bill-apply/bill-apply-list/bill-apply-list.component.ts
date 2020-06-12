import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bill-apply-list',
  templateUrl: './bill-apply-list.component.html',
  styles: [
    `
    :host ::ng-deep .ant-tabs-nav-wrap>div {
      text-align: right;
    }
    `
  ]
})
export class BillApplyListComponent implements OnInit, OnDestroy {
  private router$: Subscription;

  tabs: any[] = [
    {
      key: 'in_progress',
      tab: '申请中'
    },
    {
      key: 'pass',
      tab: '已通过'
    },
    {
      key: 'refused',
      tab: '已拒绝'
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
    this.router.navigateByUrl(`/bill/apply/${item.key}`);
  }

  ngOnDestroy() {
    this.router$.unsubscribe();
  }
}
