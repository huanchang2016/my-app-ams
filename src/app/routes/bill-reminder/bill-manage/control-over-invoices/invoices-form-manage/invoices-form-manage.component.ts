import { debounceTime, filter, map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ApiData, List } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-invoices-form-manage',
  templateUrl: './invoices-form-manage.component.html',
  styles: [`
    :host ::ng-deep .form-item-box > nz-form-label {
      min-width: 100px;
    }
    :host ::ng-deep nz-form-control {
      flex-grow: 1;
      line-height: 40px;
    }
  `]
})
export class InvoicesFormManageComponent implements OnInit {

  customer_id:any = null;
  customer:any = null;

  projectId: number = null;
  billId: number = null;
  billInfo: any = null;
  projectDetailInfo: any;
  billCategoryArray: any[] = [];
  taxArray: any[] = []; // 税目类型
  taxFeeArray: any[] = []; // 税目子类 名称

  taxFeeCount: number = 0;

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.projectId = +this.activatedRoute.snapshot.queryParams.project_id;
    console.log('发票新增火编辑 pages, ', this.projectId);
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.billId = +params['id'];
        console.log(this.billId, 'billId');
        this.getBillInfo();
        this.getBillFees();
        this.getAttachment();
      }
    })
  }

  ngOnInit() {
    this.getConfigs();
    this.initForm();
    this.getCategoryList();
  }

  initForm(): void {
    this.validateForm = this.fb.group({

      bill_category_id: [null, [Validators.required]],
      // tax_id: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)]],
      bill_period_time: [null, [Validators.required]],
      fees: [null],
      remark: [null],
      customer_contract_code: [null, [Validators.required]] // 合同编号
      // mail: [null, [Validators.email]],
      // company_id: [ this.companyId, [Validators.required] ]
    });

    this.validateForm.get('fees').valueChanges.pipe(debounceTime(300)).subscribe((fees: any) => {
      if (fees) {
        if (fees.length !== 0) {
          this.taxFeeCount = fees.reduce((total: number, currentValue: any) => {
            return total + currentValue.amount;
          }, 0)
          this.validateForm.get('amount').setValue(this.taxFeeCount);
        }
      }
    })
  }

  customerValueChange():void {
    [this.customer] = this.projectDetailInfo.customer.filter( v => v.id === this.customer_id);
  }

  submitForm(): void {
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsDirty();
    //   this.validateForm.controls[i].updateValueAndValidity();
    // }

    console.log(this.validateForm, 'count', this.taxFeeCount);

    if (this.validateForm.valid && this.customer) {
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
    this.settingsConfigService.post('/api/bill/submit', { bill_id: this.billId }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('提交成功');
        this.router.navigateByUrl('/bill/apply/in_progress');
      }
    })
  }

  create() {
    const opt: any = this.validateForm.value;

    let option: any = {
      project_id: this.projectId,
      customer_id: this.customer.id,
      bill_category_id: opt.bill_category_id,
      bill_period_start_time: opt.bill_period_time.start,
      bill_period_end_time: opt.bill_period_time.end,
      amount: opt.fees.length !== 0 ? this.taxFeeCount : +opt.amount,
      fees: opt.fees,
      remark: opt.remark,
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

    let option: any = {
      bill_id: this.billId,
      customer_id: this.customer_id,
      bill_category_id: opt.bill_category_id,
      bill_period_start_time: opt.bill_period_time.start,
      bill_period_end_time: opt.bill_period_time.end,
      amount: opt.fees.length !== 0 ? this.taxFeeCount : +opt.amount,
      fees: opt.fees,
      remark: opt.remark,
      customer_contract_code: opt.customer_contract_code
    };

    this.settingsConfigService.post('/api/bill/update', option).subscribe((res: ApiData) => {
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('更新成功');
        this.router.navigateByUrl(`/bill/apply/invoices/list/${this.projectId}`);
      } else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  setFormValue(data: any): void {
    console.log(data);
    this.validateForm.patchValue({
      bill_category_id: data.bill_category.id,
      amount: data.amount,
      // fees: data.fees ? data.fees : null,
      bill_period_time: {
        start: data.bill_period_start_time,
        end: data.bill_period_end_time
      },
      remark: data.remark,
      customer_contract_code: data.customer_contract_code ? data.customer_contract_code : null
    });
  }

  getBillInfo(): void {
    this.settingsConfigService.get(`/api/bill/${this.billId}`).subscribe((res: ApiData) => {
      console.log('billInfo, ', res.data);
      if (res.code === 200) {
        this.billInfo = res.data;
        this.setFormValue(this.billInfo);
        this.customer_id = this.billInfo.customer.id;
        this.customerValueChange();
      }
    })
  }
  getBillFees(): void {
    this.settingsConfigService.get(`/api/bill/fee/${this.billId}`).subscribe((res: ApiData) => {
      console.log('bill fee, ', res.data);
      if (res.code === 200) {
        this.validateForm.patchValue({
          fees: res.data.bill_fee
        })
      }
    })
  }

  getConfigs(): void {
    // 获取客户单位 信息详情
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res: ApiData) => {
      console.log('projectDetailInfo, ', res.data);
      if (res.code === 200) {
        this.projectDetailInfo = res.data;
        this.getTaxInCompany(this.projectDetailInfo.company.id);
        // 发票的服务名称和项目是创建时已经绑定好了的，所以同一项目下的发票 服务名称不可改变
        this.getSubTaxFees(this.projectDetailInfo.budget.tax.id);
      }
    })

    // 获取开票类型
    this.settingsConfigService.get(`/api/bill/category/all`).subscribe((res: ApiData) => {
      console.log('bill/category, ', res.data);
      if (res.code === 200) {
        this.billCategoryArray = res.data.bill_category;
      }
    })
  }

  getTaxInCompany(id: number): void {
    this.settingsConfigService.get(`/api/tax/company/${id}`).subscribe((res: ApiData) => {
      console.log(res.data);
      if (res.code === 200) {
        this.taxArray = res.data.tax;
      }
    });
  }

  getSubTaxFees(id: number) {

    this.settingsConfigService.get(`/api/tax/fee/${id}`).subscribe((res: ApiData) => {
      console.log(res.data);
      if (res.code === 200) {
        let data: any[] = res.data.tax_fee;
        if (data.length !== 0) {
          this.taxFeeArray = data.filter(v => v.active).sort((a: any, b: any) => a.sequence - b.sequence);
          this.validateForm.get('amount').disable();
          this.validateForm.get('amount').setValue(0);
        } else {
          this.taxFeeArray = [];
          this.validateForm.get('fees').setValue([]);
          this.validateForm.get('amount').enable();
        }

      }
    });
  }

  cancel() {}

  
  // 附件上传
  attachment: any[] = [];
  isAttachmentChange: boolean = false;
  attachmentChange(option: any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if (this.billId) {
      this.bindAttachment(this.billId, true);
    }
  }

  bindAttachment(bill_id: number, isRefer: boolean = false) {
    const opt: any = {
      attachment_ids: this.attachment.map(v => v.id),
      project_id: this.projectId,
      bill_id: bill_id,
      is_basic: false
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
          this.router.navigateByUrl(`/bill/apply/invoices/list/${this.projectId}`);
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/bill/${this.billId}`).subscribe((res: ApiData) => {
      console.log('项目 基础附件：', res);
      if (res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }

  attachmentCategory: List[] = [];
  getCategoryList() {
    const opt: any = {
      is_project: false,
      is_contract: false,
      is_pay: false,
      is_bill: true
    };
    this.settingsConfigService.post('/api/attachment/category/list', opt).pipe(
      filter(v => v.code === 200),
      map(v => v.data)
    ).subscribe(data => {
      const cateArrData: any[] = data.attachment_category;
      this.attachmentCategory = cateArrData.sort((a: any, b: any) => a.sequence - b.sequence).map(v => {
        return { id: v.id, name: v.name }
      });

    });

  }
}
