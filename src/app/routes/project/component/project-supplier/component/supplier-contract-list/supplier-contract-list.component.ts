import { Component, Input, OnChanges } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { HasContractSupplierComponent } from '../has-contract-supplier/has-contract-supplier.component';

@Component({
  selector: 'app-supplier-contract-list',
  templateUrl: './supplier-contract-list.component.html',
  styleUrls: ['./supplier-contract-list.component.less']
})
export class SupplierContractListComponent implements OnChanges {
  @Input() projectInfo: any;
  @Input() supplierList: any;
  @Input() isView?: boolean = false;

  contractList: any[] = [];
  selectedOption:{ [key:string]: boolean } = {};

  loadingContract: boolean = false;

  constructor(
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) {

  }

  ngOnChanges() {
    if(this.projectInfo) {
      this.getDataList();
    }
  }

  addContract(): void {
    this.creatHasContractComponent();
  }

  editContract(data: any): void {
    this.creatHasContractComponent(data);
  }

  creatHasContractComponent(data?: any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '合约',
      nzWrapClassName: 'modal-lg',
      nzContent: HasContractSupplierComponent,
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

  isShowList:boolean = false;
  getDataList() {
    this.loadingContract = true;
    this.settingsConfigService.get(`/api/deal/project/${this.projectInfo.id}`).subscribe((res: ApiData) => {
      // console.log(res, 'get contract list  by supplier info!');
      this.loadingContract = false;
      if (res.code === 200) {
        const data:any[] = res.data.deal;
        this.contractList = data.filter( v => v.active );
        this.contractList.forEach( v => this.selectedOption[v.id] = true );
        if(this.contractList.length === 0 && this.isView) {
          this.isShowList = false;
        }else {
          this.isShowList = true;
        }
      }
    })
  }


  disabled(data:any): void {
    const obj: any = {
      deal_id: data.id
    };
    this.settingsConfigService.post(`/api/deal/disable`, obj).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.msg.success('合约禁用成功');
        this.contractList = this.contractList.filter(v => v.id !== data.id);
        this.selectedOption[data.id] = false;
      } else {
        this.msg.error(res.error || '禁用失败');
      }
    })
  }

  cancel(): void { }
}
