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
  validateForm: FormGroup;

  getDataFn$: Observable<ApiData>;

  constructor(
    private fb: FormBuilder,
    private loadingSrv: LoadingService,
    private lodopSrv: LodopService,
    private msg: NzMessageService,
    private settingsService: SettingsConfigService
  ) {
    this.getDataFn$ = this.settingsService.get('/api/project/submit/forApproval/my');

    // 打印功能
    this.lodopSrv.lodop.subscribe(({ lodop, ok }) => {
      console.log(lodop, ok)
      if (!ok) {
        this.error = true;
        return;
      }
      this.error = false;
      this.msg.success(`打印机加载成功`);
      this.lodop = lodop as Lodop;
      this.pinters = this.lodopSrv.printer;
    });
    // 打印功能
  }

  text: string = '获取验证码';
  types = ['url', 'email'];
  value = '';
  type = '';
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

  source:string = `https://blz-videos.nosdn.127.net/1/OverWatch/AnimatedShots/Overwatch_AnimatedShot_Bastion_TheLastBastion.mp4`;
  ngOnInit(): void {
    
    this.getData();

    this.change('url');

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

  listData$: Subscription;

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



  loadingCaptcha: boolean = false;
  getCaptcha() {

    let count: number = 10;
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

  opacityChange$: Subscription;
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

  op: number = 1.0;
  boxClick$: Observable<any>;
  subs$: Subscription;
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

  // }


  // 打印功能
  cog: any = {
    url: '/assets/plugins/LodopFuncs.js',
    printer: '',
    paper: '',
    html: `
        <h1>Title</h1>
        <p>这~！@#￥%……&*（）——sdilfjnvn</p>
        <p>这~！@#￥%……&*（）——sdilfjnvn</p>
        <p>这~！@#￥%……&*（）——sdilfjnvn</p>
        <p>这~！@#￥%……&*（）——sdilfjnvn</p>
        <p>这~！@#￥%……&*（）——sdilfjnvn</p>
        `,
  };
  error = false;
  lodop: Lodop | null = null;
  pinters: any[] = [];
  papers: string[] = [];

  reload(options: any = { url: '/assets/plugins/LodopFuncs.js' }) {
    console.log(options, 'reload')
    this.pinters = [];
    this.papers = [];
    this.cog.printer = '';
    this.cog.paper = '';

    this.lodopSrv.cog = Object.assign({}, this.cog, options);
    this.error = false;
    if (options === null) this.lodopSrv.reset();
  }

  changePinter(name: string) {
    this.papers = this.lodop!.GET_PAGESIZES_LIST(name, '\n').split('\n');
  }

  printing = false;
  print(isPrivew = false) {
    const LODOP = this.lodop!;
    LODOP.PRINT_INITA(10, 20, 810, 610, '测试C-Lodop远程打印四步骤');
    LODOP.SET_PRINTER_INDEXA(this.cog.printer);
    LODOP.SET_PRINT_PAGESIZE(0, 0, 0, this.cog.paper);
    LODOP.ADD_PRINT_TEXT(1, 1, 300, 200, '下面输出的是本页源代码及其展现效果：');
    LODOP.ADD_PRINT_TEXT(20, 10, '90%', '95%', this.cog.html);
    LODOP.SET_PRINT_STYLEA(0, 'ItemType', 4);
    LODOP.NewPageA();
    LODOP.ADD_PRINT_HTM(20, 10, '90%', '95%', this.cog.html);
    if (isPrivew) LODOP.PREVIEW();
    else LODOP.PRINT();
  }
  // 打印功能
}
