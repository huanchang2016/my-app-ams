import { filter, map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData, List } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-invoices-form-manage',
  templateUrl: './invoices-form-manage.component.html',
  styles: [
    `
      :host ::ng-deep .form-item-box > nz-form-label {
        min-width: 100px;
        line-height: 40px;
      }
      :host ::ng-deep nz-form-control {
        flex-grow: 1;
        line-height: 40px;
      }
    `,
  ],
})
export class InvoicesFormManageComponent implements OnInit {
  constructor(
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.projectId = +this.activatedRoute.snapshot.queryParams.project_id;
    console.log('发票新增火编辑 pages, ', this.projectId);
    this.getIncomeConfigs(this.projectId);
    
  }

  // customer_id:any = null;
  // customer:any = null;
  income_id: any = null;

  project_revenue: any[] = [];
  subsidy_income: any[] = [];

  projectId: number = null;
  billId: number = null;
  billInfo: any = null;
  projectDetailInfo: any;
  billCategoryArray: any[] = [];
  validateForm: FormGroup;

  submitLoading = false;

  income_type = 'project';

  maxIncome = 0;

  // 附件上传
  attachment: any[] = [];
  isAttachmentChange = false;

  attachmentCategory: List[] = [];

  ngOnInit() {
    this.getConfigs();
    this.initForm();
    this.getCategoryList();
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      income_type: [ this.income_type, [Validators.required]],
      project_group_id: [ null, [Validators.required] ], // 项目收入 客户单位
      project_tax_id: [ null, [Validators.required] ], // 项目收入 开票税目类型
      subsidy_group_id: [ null ], // 补贴收入 拨款单位
      subsidy_tax_id: [ null ], // 补贴收入 开票税目金额

      bill_category_id: [null, [Validators.required]],// 发票类型

      // apply_amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],

      amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],

