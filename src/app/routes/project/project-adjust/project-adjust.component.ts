import { Component, OnInit } from '@angular/core';
import { ApiData } from 'src/app/data/interface.data';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from '../../service/settings-config.service';
import { Observable, of } from 'rxjs';
import { timeout, map } from 'rxjs/operators';

/***********
 * 1. 项目基础信息（含附件）调整记录 logJson.info
 * 
 * 2. 项目预算  暂时不开发（需求变更明显）
 * 
 * 3. 供应商管理，当前只有  供应商创建
 *        日志： logInfo.supplier[supplier_id] = { contract: [], treaty: [] };
 *               所有供应商  下的合约  非合约信息 记录
 * 
 * ***********/


@Component({
  selector: 'app-project-adjust',
  templateUrl: './project-adjust.component.html',
  styleUrls: ['./project-adjust.component.less']
})
export class ProjectAdjustComponent implements OnInit {
  projectId:number = null;
  logJson:any = null;
  
  
  project:any = {
    info: null,
    budget: null,
    supplier: []
  };

  // showContractExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示
  // showNoContractExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示
  

  constructor(
    public msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getDataInfo(params['id']);
      }
    })
  }

  json$:Observable<any> = of(`{"info": {"name": "项目调整测试数据"}}`);
  ngOnInit() {
    this.json$.pipe(
      timeout(800),
      map(v => JSON.parse(v))
    ).subscribe( res => this.logJson = res);
  }

  save() {}

  // 基础信息发生变化
  logInfoChange(info:any) {
    this.logJson.info = info;
    console.log('info changed, parent c is geted', this.logJson);
  }
  // 预算信息发生变化
  logBudgetChange(info:any) {
    this.logJson.info = info;
    console.log('info changed, parent c is geted', this.logJson);
  }

  getDataInfo(id:number):void {
    this.settingsConfigService.get(`/api/project/detail/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.project['info'] = res.data;
      }
    })
  }

  // getBudgetInfo(proId:number):void {
  //   this.settingsConfigService.get(`/api/budget/project/${proId}`).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       const budget:any = res.data;
  //       this.settingsConfigService.get(`/api/cost/budget/${res.data.id}`).subscribe((costRes:ApiData) => {
  //         if(costRes.code === 200) {
  //           this.project.budget = Object.assign(budget, { cost: costRes.data.cost });
  //           console.log(this.project);
  //         }
  //       })
  //     }
  //   })
  // }
  
  // getSupplierInfo(proId:number):void {

  //   this.settingsConfigService.get(`/api/supplier/project/${proId}`).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       this.project.supplier = res.data.supplier;
  //       // 是否默认展示供应商下 合约列表数据
  //       this.project.supplier.forEach(item => (this.showContractExpand[item.id] = true));
  //       this.project.supplier.forEach(item => (this.showNoContractExpand[item.id] = true));
  //     }
  //   })
  // }

  // showContract(id:number):void { // 切换供应商合约展示 与否 ？
  //   this.showContractExpand[id] = !this.showContractExpand[id];
  // }
  // showNoContract(id:number):void { // 切换供应商合约展示 与否 ？
  //   this.showNoContractExpand[id] = !this.showNoContractExpand[id];
  // }

  cancel(): void {}

  submitProject(): void {
    this.msg.success('项目已提交');
    // this.settingsConfigService
    //     .post('/api/project/submit', { project_id: this.projectId })
    //     .subscribe((res:ApiData) => {
    //       if(res.code === 200) {
    //         this.msg.success('项目已提交');
    //         this.router.navigateByUrl('/project/list/progress');
    //       }else {
    //         this.msg.error(res.error || '提交失败，请重试');
    //       }
    // })
  }


  // 避免精度丢失
  countPercent(num:number, x:number): number {
    return Math.round(num * x);
  }
  
  // 日志信息
  // logLoading:boolean = true;
  // logs:any[] = [];
  // getProjectLog(id:number):void {
  //   this.settingsConfigService.get(`/api/project/log/${id}`).subscribe((res:ApiData) => {
  //     console.log('log ....', res.data);
  //     this.logLoading = false;
  //     if(res.code === 200) {
  //       this.logs = res.data.project_log;
  //     }else {
  //       this.logs = [];
  //     }
  //   })
  // }

}
