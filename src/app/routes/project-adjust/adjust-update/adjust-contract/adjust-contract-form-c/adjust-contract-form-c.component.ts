import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-adjust-contract-form-c',
  templateUrl: './adjust-contract-form-c.component.html',
  styles: [`
    form  {
      max-width: 600px;
      margin: 0 auto;
    }

    ::ng-deep nz-form-control {
      flex-grow: 1;
      line-height: 40px;
    }
    ::ng-deep nz-form-control .category-list {
      line-height: 40px !important;
    }
    ::ng-deep .ant-form-item-label {
        padding: 0;
        line-height: 40px;
        width: 110px;
        text-align: right;
    }
  `]
})
export class AdjustContractFormCComponent implements OnInit {

  @Input() data?: any;
  @Input() supplierList: any;
  // @Input() selectArr: any[];
  @Input() selectedOption: { [key:string]: boolean };
  @Input() selectedSplitOption: { [key:string]: boolean };

  split_selected:{ [key:string]: boolean } = {};

  validateForm: FormGroup; // 基本资料
  // submitLoading: boolean = false;

  contractList: any[] = [];
  splitContractList: any[] = [];

  is_split: boolean = true;

  limtAmount: number = 0;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
    this.validateForm = this.fb.group({
      supplier_id: [null, [Validators.required]],
      contract_id: [null, [Validators.required]],
      split_contract_id: [null],
      amount: [null, [Validators.required, this.confirmValidator, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    if (this.data) {
      
      this.getContractList(this.data.contract.supplier.id);

      this.validateForm.patchValue({
        supplier_id: this.data.contract.supplier.id,
        contract_id: this.data.contract.id,
        split_contract_id: this.data.split_contract ? this.data.split_contract.id : null,
        amount: this.data.amount
      });
      if(this.data.split_contract) {
        this.getSplitContractList(this.data.contract.id);
        this.is_split = true;
        this.limtAmount = Number((this.data.split_contract.amount - this.data.use_amount + this.data.amount).toFixed(2));
        this.limtAmount = this.limtAmount > this.data.split_contract.amount ? this.data.split_contract.amount : this.limtAmount;
      }else {
        this.is_split = false;
        this.limtAmount = Number((this.data.contract.amount - this.data.contract.pay_amount + this.data.amount).toFixed(2));
        this.limtAmount = this.limtAmount > this.data.contract.amount ? this.data.contract.amount : this.limtAmount;
      }
    }
  }

  // checkIsSelected(id: number): boolean {
  //   if(this.selectArr && this.selectArr.length !== 0) {
  //     return this.selectArr.filter(v => {
  //       if(v.split_contract) {
  //         return v.split_contract.id !== id;
  //       }else {
  //         return v.contract.id
  //       }
  //     }).length > 0;
  //   }
  //   return false;
  // }

  supplierChange(supplier_id: any):void {
    if (supplier_id) {
      this.validateForm.patchValue({
        contract_id: null,
        split_contract_id: null
      })
      this.getContractList(supplier_id);
    }
  }
  contractChange(contract_id: any):void {
    if (contract_id) {

      this.validateForm.patchValue({
        split_contract_id: null
      })
      const currentContract:any = this.contractList.filter(v => v.id === contract_id)[0];
      this.is_split = currentContract.is_split;

      if (this.is_split) {
        this.getSplitContractList(contract_id);

        this.validateForm.get('split_contract_id')!.setValidators(Validators.required);
        this.validateForm.get('split_contract_id')!.markAsDirty();
      } else {
        this.validateForm.get('split_contract_id')!.clearValidators();
        this.validateForm.get('split_contract_id')!.markAsPristine();

        // 合同不能分割到部门时，计算合同金额上限
        this.limtAmount = Number((currentContract.amount - currentContract.pay_amount).toFixed(2));
      }
      this.validateForm.get('split_contract_id')!.updateValueAndValidity();

    }
  }
  splitContractChange(split_contract_id: number):void {
    if (split_contract_id) { // 分割合同值变化时，计算合同金额上限。
      const currentSplitContract:any = this.splitContractList.filter(v => v.id === split_contract_id)[0];
      this.limtAmount = Number((currentSplitContract.amount - currentSplitContract.use_amount).toFixed(2));
    }
  }
  
  getContractList(id: number) {
    this.settingsConfigService.get(`/api/contract/supplier/${id}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.contractList = res.data.contract;
      }
    })
  }


  getSplitContractList(id: number) {
    this.settingsConfigService.get(`/api/split_contract/contract/${id}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.splitContractList = res.data.split_contract;
      }
    })
  }

  confirmValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (+control.value > this.limtAmount) {
      return { confirm: true, error: true };
    }
    return {};
  };

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      const value: any = this.validateForm.value;

      // this.submitLoading = true;
      //  请求 新增接口

      const contract:any = this.contractList.filter( v => v.id === value.contract_id)[0];
      const split_contract:any = this.splitContractList.filter( v => v.id === value.split_contract_id)[0];
      const opt: any = {
        // project_id: this.projectInfo.id,
        contract: contract,
        split_contract: split_contract ? split_contract : null,
        amount: +value.amount
      };

      this.destroyModal(opt);
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  destroyModal(data: any = null): void {
    this.modal.destroy(data);
  }

}
