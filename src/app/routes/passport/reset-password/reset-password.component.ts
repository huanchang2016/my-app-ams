import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { ApiData } from 'src/app/data/interface.data';
import { interval } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routes-reset-password',
  templateUrl: './reset-password.component.html',
  styles: [`
    .reset-box {
      max-width: 520px;
      margin: 0 auto;
    }
  `]
})
export class RoutesResetPasswordComponent implements OnInit {
  validateForm: FormGroup;
  sendCaptcha:boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private noticeService: NzNotificationService,
    private httpClient: _HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      phoneNumber: [null, [Validators.required, Validators.pattern(/[1]\d{10}/) ]],
      captcha: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/)]],
      checkPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log(this.validateForm.value);

    if(this.validateForm.valid) {
      const value:any = this.validateForm.value;
      const opt:any = {
        pwd: value.password,
        tel: value.phoneNumber,
        captcha: value.captcha
      };
      this.httpClient.post(`/api/change_password_by_message`, opt).subscribe((res:ApiData) => {
        if(res.code === 200) {
          this.msg.success('密码找回成功，请重新登录');
          this.router.navigateByUrl('/passport/login');
        }else {
          this.msg.error(res.error || '密码找回失败，请重试或联系管理员');
        }
      })
    }
  }

  get getPhoneNumber() {
    return this.validateForm.controls.phoneNumber;
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.checkPassword.updateValueAndValidity());
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  count:number = 10 * 60;
  captchaText:string = '获取验证码';

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
    if(this.getPhoneNumber.valid && !this.sendCaptcha) {
      this.httpClient.post(`/api/verification/code/get`, { tel: this.getPhoneNumber.value })
          .subscribe((res:ApiData) => {
            if(res.code === 200) {
              this.countdown();
              this.noticeService.success('操作成功', '验证码已发送，请注意查收');
            }else {
              this.sendCaptcha = false;
              this.noticeService.error('操作失败', res.error || '验证码发送失败，请重试');
            }
          })
    } else {
      this.noticeService.error('操作失败', '手机号码未填写或验证码已发送');
    }
  }

  countdown() {
    this.sendCaptcha = true;
    interval( 1000).subscribe( _ => {
      if(this.count > 1) {
        this.captchaText = `${this.count}s 后重新获取`;
      }else {
        this.captchaText = '获取验证码';
        this.sendCaptcha = false;
      }
      this.count--;
    })
  }


}
