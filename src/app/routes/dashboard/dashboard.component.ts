import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, interval, Subscription, fromEvent } from 'rxjs';
import { take, switchMap, takeUntil, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsConfigService
  ) {}

text:string = '获取验证码';
  ngOnInit(): void {
    // this.validateForm = this.fb.group({
    //   userName: [null, [Validators.required]],
    //   password: [null, [Validators.required]],
    //   remember: [null]
    // });

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
  }
  loadingCaptcha:boolean = false;
  getCaptcha() {
    
    let count:number = 10;
    this.loadingCaptcha = true;
    const timer = interval(1000).subscribe( _ => {
      console.log(count)
      count--;
      if(count > 0) {
        this.text = `${count} s后重新获取`;
      }else {
        this.text = '获取验证码';
        this.loadingCaptcha = false;
        timer.unsubscribe();
      }
      
    })
  }

  opacityChange$:Subscription;
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

  op:number = 1.0;
  boxClick$:Observable<any>;
  subs$:Subscription;
  addClickEvent():void {
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

  removeClickEvent():void {
    if(!this.subs$) return;
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

  // }

}
