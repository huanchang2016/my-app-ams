import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { Component, OnChanges, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiData, List } from 'src/app/data/interface.data';
import { SettingsService } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-adjust-budget-info',
  templateUrl: './adjust-budget-info.component.html',
  styles: []
})
export class AdjustBudgetInfoComponent implements OnChanges, OnInit {

  @Input() projectId:number;
  @Input() logInfo?:any;

  @Output() logInfoChange:EventEmitter<any> = new EventEmitter();

  budget:any = null;

  
  incomeOpt:any = { // 收入类型确认
    project: true,
    subsidy: true
  };
  
  configs:any = {
    origin: null,
    category: null,
    attachment_category: null
  }; // 项目基础信息配置项（项目类型   客户来源  项目附件）
  
  constructor(
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
    private settings: SettingsService,
    private msg: NzMessageService
  ) {
    if(this.settings.user.department) {
      this.getConfigs();
    }
  }

  ngOnChanges(){
    if(this.projectId) {
      this.getProjectIncomeList();
      this.getSubsidyIncomeList();
      this.getBudgetInfo(this.projectId);
    }
  }

  
  validateProjectForm: FormGroup;
  validateSubsidyForm: FormGroup;
  validateCostForm: FormGroup;

  projectIncome:any[] = [];
  subsidyIncome:any[] = [];

  ngOnInit(): void {
    const partyB:string = this.settings.user.company ? this.settings.user.company.name : null;
    this.validateProjectForm = this.fb.group({
      partyA: [null, [Validators.required]],  // 甲方
      partyA_power: [null ],  // 甲方权责界定
      partyA_condition: [null ], // 甲方费用支付条件
      partyB: [partyB, [Validators.required]], // 乙方
      partyB_power: [null ], // 乙方服务内容
      partyB_condition: [null ] // 乙方服务 附加条件
      // pro_income: [ null ] // 项目收入来源 ： 含  类型  金额
    });

    this.validateSubsidyForm = this.fb.group({
      company_id: [null, [Validators.required]], // 拨款名称
      name: [null, [Validators.required]],
      condition: [null, [Validators.required]],
      calculation_basis: [null, [Validators.required]],
      remark: [null, [Validators.required]]
    });

    this.validateCostForm = this.fb.group({
      cost: [null, [Validators.required]] // 成本预算
    });

  }
  
