import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { HasContractSupplierComponent } from '../has-contract-supplier/has-contract-supplier.component';
import { NoContractSupplierComponent } from '../no-contract-supplier/no-contract-supplier.component';

@Component({
  selector: 'app-supplier-no-contract-list',
  templateUrl: './supplier-no-contract-list.component.html',
  styleUrls: ['./supplier-no-contract-list.component.less']
})
export class SupplierNoContractListComponent implements OnInit {
  @Input() projectInfo: any;
  @Input() supplierInfo: any;
  @Input() isView?: boolean = false;
  @Input() serviceCategory?: any[];

  treatyList: any[] = [];

  loadingTreaty: boolean = false;

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) {

  }

  ngOnInit() {
    this.getNoContractDataList();
  }

  addContract(): void {
    // console.log(isContract, '新增有无合约');
    this.creatNoContractComponent();
  }

  creatNoContractComponent(data?: any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '非合约预算',
      nzWrapClassName: 'modal-lg',
      nzContent: NoContractSupplierComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        supplierInfo: this.supplierInfo,
        projectInfo: this.projectInfo,
        serviceCategoryArray: this.serviceCategory
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getNoContractDataList();
      }
    });
  }

  isShowList:boolean = false;

  getNoContractDataList() {
    const opt: any = {
      project_id: this.projectInfo.id,
      supplier_id: this.supplierInfo.id
    };
    this.loadingTreaty = true;
    this.settingsConfigService.post(`/api/treaty/supplier`, opt).subscribe((res: ApiData) => {
      // console.log(res, 'get treaty list  by supplier info!');
      this.loadingTreaty = false;
      if (res.code === 200) {
        const treatyList:any[] = res.data.treaty;
        this.treatyList = treatyList.filter(v => v.active); // 只显示有效的数据
        if(this.treatyList.length === 0 && this.isView) {
          this.isShowList = false;
        }else {
          this.isShowList = true;
        }
      }
    })
  }

  editContract(data: any): void {
    this.creatNoContractComponent(data);
  }

  disabled(id: number): void {
    const opt: any = {
      treaty_ids: [id]
    };
    this.settingsConfigService.post(`/api/treaty/disable`, opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('非合约禁用成功');
        this.treatyList = this.treatyList.filter(v => v.id !== id);
      } else {
        this.msg.error(res.error || '禁用失败');
      }
    })

  }

  cancel(): void { }
}
