import { Component, TemplateRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NzModalService, NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { SettingsService } from '@delon/theme';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-income-type-amount',
  templateUrl: './project-income-type-amount.component.html',
  styles: [
  ]
})
export class ProjectIncomeTypeAmountComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private modalService: NzModalService
  ) {

    this.validateIncomeForm = this.fb.group({
      tax_id: [null, [Validators.required]],
      income: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    this.validateIncomeForm.valueChanges.subscribe(_ => {
      if (this.tax_id.value && this.income.value) {
        const currentTax = this.taxList.filter(v => v.id === this.tax_id.value)[0];
        this.currentModalInfo = {
          rate: currentTax.rate * 100,
          invoice: currentTax.invoice,
          income: this.income.value / (1 + currentTax.rate) * currentTax.rate
        };
        console.log(this.currentModalInfo);
      } else {
        this.currentModalInfo = null;
      }
    })
  }

  get tax_id() {
    return this.validateIncomeForm.controls.tax_id;
  }

  get income() {
    return this.validateIncomeForm.controls.income;
  }

  @Input() taxList: any[];
  @Input() revenueId: number;

  @Output() incomeStatisticsChange: EventEmitter<any> = new EventEmitter();

  projectIncomeList: any[] = [];

  total: number = null;

  currentModalInfo: any = null;

  // 新增 预算成本
  tplModal: NzModalRef;

  validateIncomeForm: FormGroup;

  editDataInfo: any = null;

  ngOnInit() {
    this.getProjectIncomeList();
  }

  getProjectIncomeList() {
    this.settingsConfigService.get(`/api/project_revenue_detail/revenue/${this.revenueId}`).subscribe((res: ApiData) => {
      console.log(res, '通过项目收入获取详情');
      if (res.code === 200) {
        this.projectIncomeList = res.data.project_revenue_detail;
        this.countCostTotal();
        this.dealtaxList();
      }
    });
  }

  deletedCostItem(i: number, id?: number) {
    if (id) {
      this.projectIncomeList.splice(i, 1);
      this.dealtaxList();
    }
    this.countCostTotal();
  }

  createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent, data?: any): void {
    if (data) {
      this.editDataInfo = data;
      this.setForm();
    }
    e.preventDefault();
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  handleOk(): void {
    this.submitForm();
  }

  closeModal(): void {
    this.editDataInfo = null;
    this.tplModal.destroy();
    this.validateIncomeForm.reset();
  }


  countCostTotal() {
    this.total = this.projectIncomeList.map(v => v.exclude_tax_income).reduce((sum1: number, sum2: number) => sum1 + sum2, 0);
    const pro_income = this.projectIncomeList.map(v => v.income).reduce((sum1: number, sum2: number) => sum1 + sum2, 0);
    const tax_amount = this.projectIncomeList.map(v => v.tax_amount).reduce((sum1: number, sum2: number) => sum1 + sum2, 0);
    this.incomeStatisticsChange.emit({
      pro_income,
      tax_amount,
      exclude_tax_income: this.total // 不含税收入
    });
  }
  submitForm(): void {
    for (const key in this.validateIncomeForm.controls) {
      this.validateIncomeForm.controls[key].markAsDirty();
      this.validateIncomeForm.controls[key].updateValueAndValidity();
    }
    if (this.validateIncomeForm.valid) {
      const value = this.validateIncomeForm.value;
      // 添加成本预算后， 当前 成本类型就变成不可选
      this.taxList = this.taxList.map(v => {
        if (v.id === value.id) {
          v.active = true;
        }
        return v;
      });

      let opt: any = {
        tax_id: value.tax_id,
        income: Number(value.income)
      };
      console.log('opt', opt, this.projectIncomeList);
      if (this.editDataInfo) {
        this.edit(opt);
      } else {
        this.create(opt);
      }
      // this.projectIncomeList.push(opt);
      // this.emitData();
      // this.closeModal();
    }
  }

  create(obj: any) {
    const opt: any = Object.assign(obj, { project_revenue_id: this.revenueId })
    this.settingsConfigService.post(`/api/project_revenue_detail/create`, opt).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        this.msg.success('添加成功');
        this.getProjectIncomeList();
        this.closeModal();
      }
    });
  }

  edit(obj: any) {
    const opt: any = Object.assign(obj, { project_revenue_detail_id: this.editDataInfo.id })
    this.settingsConfigService.post(`/api/project_revenue_detail/update`, opt).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        this.msg.success('添加成功');
        this.getProjectIncomeList();
        this.closeModal();
      }
    });
  }

  dealtaxList() {
    const list: any[] = this.taxList;
    this.taxList = list.map(v => {
      return {
        ...v,
        active: this.checkIsSelectedCost(v.id)
      }
    })
  }

  checkIsSelectedCost(id: number): boolean {
    if (this.projectIncomeList && this.projectIncomeList.length !== 0) {
      return this.projectIncomeList.filter(v => v.tax.id === id).length > 0;
    }
    return false;
  }


  confirm(id: number): void {
    const opt: any = { project_revenue_detail_id: id };
    this.settingsConfigService.post('/api/project_revenue_detail/disable', opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('禁用成功');
        this.getProjectIncomeList();
      }
    });
  }

  cancel(): void { }

  setForm() {
    console.log(this.editDataInfo);
    this.validateIncomeForm.patchValue({
      tax_id: this.editDataInfo.tax.id,
      income: this.editDataInfo.income
    });
  }
}
