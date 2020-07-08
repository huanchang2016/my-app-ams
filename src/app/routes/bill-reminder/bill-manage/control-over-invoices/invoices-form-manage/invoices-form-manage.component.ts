import { filter, map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData, List } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { zip } from 'rxjs';

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
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params.id) {
        this.billId = +params.id;
        console.log(this.billId, 'billId');
        this.getBillInfo();
        this.getBillFees();
        this.getAttachment();
      }
    });
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
      // 新增内容
      customer_category: [null, [Validators.required]],
      taxpayer_no: [null, [Validators.required]],
      unit_address: [null, [Validators.required]],
      opening_bank: [null, [Validators.required]],
      bank_account: [null, [Validators.required]],
      apply_amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      //
      bill_category_id: [null, [Validators.required]],
      income_type: ['project', [Validators.required]],
      project_revenue_id: [null, [Validators.required]],
      subsidy_income_id: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      bill_period_time: [null, [Validators.required]],
      // fees: [null],
      remark: [null],
      customer_contract_code: [null], // 合同编号
      // mail: [null, [Validators.email]],
      // company_id: [ this.companyId, [Validators.required] ]
    });
  }
  incomeTypeChange(type: string) {
    this.income_type = type;
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
      // customer_id: this.customer.id,
      bill_category_id: opt.bill_category_id,
      bill_period_start_time: opt.bill_period_time.start,
      bill_period_end_time: opt.bill_period_time.end,
      // amount: opt.fees.length !== 0 ? this.taxFeeCount : +opt.amount,
      fees: opt.fees,
      remark: opt.remark,
      customer_contract_code: opt.customer_contract_code,
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
      // customer_id: this.customer_id,
      bill_category_id: opt.bill_category_id,
      bill_period_start_time: opt.bill_period_time.start,
      bill_period_end_time: opt.bill_period_time.end,
      // amount: opt.fees.length !== 0 ? this.taxFeeCount : +opt.amount,
      fees: opt.fees,
      remark: opt.remark,
      customer_contract_code: opt.customer_contract_code,
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
    this.validateForm.patchValue({
      //
      customer_category: data.customer_category,
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
        // this.customer_id = this.billInfo.customer.id;
        // this.incomeValueChange();
      }
    });
  }
  getBillFees(): void {
    this.settingsConfigService.get(`/api/bill/fee/${this.billId}`).subscribe((res: ApiData) => {
      console.log('bill fee, ', res.data);
      if (res.code === 200) {
        this.validateForm.patchValue({
          fees: res.data.bill_fee,
        });
      }
    });
  }

  getConfigs(): void {
    // 获取客户单位 信息详情
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res: ApiData) => {
      console.log('projectDetailInfo, ', res.data);
      if (res.code === 200) {
        this.projectDetailInfo = res.data;
        this.getIncomeConfigs(this.projectDetailInfo.id);
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
  getIncomeConfigs(id: number) {
    zip(
      this.settingsConfigService.get(`/api/project_revenue_detail/project/${id}`),
      this.settingsConfigService.get(`/api/subsidy_income_detail/project/${id}`),
    )
      .pipe(map(([a, b]) => [a.data.project_revenue_detail, b.data.subsidy_income_detail]))
      .subscribe(([project_revenue_detail, subsidy_income_detail]) => {
        this.project_revenue = project_revenue_detail;
        const subsidy_list: any[] = subsidy_income_detail;

        this.subsidy_income = subsidy_list.filter((v) => v.is_bill);
        console.log(this.project_revenue, this.subsidy_income);
      });
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
