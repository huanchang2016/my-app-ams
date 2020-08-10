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

  adjustInfo:any;

  id:number;

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

    this.validateForm.valueChanges.subscribe( _ => this.adjustInfo = null ); // 切换调整 模块时，调整的信息需要重置


  }

  adjustLoading: boolean = false;


  submitForm(): void {
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsDirty();
    //   this.validateForm.controls[i].updateValueAndValidity();
    // }
    console.log(this.validateForm.value);

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
      console.log(this.configs, 'project base info configs');
    });


  }

}
