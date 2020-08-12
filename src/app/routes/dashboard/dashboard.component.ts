import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, interval, Subscription, fromEvent } from 'rxjs';
import { take, switchMap, takeUntil, map, filter } from 'rxjs/operators';
import { ApiData } from 'src/app/data/interface.data';
import { LoadingService, LoadingType } from '@delon/abc';
import { LodopService, Lodop } from '@delon/abc/lodop';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // 创建表格对象

  constructor(
    private fb: FormBuilder,
    private loadingSrv: LoadingService,
    private lodopSrv: LodopService,
    private msg: NzMessageService,
    private settingsService: SettingsConfigService
  ) {
    this.getDataFn$ = this.settingsService.get('/api/project/submit/forApproval/my');
  }
  getDataFn$: Observable<ApiData>;

  text = '获取验证码';
  types = ['url', 'email'];
  value = '';
  type = '';

  source = `https://blz-videos.nosdn.127.net/1/OverWatch/AnimatedShots/Overwatch_AnimatedShot_Bastion_TheLastBastion.mp4`;

  validateForm: FormGroup;

  listData$: Subscription;



  loadingCaptcha = false;

  opacityChange$: Subscription;

  op = 1.0;
  boxClick$: Observable<any>;
  subs$: Subscription;

  change(type: string) {
    this.type = type;
    switch (type) {
      case 'url':
        this.value = 'http://www.cdtfhr.com/';
        break;
      case 'email':
        this.value = 'admin@cdtfhr.com';
        break;
    }
  }
  showLoading(type: LoadingType) {

    this.loadingSrv.open({
      type,
      text: '数据加载中...',
      delay: 1000
    });

    setTimeout(() => {
      this.loadingSrv.close();
    }, 3000);
  }

  printN(i) {
    console.log(i);
  }
  ngOnInit(): void {

    this.getData();

    this.change('url');

    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      file: [null, [Validators.required]]
    });

    // this.validateForm.get('remember').valueChanges.subscribe((res:any) => {
    //   if(res) {
    //     this.validateForm.get('userName').setValue(3423423);
    //     this.validateForm.get('userName').enable();
    //   }else {
    //     this.validateForm.get('userName').setValue(0);
    //     this.validateForm.get('userName').disable();
    //   }

    // })
    // this.settingsService.getPromiseIntervalData().then( res => {
    //   console.log(res, 'promise response');
    // })

    // const obFn:Subscription = this.settingsService.getObservableIntervalData().subscribe( res => {
    //   console.log(res, 'Observable res Data')
    // });

    // setTimeout(() => {
    //   console.log('取消 Observable 事件发起!')
    //   obFn.unsubscribe();
    // }, 2000);

    // this.letterCasePermutation('a1b2')

  }

  letterCasePermutation = function (S: string): string[] {
    let result: string[] = [];
    if (this.hasLetter(S)) {
      result = this.dealWidthStr(S, [], []);
    } else {
      result = [S];
    }
    console.log(result)
    return result;
  };

  dealWidthStr = (str: string, arr: string[], res: string[]): string[] => {
    const regx = /^[A-Za-z]*$/;
    if (str === '') {
      const s = arr.join("");
      res.push(s);
      console.log(s, 'finish', res)
      return res;
    }
    if (regx.test(str[0])) {
      const upper = str[0].toUpperCase();
      const lower = str[0].toLowerCase();
      const a = str.slice(1);

      this.dealWidthStr(str.slice(1), arr.concat([upper]), res);
      this.dealWidthStr(str.slice(1), arr.concat([lower]), res);
    } else {
      const a = str.slice(1);
      arr.push(str[0]);
      this.dealWidthStr(str.slice(1), arr, res);
    }
  }

  hasLetter = (str: any) => {
    for (const i in str) {
      const asc = str.charCodeAt(i);
      if ((asc >= 65 && asc <= 90 || asc >= 97 && asc <= 122)) {
        return true;
      }
    }
    return false;
  }

  getData() {
    this.listData$ = this.getDataFn$.pipe(
      filter(v => v.code === 200),
      map(d => d.data)
    ).subscribe(
      (data: any) => console.log(data),
      error => console.error(error),
      () => console.log('request complete!')
    )
  }
  getCaptcha() {

    let count = 10;
    this.loadingCaptcha = true;
    const timer = interval(1000).subscribe(_ => {
      console.log(count)
      count--;
      if (count > 0) {
        this.text = `${count} s后重新获取`;
      } else {
        this.text = '获取验证码';
        this.loadingCaptcha = false;
        timer.unsubscribe();
      }

    })
  }
  ngAfterViewInit() {
    // this.addClickEvent();
    // this.boxClick$ = fromEvent(document.querySelector('#box'), 'click');
    // this.opacityChange$ = interval(1000).pipe(
    //   takeUntil(
    //     fromEvent(document.querySelector("#button3"), 'click')
    //   )
    // ).subscribe(
    //   (ev:any) => {
    //     this.op -= 0.1;
    //     this.op = this.op < 0.1 ? 1 : this.op;
    //     console.log(this.op, ev);
    //     // document.querySelector('#box').setAttribute('style', 'opacity: ' + this.op);
    //     // ev.target.style.opacity = this.op;
    //   }
    // )
  }

  stopChange() {
    console.log('unsbscribe works!');
    // this.opacityChange$.unsubscribe();
  }
  addClickEvent(): void {
    // this.subs$ = this.boxClick$
    //     .pipe(
    //       takeUntil(
    //         fromEvent(document.querySelector("#button3"), 'click')
    //       )
    //     )
    //     .subscribe(
    //       (ev:any) => {
    //         this.op -= 0.1;
    //         this.op = this.op < 0.1 ? 1 : this.op;
    //         console.log(this.op);
    //         ev.target.style.opacity = this.op;
    //       }
    //     )
  }

  removeClickEvent(): void {
    if (!this.subs$) return;
    this.subs$.unsubscribe();
  }

  ngOnDestroy() {
    this.stopChange();
  }

  // submitForm(): void {
  //   for (const i in this.validateForm.controls) {
  //     this.validateForm.controls[i].markAsDirty();
  //     this.validateForm.controls[i].updateValueAndValidity();
  //   }

  //   console.log(this.validateForm.value);
  // }

}