      bill_period_time: [null, [Validators.required]],
      customer_contract_code: [null], // 合同编号
      remark: [null]
    });
  }
  incomeTypeChange(type: string) {
    this.income_type = type;
    this.currentSelectedTaxAmount = null;
    if(type === 'project') {
      this.validateForm.patchValue({
        subsidy_group_id: null,
        subsidy_tax_id: null
      });
      if(this.projectGroup.length === 0) {
        this.getProjectIncomeConfig(this.projectId);
      }else {
        if(this.projectGroup.length === 1) {
          this.validateForm.patchValue({
            project_group_id: this.projectGroup[0].id
          });
          this.currentSelectedProjectCompany = this.projectGroup[0];
          this.projectGroupChange(this.currentSelectedProjectCompany.id);
        }
      }

      this.validateForm.get('subsidy_group_id')!.clearValidators();
      this.validateForm.get('subsidy_group_id')!.markAsPristine();
      this.validateForm.get('subsidy_tax_id')!.clearValidators();
      this.validateForm.get('subsidy_tax_id')!.markAsPristine();

      this.validateForm.get('project_group_id')!.setValidators(Validators.required);
      this.validateForm.get('project_group_id')!.markAsDirty();
      this.validateForm.get('project_tax_id')!.setValidators(Validators.required);
      this.validateForm.get('project_tax_id')!.markAsDirty();

    }else {
      this.validateForm.patchValue({
        project_group_id: null,
        project_tax_id: null
      });
      if(this.subsidyGroup.length === 0) {
        this.getSubsidyIncomeConfig(this.projectId);
      }else {
        if(this.subsidyGroup.length === 1) {
          this.validateForm.patchValue({
            subsidy_group_id: this.subsidyGroup[0].id
          });
          this.currentSelectedSubsidyCompany = this.subsidyGroup[0];
          this.subsidyGroupChange(this.currentSelectedSubsidyCompany.id);
        }
      }

      this.validateForm.get('subsidy_group_id')!.setValidators(Validators.required);
      this.validateForm.get('subsidy_group_id')!.markAsDirty();
      this.validateForm.get('subsidy_tax_id')!.setValidators(Validators.required);
      this.validateForm.get('subsidy_tax_id')!.markAsDirty();
      
      this.validateForm.get('project_group_id')!.clearValidators();
      this.validateForm.get('project_group_id')!.markAsPristine();
      this.validateForm.get('project_tax_id')!.clearValidators();
      this.validateForm.get('project_tax_id')!.markAsPristine();

    }

    this.validateForm.get('subsidy_group_id')!.updateValueAndValidity();
    this.validateForm.get('subsidy_tax_id')!.updateValueAndValidity();

    this.validateForm.get('project_group_id')!.updateValueAndValidity();
    this.validateForm.get('project_tax_id')!.updateValueAndValidity();

  }

  proIncomeValueChange(id: number) {
    const pro_ = this.project_revenue.filter((v) => v.id === id)[0];
    console.log(pro_);
    this.maxIncome = pro_.income;
  }
  subIncomeValueChange(id: number) {
    const sub_ = this.subsidy_income.filter((v) => v.id === id)[0];
    console.log(sub_);
    this.maxIncome = sub_.income;
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    console.log('validateForm', this.validateForm);

    if (this.validateForm.valid) {
      this.submitLoading = true;
      // this.destroyModal(this.validateForm.value);
      if (this.billId) {
        //  请求编辑 接口
        this.edit();
      } else {
        //  请求 新增接口
        this.create();
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  submitBillInfo(): void {
    console.log('提交发票 开具申请');
    this.settingsConfigService.post('/api/bill/submit', { bill_id: this.billId }).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('提交成功');
        this.router.navigateByUrl('/bill/apply/in_progress');
      }
    });
  }

  create() {
    const opt: any = this.validateForm.value;

    const option: any = {
      project_id: this.projectId,
      project_revenue_id: this.income_type === 'project' ? this.currentSelectedProjectCompany.project_revenue_id : null,
      subsidy_income_id: this.income_type === 'subsidy' ? this.currentSelectedSubsidyCompany.subsidy_income_id : null,
      bill_category_id: opt.bill_category_id,
      bill_period_start_time: opt.bill_period_time.start,
      bill_period_end_time: opt.bill_period_time.end,
      customer_id: this.income_type === 'project' ? this.currentSelectedProjectCompany.id : this.currentSelectedSubsidyCompany.id, // 客户单位
      tax_id: this.currentSelectedTaxAmount.tax ? this.currentSelectedTaxAmount.tax.id : null,
      subsidy_income_detail_id: !this.currentSelectedTaxAmount.tax ? this.currentSelectedTaxAmount.id : null,
      remark: opt.remark,
      amount: opt.amount,
      customer_contract_code: opt.customer_contract_code
    };

    this.settingsConfigService.post('/api/bill/create', option).subscribe((res: ApiData) => {
      this.submitLoading = false;
      if (res.code === 200) {
        this.bindAttachment(res.data.id);
      } else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  edit() {
    const opt: any = this.validateForm.value;

    const option: any = {
      bill_id: this.billId,
      project_revenue_id: this.income_type === 'project' ? this.currentSelectedProjectCompany.project_revenue_id : null,
      subsidy_income_id: this.income_type === 'subsidy' ? this.currentSelectedSubsidyCompany.subsidy_income_id : null,
      bill_category_id: opt.bill_category_id,
      bill_period_start_time: opt.bill_period_time.start,
      bill_period_end_time: opt.bill_period_time.end,
      customer_id: this.income_type === 'project' ? this.currentSelectedProjectCompany.id : this.currentSelectedSubsidyCompany.id, // 客户单位
      tax_id: this.income_type === 'project' ? this.currentSelectedTaxAmount.tax.id : null,
      subsidy_income_detail_id: this.income_type === 'subsidy' ? this.currentSelectedTaxAmount.id : null,
      remark: opt.remark,
      amount: opt.amount,
      customer_contract_code: opt.customer_contract_code
    };

    this.settingsConfigService.post('/api/bill/update', option).subscribe((res: ApiData) => {
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('更新成功');
        this.router.navigateByUrl(`/bill/project/invoices/list/${this.projectId}`);
      } else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  setFormValue(data: any): void {
    console.log(data);
    this.income_type = data.project_revenue_detail ? 'project' : 'subsidy';
    this.validateForm.patchValue({
      //project_revenue_detail
      income_type: this.income_type,
      project_group_id: this.income_type === 'project' ? data.customer.id : null,
      project_tax_id: this.income_type === 'project' ? data.tax.id : null,
      subsidy_group_id: this.income_type === 'subsidy' ?  data.customer.id :null,
      subsidy_tax_id: this.income_type === 'subsidy' ? data.subsidy_income_detail.id : null,
      taxpayer_no: data.taxpayer_no,
      unit_address: data.unit_address,
      opening_bank: data.opening_bank,
      bank_account: data.bank_account,
      apply_amount: data.apply_amount,
      //
      bill_category_id: data.bill_category.id,
      amount: data.amount,
      // fees: data.fees ? data.fees : null,
      bill_period_time: {
        start: data.bill_period_start_time,
        end: data.bill_period_end_time,
      },
      remark: data.remark,
      customer_contract_code: data.customer_contract_code ? data.customer_contract_code : null,
    });
  }

  getBillInfo(): void {
    this.settingsConfigService.get(`/api/bill/${this.billId}`).subscribe((res: ApiData) => {
      console.log('billInfo, ', res.data);
      if (res.code === 200) {
        this.billInfo = res.data;
        this.setFormValue(this.billInfo);
      }
    });
  }
  // getBillFees(): void {
  //   this.settingsConfigService.get(`/api/bill/fee/${this.billId}`).subscribe((res: ApiData) => {
  //     console.log('bill fee, ', res.data);
  //     if (res.code === 200) {
  //       this.validateForm.patchValue({
  //         fees: res.data.bill_fee,
  //       });
  //     }
  //   });
  // }

  getConfigs(): void {
    // 获取客户单位 信息详情
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res: ApiData) => {
      console.log('projectDetailInfo, ', res.data);
      if (res.code === 200) {
        this.projectDetailInfo = res.data;
      }
    });

    // 获取开票类型
    this.settingsConfigService.get(`/api/bill/category/all`).subscribe((res: ApiData) => {
      console.log('bill/category, ', res.data);
      if (res.code === 200) {
        this.billCategoryArray = res.data.bill_category;
      }
    });
  }

  projectGroup:any[] = [];
  subsidyGroup:any[] = [];
  // 已选择的客户单位 或者 拨款单位
  currentSelectedProjectCompany:any = null;
  currentSelectedSubsidyCompany:any = null;
  // 已选择的 收入 税目   或者 拨款金额及税率
  currentSelectedTaxAmount:any = null;
  getIncomeConfigs(id: number) {
    this.getProjectIncomeConfig(id);
    this.getSubsidyIncomeConfig(id);
    // 获取客户单位（项目收入单位，补贴单位）， 再获取开票信息
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params.id) {
        this.billId = +params.id;
        console.log(this.billId, 'billId');
        this.getBillInfo();
        this.getAttachment();
      }
    });
  }
  getProjectIncomeConfig(id:number) {
    // 获取项目收入
    this.projectGroup = [];
    this.settingsConfigService.get(`/api/project/revenue/${id}`).subscribe((res:ApiData) => {
      console.log('项目收入  分组获取', res);
      if(res.code === 200) {
        const project_revenue:any[] = res.data.project_revenue;
        if(project_revenue.length !== 0) {
          project_revenue.forEach(revenue => {
           const customers = revenue.customers.map( v => Object.assign(v, { project_revenue_id: revenue.id }));
           this.projectGroup = [...this.projectGroup, ...customers];
          });
          console.log(this.projectGroup, 'this.projectGroup')

          if(this.projectGroup.length === 1) {
            this.validateForm.patchValue({
              project_group_id: this.projectGroup[0].id
            });
            this.currentSelectedProjectCompany = this.projectGroup[0];
          }
        }
      }
    });
  }
  getSubsidyIncomeConfig(id:number) {
    // 获取补贴收入
    this.subsidyGroup = [];
    this.settingsConfigService.get(`/api/subsidy/income/${id}`).subscribe((res:ApiData) => {
      console.log('补贴收入subsidyGroupsubsidyGroup', res);
      if(res.code === 200) {
        const subsidy_income:any[] = res.data.subsidy_income;
        if(subsidy_income.length !== 0) {
          this.subsidyGroup = subsidy_income.map( v => Object.assign(v.company, { subsidy_income_id: v.id }) );
          
          console.log(this.subsidyGroup, 'this.subsidyGroup')
          
          if(this.subsidyGroup.length === 1) {
            this.validateForm.patchValue({
              subsidy_group_id: this.subsidyGroup[0].id
            });
            // this.subsidyGroupChange(this.subsidyGroup[0].id)
            this.currentSelectedSubsidyCompany = this.subsidyGroup[0];
          }
        }
      }
    });
  }

  projectTaxList:any[] = [];
  projectGroupChange(id:number) {
    if(!id) {
      return;
    }
    const selectedPorjectGroup = this.projectGroup.filter( v => v.id === id)[0];
    console.log('选择的客户单位', selectedPorjectGroup);
    this.currentSelectedProjectCompany = selectedPorjectGroup;
    
    this.settingsConfigService.get(`/api/project_revenue_detail/revenue/${selectedPorjectGroup.project_revenue_id}`).subscribe((res:ApiData) => {
      console.log(res, '通过项目收入获取详情');
      if(res.code === 200) {
        this.projectTaxList = res.data.project_revenue_detail;
        if(this.projectTaxList.length === 1) {
          this.validateForm.patchValue({
            project_tax_id: this.projectTaxList[0].tax.id
          });
          this.currentSelectedTaxAmount = this.projectTaxList[0];
        }else {
          const project_tax_id = this.validateForm.get('project_tax_id').value;
          if(project_tax_id && this.projectTaxList.length !== 0) {
            this.currentSelectedTaxAmount = this.projectTaxList.filter( v=> v.tax.id === project_tax_id)[0];
          }
        }
      }
    });
  }
  subsidyTaxList:any[] = [];
  subsidyGroupChange(id:number) {
    if(!id) {
      return;
    }
    const selectedSubsidyGroup = this.subsidyGroup.filter( v => v.id === id)[0];
    console.log('选择的拨款单位', selectedSubsidyGroup);
    this.currentSelectedSubsidyCompany = selectedSubsidyGroup;
    
    this.settingsConfigService.get(`/api/subsidy_income_detail/subsidy/${selectedSubsidyGroup.subsidy_income_id}`).subscribe((res:ApiData) => {
      console.log(res, '通过补贴收入获取详情');
      if(res.code === 200) {
        const subsidy_income_detail:any[] = res.data.subsidy_income_detail;
        this.subsidyTaxList = subsidy_income_detail.filter( v => v.is_bill );
        if(this.subsidyTaxList.length === 1) {
          this.validateForm.patchValue({
            subsidy_tax_id: this.subsidyTaxList[0].id
          });
          this.currentSelectedTaxAmount = this.subsidyTaxList[0];
        }else {
          const subsidy_tax_id = this.validateForm.get('subsidy_tax_id').value;
          if(subsidy_tax_id && this.subsidyTaxList.length !== 0) {
            this.currentSelectedTaxAmount = this.subsidyTaxList.filter( v=> v.id === subsidy_tax_id)[0];
          }
        }
      }
    });
  }

  projectTaxChange(id:number) {
    if(!id) {
      return;
    }
    const tax = this.projectTaxList.filter( v => v.tax.id === id)[0];
    this.currentSelectedTaxAmount = tax; 
    console.log('选择的项目金额的税目和金额', this.currentSelectedTaxAmount);
  }
  subsidyTaxChange(id:number) {
    if(!id) {
      return;
    }
    const tax = this.subsidyTaxList.filter( v => v.id === id)[0];
    this.currentSelectedTaxAmount = tax;
    console.log('选择的拨款金额和税率', this.currentSelectedTaxAmount);
  }

  cancel() {}
  attachmentChange(option: any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if (this.billId) {
      this.bindAttachment(this.billId, true);
    }
  }

  bindAttachment(bill_id: number, isRefer: boolean = false) {
    const opt: any = {
      attachment_ids: this.attachment.map((v) => v.id),
      project_id: this.projectId,
      bill_id,
      is_basic: false,
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        if (this.billId) {
          if (isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        } else {
          this.msg.success('保存成功');
          this.router.navigateByUrl(`/bill/project/invoices/list/${this.projectId}`);
        }
      } else {
        this.msg.error(res.error || '附件绑定失败');
      }
    });
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/bill/${this.billId}`).subscribe((res: ApiData) => {
      console.log('项目 基础附件：', res);
      if (res.code === 200) {
        this.attachment = res.data.attachment;
      }
    });
  }
  getCategoryList() {
    const opt: any = {
      is_project: false,
      is_contract: false,
      is_pay: false,
      is_bill: true,
    };
    this.settingsConfigService
      .post('/api/attachment/category/list', opt)
      .pipe(
        filter((v) => v.code === 200),
        map((v) => v.data),
      )
      .subscribe((data) => {
        const cateArrData: any[] = data.attachment_category;
        this.attachmentCategory = cateArrData
          .sort((a: any, b: any) => a.sequence - b.sequence)
          .map((v) => {
            return { id: v.id, name: v.name };
          });
      });
  }
}
