import { Component, Input, OnChanges } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { NoContractSupplierComponent } from '../no-contract-supplier/no-contract-supplier.component';

@Component({
  selector: 'app-supplier-no-contract-list',
  templateUrl: './supplier-no-contract-list.component.html',
  styleUrls: ['./supplier-no-contract-list.component.less']
})
export class SupplierNoContractListComponent implements OnChanges {
  @Input() projectInfo: any;
  @Input() supplierList: any[];

  @Input() isView?: boolean = false;

  treatyList: any[] = [];
  selectedOption:{ [key:string]: boolean } = {};
  isShowList:boolean = false;

  loadingTreaty: boolean = false;

  constructor(
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges() {
    if(this.projectInfo) {
      this.getDataList();
    }
  }

  addContract(): void {
    // console.log(isContract, '新增有无合约');
    this.creatNoContractComponent();
  }

  editContract(data: any): void {
    this.creatNoContractComponent(data);
  }

  creatNoContractComponent(data?: any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '非合约预算',
      nzWrapClassName: 'modal-lg',
      nzContent: NoContractSupplierComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        supplierList: this.supplierList,
        projectInfo: this.projectInfo,
        selectedOption: this.selectedOption
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getDataList();
      }
    });
  }


  getDataList() {
    this.loadingTreaty = true;
    this.settingsConfigService.get(`/api/treaty/${this.projectInfo.id}`).subscribe((res: ApiData) => {
      // console.log(res, 'get treaty list  by supplier info!');
      this.loadingTreaty = false;
      if (res.code === 200) {
        const treatyList:any[] = res.data.treaty;
        this.treatyList = treatyList.filter(v => v.active); // 只显示有效的数据
        this.treatyList.forEach( v => this.selectedOption[v.supplier.id] = true );
        if(this.treatyList.length === 0 && this.isView) {
          this.isShowList = false;
        }else {
          this.isShowList = true;
        }
      }
    })
  }


  disabled(data:any): void {
    const opt: any = {
      treaty_id: data.id
    };
    this.settingsConfigService.post(`/api/treaty/disable`, opt).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('非合约禁用成功');
        this.treatyList = this.treatyList.filter(v => v.id !== data.id);
        this.selectedOption[data.supplier.id] = false; 
      } else {
        this.msg.error(res.error || '禁用失败');
      }
    })

  }


  cancel(): void { }
}
