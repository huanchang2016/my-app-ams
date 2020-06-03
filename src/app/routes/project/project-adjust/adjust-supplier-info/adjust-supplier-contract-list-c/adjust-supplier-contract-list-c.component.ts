import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { AdjustSupplierContractFormCComponent } from '../adjust-supplier-contract-form-c/adjust-supplier-contract-form-c.component';

@Component({
  selector: 'app-adjust-supplier-contract-list-c',
  templateUrl: './adjust-supplier-contract-list-c.component.html',
  styleUrls: ['./adjust-supplier-contract-list-c.component.less']
})
export class AdjustSupplierContractListCComponent implements OnInit {
  @Input() projectInfo: any;
  @Input() supplierInfo: any;
  @Input() serviceCategory?: any[];

  contractList: any[] = [];

  loadingContract: boolean = false;
  loadingTreaty: boolean = false;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnInit() {
    this.getHasContractDataList();
  }

  addContract(isContract: boolean): void {
    // console.log(isContract, '新增有无合约');
    if (isContract) {
      this.creatHasContractComponent();
    }

  }

  creatHasContractComponent(data?: any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '合约预算',
      nzWrapClassName: 'modal-lg',
      nzContent: AdjustSupplierContractFormCComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        serviceCategoryArray: this.serviceCategory
      },
      nzFooter: []
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getHasContractDataList();
      }
    });
  }

  getHasContractDataList() {
    const opt: any = {
      project_id: this.projectInfo.id,
      supplier_id: this.supplierInfo.id
    };
    this.loadingContract = true;
    this.settingsConfigService.post(`/api/contract/supplier`, opt).subscribe((res: ApiData) => {
      // console.log(res, 'get contract list  by supplier info!');
      this.loadingContract = false;
      if (res.code === 200) {
        const conList: any[] = res.data.contract;
        this.contractList = conList.filter(v => v.active);
      }
    })
  }

  editContract(data: any, isContract: boolean): void {
    if (isContract) {
      this.creatHasContractComponent(data);
    }
  }

  disabled(id: number, isContract: boolean): void {
    const obj: any = {
      contract_ids: [id]
    };
    this.settingsConfigService.post(`/api/contract/disable`, obj).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('合约禁用成功');
        this.contractList = this.contractList.filter(v => v.id !== id);
      } else {
        this.msg.error(res.error || '禁用失败');
      }
    })

  }

  cancel(): void { }
}
