import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';

@Component({
  selector: 'header-storage',
  template: `
    <i nz-icon nzType="tool"></i>
    清理本地缓存
  `,
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '[class.d-block]': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderStorageComponent {
  constructor(
    private modalSrv: NzModalService,
    private messageSrv: NzMessageService,
    private router: Router
  ) {}

  @HostListener('click')
  _click() {
    this.modalSrv.confirm({
      nzTitle: '确认需要清除本地缓存数据？',
      nzOnOk: () => {
        localStorage.clear();
        this.messageSrv.success('清理完成!');
        this.router.navigateByUrl('/passport/login');
      },
    });
  }
}
