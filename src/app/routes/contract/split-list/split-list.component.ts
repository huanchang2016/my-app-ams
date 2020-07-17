import { Component, OnChanges, Input, OnDestroy, TemplateRef, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ApiData } from 'src/app/data/interface.data';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-contract-split-list',
  templateUrl: './split-list.component.html',
  styles: [`
    :host ::ng-deep .ant-table-wrapper .ant-table {
      margin: 0!important;
    }
  `]
})
export class ContractSplitListComponent implements OnChanges, OnInit, OnDestroy {

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private modalService: NzModalService
  ) { }

  @Input() contract_id: number;
  @Input() is_view: boolean = false;
  @Input() maxAmount: number;
  @Input() companyList: any[] = [];

  dataSet: any[] = [];
  loading: boolean = true;
  departLoading: boolean = false;
  submitLoading: boolean = false;

  requestList$: Observable<ApiData>;

  getDataList$: Subscription;

  validateForm: FormGroup;

  listTotalAmount: number = 0;

  // 新增 预算成本
  tplModal: NzModalRef;

  editDataInfo: any;
  configsOption: any = {
    department: []
  };

  ngOnChanges() {
    if (this.contract_id) {
      this.requestList$ = this.settingsConfigService.get(`/api/split_contract/contract/${this.contract_id}`);
      this.getDatalis();
    }
  }

  ngOnInit() {

    this.validateForm = this.fb.group({
      company_id: [null, [Validators.required]],
      department_id: [null, [Validators.required]],
      amount: [null, [Validators.required, this.confirmValidator, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });
  }

  openTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent, data?: any): void {
    if (data) {
      this.editDataInfo = data;
      this.setForm();
    }
    this.countMaxTotal(); // 每次打开 表单，需要重新计算 可以设置的金额最大值
    e.preventDefault();
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('')
    });
  }

  handleOk(): void {
    this.submitForm();
  }

  submitForm(): void {
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
      this.validateForm.controls[key].updateValueAndValidity();
    }
    const value = this.validateForm.value;

    console.log('opt', value);
    if (this.validateForm.valid) {
      this.submitLoading = true;
      if (this.editDataInfo) {
        this.edit(value);
      } else {
        this.create(value);
      }
    }
  }

  create(data: any): void {
    const opt = {
      contract_id: this.contract_id,
      company_id: data.company_id,
      department_id: data.department_id,
      amount: +data.amount
    };
    this.settingsConfigService.post('/api/split_contract/create', opt).subscribe((res: ApiData) => {
      console.log('add split contract', res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('创建成功');
        this.getDatalis();
        this.closeModal();
      } else {
        this.msg.error(res.error || '创建失败');
      }
    })
  }

  edit(data: any): void {
    const opt = {
      split_contract_id: this.editDataInfo.id,
      amount: +data.amount
    };
    this.settingsConfigService.post('/api/split_contract/update', opt).subscribe((res: ApiData) => {
      console.log('update split contract', res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('更新成功');
        this.getDatalis();
        this.closeModal();
      } else {
        this.msg.error(res.error || '更新失败');
      }
    })
  }

  disabled(id: number): void {
    this.settingsConfigService.post('/api/split_contract/disable', { split_contract_id: id })
      .subscribe((res: ApiData) => {
        if (res.code === 200) {
          this.msg.success('禁用成功');
          this.dataSet = this.dataSet.filter(v => v.id !== id);
        } else {
          this.msg.error(res.error || '禁用失败')
        }
      });
  }

  cancel() { }

  setForm() {
    console.log(this.editDataInfo);
    this.validateForm.patchValue({
      company_id: this.editDataInfo.company.id,
      department_id: this.editDataInfo.department.id,
      amount: this.editDataInfo.amount
    });
  }

  closeModal(): void {
    this.editDataInfo = null;
    this.tplModal.destroy();
    this.validateForm.reset();
  }

  selectedCompanyChange(id: number) {
    if (id) {
      this.getConfigs(id);
    }
  }

  getConfigs(companyId: number) {
    // 根据单位id  获取  部门  服务商类型  合同类型
    this.departLoading = true;
    this.settingsConfigService.get(`/api/department/${companyId}`).pipe(
      map(v => v.data.department)
    ).subscribe(department => {
      this.departLoading = false;
      this.configsOption = {
        department: department
      };
    })
  }

  getDatalis() {
    this.loading = true;
    this.getDataList$ = this.requestList$.pipe(
      map(v => v.data)
    ).subscribe(data => {
      this.loading = false;
      console.log(data, 'split_contract');
      this.dataSet = data.split_contract;
      this.countMaxTotal();
    });
  }

  countMaxTotal() {
    if (this.dataSet && this.dataSet.length !== 0) {
      const total: number = this.dataSet.map(item => item.amount).reduce((a, b) => a + b, 0);
      this.listTotalAmount = Number((this.maxAmount - total).toFixed(2));
      if (this.editDataInfo) {
        this.listTotalAmount += this.editDataInfo.amount;
      }
    } else {
      this.listTotalAmount = this.maxAmount;
    }
  }

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (+control.value > this.listTotalAmount) {
      return { confirm: true, error: true };
    }
    return {};
  };

  ngOnDestroy() {
    this.getDataList$.unsubscribe();
  }


}
