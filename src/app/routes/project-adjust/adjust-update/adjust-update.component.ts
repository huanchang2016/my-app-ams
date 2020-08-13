import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { filter, map } from 'rxjs/operators';
import { zip } from 'rxjs';


@Component({
  selector: 'app-adjust-update',
  templateUrl: './adjust-update.component.html',
  styles: [
  ]
})
export class AdjustUpdateComponent implements OnInit {

  configs: {[key:string]: any[]} = { // 当前项目下的所有公共基础配置项信息
    company: [],
    origin: [],
    project_category: []
  };

  validateForm: FormGroup;

  projectInfo:any;

  adjustInfo:any = null;
  adjustLoading: boolean = false;

  id:number;
  stepsCategoryLoading:{ [key:string]: boolean } = {
    '项目信息调整': false,
    '项目收入调整': false,
    '补贴收入调整': false,
    '成本调整': false,
    '合约调整': false,
    '非合约调整': false
  };
  stepsCategory:any[] = [
    { key: 1, label: '项目信息调整', value: '项目信息调整' },
    { key: 2, label: '项目收入调整', value: '项目收入调整' },
    { key: 3, label: '补贴收入调整', value: '补贴收入调整' },
    { key: 4, label: '成本调整', value: '成本调整' },
    { key: 5, label: '合约调整', value: '合约调整' },
    { key: 6, label: '非合约调整', value: '非合约调整' }
  ];
  // 项目信息调整. 项目收入调整. 补贴收入调整. 成本调整. 合约调整. 非合约调整

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settings: SettingsService, // 通过个人 所在部门 获取项目类型等信息
    public settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute
  ) {
    this.getConfigs();

    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.id = +params['id'];
        this.getDataInfo();
      }
    })
  }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      // name: [null, [Validators.required]],
      category_name: [null, Validators.required]


    });

  }


  submitLoading:boolean = false;
  adjustmentChange(option:any):void {
    // this.adjustInfo = data;
    this.submitLoading = true;
    this.settingsConfigService.post('/api/adjustment/update', option).subscribe((res:ApiData) => {
      this.submitLoading = false;
      if(res.code === 200) {
        this.adjustInfo = res.data;
      }
    })
  }

  // 项目/补贴  收入调整时： 创建
  adjustmentIncomeChange(obj:any):void {
    this.submitLoading = true;
    const option = obj.data;
    const url:string = obj.type === 'project' ? '/api/project_revenue_adjustment/create' : '/api/subsidy_income_adjustment/create';

    this.settingsConfigService.post(url, option).subscribe((res:ApiData) => {
      this.submitLoading = false;
      if(res.code === 200) {
        this.adjustInfo = res.data;
      }
    })
  }
  // 项目/补贴收入 删除
  adjustmentIncomeDeleted(obj:any):void {
    const opt:any = obj.data;
    const url:string = obj.type === 'project' ? '/api/project_revenue_adjustment/delete' : '/api/subsidy_income_adjustment/delete';
    this.settingsConfigService.post(url, opt).subscribe((res:ApiData) => {
      console.log(res);
      if(res.code === 200) {
        if(res.data.delete) {
          const message:string = obj.type === 'project' ? '项目收入删除成功' : '补贴收入删除成功';
          this.msg.success(message);
          this.adjustInfo = res.data.adjustment;
        }else {
          this.msg.error('删除失败');
        }
      }
    })
  }


  submitForm(): void {
    if (this.validateForm.valid) {
      const opt: any = {
        ...this.validateForm.value,
        project_id: this.id
      };
      this.adjustLoading = true;
      this.adjustInfo = null;
      this.settingsConfigService.post('/api/adjustment/generate', opt).subscribe((res:ApiData) => {
        this.adjustLoading = false;
        if(res.code === 200) {
          this.msg.success('初始化成功');
          this.adjustInfo = res.data;
          // this.stepsCategoryLoading[this.validateForm.value.category_name] = true;
          this.showAdjustmentModal();
        }
      })
    }
    
  }

  cancel():void {}

  getDataInfo():void {
    this.settingsConfigService.get(`/api/project/detail/${this.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.projectInfo = res.data;
      }
    })
    this.settingsConfigService.get(`/api/adjustment/${this.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        const data = res.data;
        this.adjustInfo = res.data;
        console.log('adjustment info update: ', this.adjustInfo);
        if(this.adjustInfo.category.adjustment_category) {
          this.showAdjustmentModal();
        }
        
      }
    })
  }

  showAdjustmentModal() {
    const category:any[] = this.adjustInfo.category.adjustment_category;
    if(category.length > 0) {
      const _category = category.map( v => v.name );
      this.stepsCategory.forEach( el => {
        if(_category.includes(el.value)) {
          this.stepsCategoryLoading[el.value] = true;
        }else {
          this.stepsCategoryLoading[el.value] = false;
        }
      });
    }
  }

  
  getConfigs():void {
    // 获取当前用户所在部门 的 项目类型
    if(!this.settings.user.department) {
      return; // 当前用户不可调整项目。
    }
    zip(
      this.settingsConfigService.get('/api/company/customer/all'),
      this.settingsConfigService.get('/api/project/origin/list'),
      this.settingsConfigService.get(`/api/project_category/department/${this.settings.user.department.id}`)
    ).pipe(
      map(([company, origin, project_category]) => [company.data.company, origin.data.project_origin, project_category.data.project_category])
    ).subscribe(([company, origin, project_category]) => {
      this.configs = {
        company,
        origin,
        project_category
      }
    });


  }

}
