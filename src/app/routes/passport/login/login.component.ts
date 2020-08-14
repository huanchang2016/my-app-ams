import { _HttpClient } from '@delon/theme';
import { Component, OnDestroy, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { ReuseTabService } from '@delon/abc';
import { StartupService } from '@core';
import { ApiData } from 'src/app/data/interface.data';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [],
})
export class UserLoginComponent implements OnDestroy {

  constructor(
    fb: FormBuilder,
    modalSrv: NzModalService,
    private router: Router,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
  ) {
    this.form = fb.group({
      userName: ['admin', [Validators.required, Validators.minLength(4)]],
      password: ['12345678', Validators.required],
      // password: ['Cdtfhr028', Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true],
    });
    modalSrv.closeAll();
  }

  // #region fields

  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.password;
  }
  get mobile() {
    return this.form.controls.mobile;
  }
  get captcha() {
    return this.form.controls.captcha;
  }
  form: FormGroup;
  error = '';
  type = 0;

  // #region get captcha

  count = 0;
  interval$: Subscription;

  // #endregion

  switch(ret: any) {
    this.type = ret.index;
  }

  // getCaptcha() {
  //   if (this.mobile.invalid) {
  //     this.mobile.markAsDirty({ onlySelf: true });
  //     this.mobile.updateValueAndValidity({ onlySelf: true });
  //     return;
  //   }
  //   this.count = 59;
  //   this.interval$ = interval(1000).subscribe( _ => {
  //     this.count -= 1;
  //     if (this.count <= 0) {
  //       this.interval$.unsubscribe();
  //     }
  //   })
  // }

  // #endregion

  submit() {
    this.error = '';
    if (this.type === 0) {
      this.userName.markAsDirty();
      this.userName.updateValueAndValidity();
      this.password.markAsDirty();
      this.password.updateValueAndValidity();
      if (this.userName.invalid || this.password.invalid) {
        return;
      }
    } else {
      this.mobile.markAsDirty();
      this.mobile.updateValueAndValidity();
      this.captcha.markAsDirty();
      this.captcha.updateValueAndValidity();
      if (this.mobile.invalid || this.captcha.invalid) {
        return;
      }
    }

    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
    this.http
      .post('/api/user/login', {
        // type: this.type,
        username: this.userName.value,
        password: this.password.value,
      })
      .subscribe((res: ApiData) => {
        if (res.status_code !== 'OK') {
          this.error = res.error;
          return;
        }
        // 清空路由复用信息
        this.reuseTabService.clear();
        // 设置用户Token信息
        this.tokenService.set({ token: res.data.access_token });
        // this.startupService.initMenuBypermission();
        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        this.startupSrv.load().then(() => {
          this.msg.success('登录成功');
          let url = this.tokenService.referrer.url || '/';
          if (url.includes('/passport')) url = '/';
          this.router.navigateByUrl(url);
        });
      });
  }

  // #region social

  open(url: string) {
    this.router.navigateByUrl(url);
  }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) {
      this.interval$.unsubscribe();
    }
  }
}
