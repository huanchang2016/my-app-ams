import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
      }
    `
  ]
})
export class PersonCenterEditPasswordComponent implements OnInit {
  validateForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private http: _HttpClient
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      old: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/)]],
      confirm: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  validateConfirmPassword(): void {
    setTimeout(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }

  submitForm(): void {
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    // console.log(this.validateForm.value);
    if(this.validateForm.valid) {
      let option: any = {
        old: this.validateForm.get('old').value,
        new: this.validateForm.get('password').value
      };
      this.http.post('/api/password/change', option).subscribe((res:ApiData) => {
        // console.log(res);
        if(res.code === 200) {
          this.msg.success('密码修改成功');
          this.tokenService.clear();
          this.router.navigateByUrl(this.tokenService.login_url);
        }else {
          this.msg.error(res.error);
        }
      })
    }
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

}
