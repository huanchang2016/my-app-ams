import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dispath-index',
  templateUrl: './dispath-index.component.html',
  styles: [
    `
    :host ::ng-deep .ant-tabs-nav-wrap>div {
      text-align: right;
    }
    `
  ]
})
export class DispathIndexComponent implements OnInit, OnDestroy {
  private router$: Subscription;
  tabs: any[] = [
    {
      key: 'draft',
      tab: '草稿'
    },
    // {
    //   key: 'progress',
    //   tab: '进行中'
    // },
    // {
    //   key: 'refuse',
    //   tab: '未通过'
    // },
    // {
    //   key: 'finished',
    //   tab: '已通过'
    // }
  ];

  pos = 0;

  constructor(private router: Router) { }

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
    this.router.navigateByUrl(`/project/list/${item.key}`);
    // this.router.navigateByUrl(`/dispath/list/${item.key}`);
  }

  ngOnDestroy() {
    this.router$.unsubscribe();
  }

  create() {
    this.router.navigateByUrl("/dispatch/create");
    console.log('router.navigateByUrl', this.router.navigateByUrl);
  }

}
