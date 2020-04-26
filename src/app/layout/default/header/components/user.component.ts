import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, _HttpClient } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Observable, Subject, merge, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiData } from 'src/app/data/interface.data';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'header-user',
  template: `
    <div
      class="alain-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzPlacement="bottomRight"
      [nzDropdownMenu]="userMenu"
    >
      <nz-avatar [nzSrc]="settings.user.avatar ? settings.user.avatar : './assets/imgs/logo-color.png'" nzSize="small" class="mr-sm hidden-mobile"></nz-avatar>
      <i nz-icon class="hidden-pc text-primary mr-xs" nzType="user" nzTheme="outline"></i>
      {{ settings.user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="">
        <div nz-menu-item>
          <p class="mb-xs" *ngIf="settings.user.company">
            <i nz-icon nzType="bank" nzTheme="outline"></i>
            {{ settings.user.company?.name }}
          </p>
          <p class="mb-xs" *ngIf="settings.user.department">
            <i nz-icon nzType="team" nzTheme="outline"></i>
            {{ settings.user.department?.name }}<ng-container *ngIf="settings.user.position"> - {{ settings.user.position.name }}</ng-container>
          </p>
          <p class="mb-xs">
            <i nz-icon nzType="clock-circle" nzTheme="outline"></i>
            {{ clock | async }}
          </p>
        </div>
        <div nz-menu-item routerLink="/person-center/edit-password">
          <i nz-icon nzType="unlock" nzTheme="outline" class="mr-sm"></i>
          修改密码
        </div>
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          退出登录
        </div>
      </div>
    </nz-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent implements OnInit {

  clock: Observable<string>;
  update$ = new Subject(); // 事件发生器

  constructor(
    public settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: _HttpClient,
    private msg: NzMessageService
  ) {}

  ngOnInit() {
    this.clock = merge(
      interval(1000),
      this.update$.asObservable()
    ).pipe(
      map(_ => {
        let current:string = this.countCurrentDate();
        return current;
      })
    );
  }
  countCurrentDate() : string {
    let t: Date = new Date();
    return t.getFullYear() + '年' + (t.getMonth() + 1) + '月' + t.getDate() + '日'
                  + ' ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();
  }

  logout() {
    this.httpClient.get('/api/user/logout').subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('退出成功');
        this.tokenService.clear();
        this.router.navigateByUrl(this.tokenService.login_url!);
      }
      
    })
    
  }
}