  submitProjectForm(): void {
    for (const i in this.validateProjectForm.controls) {
      this.validateProjectForm.controls[i].markAsDirty();
      this.validateProjectForm.controls[i].updateValueAndValidity();
    }
    console.log(this.validateProjectForm.value);
    if(this.validateProjectForm.valid) {
      // this.destroyModal(this.validateProjectForm.value);
      const option = this.validateProjectForm.value;
      const value = {
        partyA: option.partyA.join('； '),
        partyA_power: option.partyA_power,
        partyA_condition: option.partyA_condition,
        partyB: option.partyB,
        partyB_power: option.partyB_power,
        partyB_condition: option.partyB_condition
      };
      
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  
  submitSubsidyForm(): void {
    for (const i in this.validateProjectForm.controls) {
      this.validateProjectForm.controls[i].markAsDirty();
      this.validateProjectForm.controls[i].updateValueAndValidity();
    }
    console.log(this.validateProjectForm.value, '补贴收入');
    if(this.validateProjectForm.valid) {
      // this.destroyModal(this.validateProjectForm.value);
      const option = this.validateProjectForm.value;
      
      
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  submitCostForm(): void {
    for (const i in this.validateProjectForm.controls) {
      this.validateProjectForm.controls[i].markAsDirty();
      this.validateProjectForm.controls[i].updateValueAndValidity();
    }
    console.log(this.validateProjectForm.value, '成本预算');
    if(this.validateProjectForm.valid) {
      // this.destroyModal(this.validateProjectForm.value);
      const option = this.validateProjectForm.value;
      
      
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  incomeProjectTypeChange() {
    //  && !this.incomeOpt.subsidy
    console.log(this.incomeOpt, '项目收入类型 changes');
    

  }
  
  incomeSubsidyTypeChange() {
    //  && !this.incomeOpt.subsidy
    console.log(this.incomeOpt, '补贴收入类型 changes');
    

  }

  getProjectIncomeList() {
    // 获取项目收入
    this.settingsConfigService.get(`/api/project/revenue/${this.projectId}`).subscribe((res:ApiData) => {
      console.log('项目收入', res);
      if(res.code === 200) {
        this.projectIncome = res.data.project_revenue;
        if(this.projectIncome.length !== 0) {
          this.incomeOpt.project = true;
          // 给  项目收入表单赋值
          this.setProjectIncomeFormValue(this.projectIncome[0]);
        }
      }
    });

    
  }
  getSubsidyIncomeList() {
    // 获取补贴收入
    this.settingsConfigService.get(`/api/subsidy/income/${this.projectId}`).subscribe((res:ApiData) => {
      console.log('补贴收入', res);
      if(res.code === 200) {
        this.subsidyIncome = res.data.subsidy_income;
        if(this.subsidyIncome.length !== 0) {
          this.incomeOpt.subsidy = true;
          // 给 补贴收入表单赋值
          this.setSubsidyIncomeFormValue(this.subsidyIncome[0]);
        }
      }
    });
  }

  getBudgetInfo(proId:number):void {


    // 获取到了用户的 成本
    this.settingsConfigService.get(`/api/budget/project/${proId}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const budget:any = res.data;
        this.settingsConfigService.get(`/api/cost/budget/${res.data.id}`).subscribe((costRes:ApiData) => {
          if(costRes.code === 200) {
            const cost = costRes.data.cost;
            this.budget = Object.assign(budget, { cost });
            console.log(this.budget, '预算信息');
            // 给 成本预算信息赋值
            this.validateCostForm.patchValue({
              cost: cost
            });
          }
        })
      }
    })
  }

  setProjectIncomeFormValue(proIncome:any) {
    console.log('set project income form patchValue!');
    const partyA:string[] = proIncome.partyA.split('； ');
    this.validateProjectForm.patchValue({
      partyA: partyA,
      partyA_power: proIncome.partyA_power,
      partyA_condition: proIncome.partyA_condition,
      // partyB: proIncome.partyB,
      partyB_power: proIncome.partyB_power,
      partyB_condition: proIncome.partyB_condition
      // pro_income: proIncome.pro_income
    });

    // 获取项目收入来源
  }

  setSubsidyIncomeFormValue(subIncome:any) {
    console.log('set subsidy income form patchValue!', subIncome);
    this.validateSubsidyForm.patchValue({
      company_id: subIncome.company.id,
      name: subIncome.name,
      condition: subIncome.condition,
      calculation_basis: subIncome.calculation_basis,
      remark: subIncome.remark
    });

    // 获取补贴收入来源
  }

  partCompanyList:List[] = [];
  taxList:any[] = [];
  customerCompany:any[] = [];

  getConfigs() {
    // 获取甲方、乙方 单位列表
    this.settingsConfigService.get('/api/company/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        let data: any[] = res.data.company;
        this.partCompanyList = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active);
      }
    });

    // 获取甲方、乙方 单位列表
    this.settingsConfigService.get('/api/company/customer/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        let data: any[] = res.data.company;
        this.customerCompany = data.sort((a: any, b: any) => a.sequence - b.sequence)
          .filter(v => v.active);
      }
    });

    
    // 获取税目类型列表
    if(this.settings.user.department) {
      this.settingsConfigService.get(`/api/tax/department/${this.settings.user.department.id}`).subscribe((res: ApiData) => {
        if (res.code === 200) {
          let data: any[] = res.data.tax;
          this.taxList = data.filter(v => v.active);
        }
      });
    }
  }


}
