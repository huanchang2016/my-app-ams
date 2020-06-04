import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { HasContractSupplierComponent } from '../has-contract-supplier/has-contract-supplier.component';

@Component({
  selector: 'app-supplier-contract-list',
  templateUrl: './supplier-contract-list.component.html',
  styleUrls: ['./supplier-contract-list.component.less']
})
export class SupplierContractListComponent implements OnInit {
  @Input() projectInfo: any;
  @Input() supplierInfo: any;
  @Input() isView?: boolean = false;
  @Input() serviceCategory?: any[];

  contractList: any[] = [];

  loadingContract: boolean = false;

  constructor(
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) {

  }

  ngOnInit() {
    this.getHasContractDataList();
    // this.getNoContractDataList();
  }

  addContract(): void {
    this.creatHasContractComponent();
  }

  creatHasContractComponent(data?: any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '合约预算',
      nzWrapClassName: 'modal-lg',
      nzContent: HasContractSupplierComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        supplierInfo: this.supplierInfo,
        projectInfo: this.projectInfo,
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
        const conList:any[] = res.data.contract;
        this.contractList = conList.filter( v => v.active );
      }
    })
  }

  editContract(data: any): void {
    this.creatHasContractComponent(data);
  }

  disabled(id: number): void {
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
