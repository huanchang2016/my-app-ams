import { Component } from '@angular/core';
import { zip, interval } from 'rxjs';
import { Router } from '@angular/router';
import { GlobalSettingsService } from '@core';

@Component({
  selector: 'header-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderTaskComponent {
  loading = true;
  totalTaskNumber:number = 0;

  projectNumber:number = 0;
  contractNumber:number = 0;
  treatyNumber:number = 0;
  billNumber:number = 0;

  timer$:any = null;

  constructor(
    // private cdr: ChangeDetectorRef,
    public globalService: GlobalSettingsService,
    private router: Router
  ) {
    this.getDataList();
    this.intervalFn();
  }

  index:number = 0;

  intervalFn() {
    this.timer$ = interval( 30 * 60 * 1000).subscribe( _ => {
      this.getDataList();
    })
  }

  getDataList() {
    this.globalService.getTaskList();
  }



  navToApproval(url:string):void {
    this.router.navigateByUrl(url);
  }

  // change() {
  //   this.getDataList();
  // }
  // 任务
  
  /***
   * 
   * 
   * 
                {
                  text: '项目待审批',
                  link: '/project/forApproved'
                },
                {
                  text: '合约待审批',
                  link: '/approve/contract/pay/forApproval'
                },
   * 
                {
                  text: '非合约待审批',
                  link: '/approve/no-contract/pay/forApproval'
                },

   * {
      text: '开票待审批',
      link: '/bill/approve/forApprove'
    },

   */ 
}
