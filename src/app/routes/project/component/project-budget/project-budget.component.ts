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
    public settingConfigService: SettingsConfigService
  ) {
    if(this.settings.user.department) {
      this.settingConfigService.get(`/api/tax/department/${this.settings.user.department.id}`).subscribe((res:ApiData) => {
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
      cost: [ null ]
    });

    this.validateForm.valueChanges.pipe(debounceTime(500)).subscribe( _ => {
      this.count();
    })
    

    if(this.projectInfo) {
      //  如果存在 data， 需要通过项目  获取 预算表
      this.getBudgetData();
      console.log(this.projectInfo, 'project info');
    }
  }

  getBudgetData() {
    this.settingConfigService.get(`/api/budget/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
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

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    // console.log(this.validateForm.value);

    if(this.validateForm.valid) {
      const value:any = this.validateForm.value;
      console.log(value, '项目预算提交 submit valid === true!');
      const costArr:any[] = value.cost.map( v => {
        return {
          cost_id: v.id ? v.id : null,
          cost_category_id: v.cost_category.id,
          amount: v.amount
        }
      })
      const opt:any = {
         project_id: this.projectInfo.id,
         tax_id: value.tax_id,
         income: +value.income,
         cost: costArr
      };

      this.updateBudget(opt);
      
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  updateBudget(data:any):void {
    this.submitLoading = true;
    this.settingConfigService.post('/api/budget/update', data).subscribe((res:ApiData) => {
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
    this.settingConfigService.post('/api/project/create', data).subscribe((res:ApiData) => {
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
      income: opt.income === 0 ? null : opt.income
    });

    this.settingConfigService.get(`/api/cost/budget/${opt.id}`).subscribe((res:ApiData) => {
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
      
      const totalIncome:number = Number(value.income); // 总收入
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
}
