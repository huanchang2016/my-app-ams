import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsService } from '@delon/theme';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-view-draft',
  templateUrl: './project-view-draft.component.html',
  styleUrls: ['./project-view-draft.component.less']
})
export class ProjectViewDraftComponent implements OnChanges, OnInit {

  @Input() projectInfo:any;

  @Output() prevStepsChange:EventEmitter<any> = new EventEmitter();

  budgetInfo:any; // 收入预算
  costInfo:any[] = []; // 成本预算
  costTotal:number = 0; // 成本总计
  supplierList:any[] = []; // 项目供应商及供应商下：有合约  和 无合约数据

  constructor(
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges() {
    if(this.projectInfo) {
      console.log(this.projectInfo);
      this.getDataInfo(this.projectInfo.id);
    }
  }

  ngOnInit() {

  }

  getDataInfo(projetId:number):void {
    this.settingsConfigService.get(`/api/budget/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      console.log(res, 'project budget info!');
      if(res.code === 200) {
        this.budgetInfo = res.data;
        this.getCostInfo();
        this.getSupplierInfo();
      }
    })
  }

  // 获取成本预算
  getCostInfo():void {
    
    this.settingsConfigService.get(`/api/cost/budget/${this.budgetInfo.id}`).subscribe((res:ApiData) => {
      console.log(res, 'cost 成本预算');
      if(res.code === 200) {
        this.costInfo = res.data.cost;
        if(this.costInfo.length !== 0) {
          this.countCost();
        }
        
      }
    })
  }

  // 获取供应服务商
  getSupplierInfo():void {
    this.settingsConfigService.get(`/api/supplier/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      console.log(res, 'get supplier info!');
      if(res.code === 200) {
        this.supplierList = res.data.supplier;
      }
    })
  }

  countCost():void { // 计算 预算成本 总计
    this.costTotal = this.costInfo.reduce((prev:number, item:any) => {
      return prev + item.amount;
    }, this.costTotal);

    console.log(this.costTotal);
  }
}
