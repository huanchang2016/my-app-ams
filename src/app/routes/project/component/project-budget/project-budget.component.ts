import { debounceTime, map } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-project-budget',
  templateUrl: './project-budget.component.html',
  styleUrls: ['./project-budget.component.less']
})
export class ProjectBudgetComponent implements OnInit {

  @Input() projectInfo:any;
  @Output() prevStepsChange:EventEmitter<any> = new EventEmitter();
  @Output() submitChangeSuccess:EventEmitter<any> = new EventEmitter();

  budgetInfo:any = null;
  
  validateForm: FormGroup;
  submitLoading:boolean = false;

  taxArray:any[] = [];

  currentTax:any = null;
  currentCountResult:any = {
    income: null, // 总收入
    rate: null, // 税率
    no_tax_income: null, // 不含税收入
    tax_income: null, // 税金
    gross_profit: null, // 毛利润
    gross_profit_percent: null
  };

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService
  ) {
    if(this.settings.user.department) {
      this.settingsConfigService.get(`/api/tax/department/${this.settings.user.department.id}`).subscribe((res:ApiData) => {
        if(res.code === 200) {
          this.taxArray = res.data.tax;
        }
      })
    }
    
  }
  

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      tax_id: [ null, [Validators.required] ],
      income: [ null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)] ],
      subsidy_income: [ null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)] ],
      cost: [ null ]
    });

    this.validateForm.valueChanges.pipe(debounceTime(500)).subscribe( _ => {
      this.count();
    })
    

    if(this.projectInfo) {
      //  如果存在 data， 需要通过项目  获取 预算表
      this.getBudgetData();
      console.log(this.projectInfo, 'project info');
      this.getProjectIncomeList();
      this.getSubsidyIncomeList();
    }
  }

  getBudgetData() {
    this.settingsConfigService.get(`/api/budget/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      // console.log(res);
      if(res.code === 200) {
        this.setFormValue(res.data);
      }
    })
  }

  budgetChange() {
    const selectId:number = this.validateForm.value.tax_id;
    if(selectId) {
      this.currentTax = this.taxArray.filter( v => v.id === selectId)[0];
      this.count();
    }
    
  }

  get taxId() {
    return this.validateForm.controls.tax_id;
  }
  get income() {
    return this.validateForm.controls.income;
  }
  get subsidy_income() {
    return this.validateForm.controls.subsidy_income;
  }
  submitForm(): void {
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsDirty();
    //   this.validateForm.controls[i].updateValueAndValidity();
    // }
    
    // 如果收入类型均为选择或填写不能提交 project: false,
    // subsidy: false
    const isProjectIncome:boolean = this.projectIncome.length !== 0;
    const isSubsidyIncome:boolean = this.subsidyIncome.length !== 0;

    if(!this.incomeOpt.project && !this.incomeOpt.subsidy ) {
      this.msg.warning('收入类型未选择');
      return;
    }
    if (this.incomeOpt.project) {
      this.taxId.markAsDirty();
      this.taxId.updateValueAndValidity();
      this.income.markAsDirty();
      this.income.updateValueAndValidity();
      if (this.taxId.invalid || this.income.invalid || !isProjectIncome ) {
        this.msg.warning('项目收入类型或者金额未正确填写！');
        return;
      }
    }
    if (this.incomeOpt.subsidy){

      this.subsidy_income.markAsDirty();
      this.subsidy_income.updateValueAndValidity();
      if (this.subsidy_income.invalid || !isSubsidyIncome) {
        this.msg.warning('补贴收入金额或者补贴明细未正确填写')
        return;
      }
    }


    console.log(this.validateForm);

      const value:any = this.validateForm.value;
      console.log(value, '项目预算提交 submit valid === true!');
      const costArr:any[] = value.cost.map( v => {
        return {
          cost_id: v.id ? v.id : null,
          cost_category_id: v.cost_category.id,
          amount: v.amount
        }
      });
      const opt:any = {
         project_id: this.projectInfo.id,
         tax_id: isProjectIncome && this.incomeOpt.project ? value.tax_id : null,
         income: isProjectIncome && this.incomeOpt.project ? +value.income : 0,
         subsidy_income: isSubsidyIncome && this.incomeOpt.subsidy ? +value.subsidy_income : 0,
         cost: costArr
      };

      this.updateBudget(opt);
      
    
    // if(this.validateForm.valid) {} else {
    //   this.msg.warning('信息填写不完整');
    // }
  }

  updateBudget(data:any):void {
    this.submitLoading = true;
    this.settingsConfigService.post('/api/budget/update', data).subscribe((res:ApiData) => {
      // console.log('budget : ', res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.submitChangeSuccess.emit({
          data: res.data,
          key: 'budget'
        });
      }else {
        this.msg.error(res.error || '提交失败');
      }
    })
  }

  addBudget(data:any): void {
    this.settingsConfigService.post('/api/project/create', data).subscribe((res:ApiData) => {
      // console.log(res);
      if(res.code === 200) {
        this.submitChangeSuccess.emit({
          data: res.data,
          key: 'budget'
        });
      }else {
        this.msg.error(res.error || '提交失败');
      }
    })
  }

  setFormValue(opt:any) :void {
    this.validateForm.patchValue({
      tax_id: opt.tax ? opt.tax.id : null,
      income: opt.income === 0 ? null : opt.income,
      subsidy_income: opt.subsidy_income === 0 ? null : opt.subsidy_income
    });

    this.settingsConfigService.get(`/api/cost/budget/${opt.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.validateForm.patchValue({
          cost: res.data.cost
        });
        this.count();
      }
    })
  }

  count() {
    const value:any = this.validateForm.value;
    
    if(value.tax_id && this.validateForm.controls['income'].status === 'VALID') {
      if(!this.currentTax) {
        this.currentTax = this.taxArray.filter( v => v.id === value.tax_id)[0];
      }
      
      const totalIncome:number = Number(value.income); // 项目总收入 + 补贴总收入 + Number(value.subsidy_income) TODO: 待定
      const sj:number = totalIncome * this.currentTax.rate; // 税金
      const no_tax_income:number = totalIncome - sj;
      let totalCost:number = 0;

      if(value.cost && value.cost.length !== 0) {
        value.cost.forEach( item => {
          totalCost += item.amount;
        })
      }
      
      const gross_profit:number = +(totalIncome - totalCost).toFixed(2);
      const gross_profit_percent:string = (gross_profit / totalIncome * 100).toFixed(2) + '%';

      this.currentCountResult = {
        income: totalIncome, // 总收入
        rate: this.currentTax.rate * 100, // 税率
        tax_income: sj, // 税金
        no_tax_income: no_tax_income, // 不含税收入
        gross_profit: gross_profit,
        gross_profit_percent: gross_profit_percent
      };

      // console.log(this.currentCountResult);
    }
  }
  
  prevSteps(e:MouseEvent) {
    e.preventDefault();
    this.prevStepsChange.emit();
  }
  // 新增修改需求
  incomeOpt:any = {
    project: false,
    subsidy: false
  };
  projectIncome:any[] = [];
  subsidyIncome:any[] = [];

  listValueChange(type:string) {
    if(type === 'project') {
      this.getProjectIncomeList();
    }else {
      this.getSubsidyIncomeList();
    }
    
  }

  getProjectIncomeList() {
    // 获取项目收入
    this.settingsConfigService.get(`/api/project/revenue/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      console.log('项目收入', res);
      if(res.code === 200) {
        this.projectIncome = res.data.project_revenue;
        if(this.projectIncome.length !== 0) {
          this.incomeOpt.project = true;
          this.switchPopconfirm = true;
        }
      }
    });

    
  }
  getSubsidyIncomeList() {
    // 获取补贴收入
    this.settingsConfigService.get(`/api/subsidy/income/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      console.log('补贴收入', res);
      if(res.code === 200) {
        this.subsidyIncome = res.data.subsidy_income;
        if(this.subsidyIncome.length !== 0) {
          this.incomeOpt.subsidy = true;
          this.switchPopconfirm = true;
        }
      }
    });
  }

  popconfirmTitle:string = '';
  switchPopconfirm:boolean = false;

  incomeTypeChange() {
    //  && !this.incomeOpt.subsidy
    console.log((!this.incomeOpt.project && !this.incomeOpt.subsidy) || (this.incomeOpt.project && this.incomeOpt.subsidy ))
    if((!this.incomeOpt.project && !this.incomeOpt.subsidy) || (this.incomeOpt.project && this.incomeOpt.subsidy )) {
      this.switchPopconfirm = true;
      return;
    }
    if(!this.incomeOpt.project && this.projectIncome.length !== 0) {
      this.popconfirmTitle = '项目收入类型未选择，且项目收入不为空，如果继续提交，会自动删除所有项目收入信息，是否继续？';
      this.switchPopconfirm = false;
    }
    if(!this.incomeOpt.subsidy && this.subsidyIncome.length !== 0) {
      this.popconfirmTitle = '补贴收入类型未选择，且补贴收入不为空，如果继续提交，会自动删除所有补贴收入信息，是否继续？';
      this.switchPopconfirm = false;
    }

    if(this.projectIncome.length === 0 && this.subsidyIncome.length === 0) {
      this.switchPopconfirm = true;
    }
    if(this.projectIncome.length === 0 && !this.incomeOpt.project) {
      this.switchPopconfirm = true;
    }
    if(this.subsidyIncome.length === 0 && !this.incomeOpt.subsidy) {
      this.switchPopconfirm = true;
    }

    if(this.incomeOpt.subsidy && this.subsidyIncome.length === 0) {
      this.switchPopconfirm = true;
    }
    if(this.incomeOpt.project && this.projectIncome.length === 0) {
      this.switchPopconfirm = true;
    }

    console.log(this.popconfirmTitle, this.switchPopconfirm);

  }

  confirm() {

    if(this.switchPopconfirm || (this.incomeOpt.project && this.incomeOpt.subsidy ) || (!this.incomeOpt.project && !this.incomeOpt.subsidy )) {
      this.submitForm();
    }else {
      if(!this.incomeOpt.project && this.projectIncome.length !== 0) {
        console.log('删除所有项目收入信息');
        const proIncomeIds:number[] = this.projectIncome.map( v => v.id);
        this.deletedProjectIncomeList(proIncomeIds);
      }else {
        console.log('删除所有补贴收入信息');
        const subIncomeIds:number[] = this.subsidyIncome.map( v => v.id);
        this.deletedSubsidyIncomeList(subIncomeIds);
      }
    }
  }

  cancel() { }

  deletedProjectIncomeList(ids:number[]):void {
    const opt:any = { project_revenue_ids: ids };
    this.settingsConfigService.post('/api/project/revenue/disable', opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.switchPopconfirm = true;
        this.incomeOpt.project = false;
        this.submitForm();
      }else {
        this.msg.error(res.error || '项目收入信息删除失败');
      }
    });
  }
  deletedSubsidyIncomeList(ids:number[]):void {
    const opt:any = { income_ids: ids };
    this.settingsConfigService.post('/api/subsidy/income/disable', opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.switchPopconfirm = true;
        this.incomeOpt.subsidy = false;
        this.submitForm();
      }else {
        this.msg.error(res.error || '补贴收入信息删除失败');
      }
    });
  }
  
}
