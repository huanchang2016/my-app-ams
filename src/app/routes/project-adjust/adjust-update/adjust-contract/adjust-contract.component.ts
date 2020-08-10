import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';
import { AdjustContractFormCComponent } from './adjust-contract-form-c/adjust-contract-form-c.component';

@Component({
  selector: 'app-adjust-contract',
  templateUrl: './adjust-contract.component.html',
  styles: [
  ]
})
export class AdjustContractComponent implements OnInit {
  @Input() adjustInfo: any;

  supplierList: any[] = [];

  contractList: any[] = [];
  selectedOption:{ [key:string]: boolean } = {};
  selectedSplitOption:{ [key:string]: boolean } = {};

  loadingContract: boolean = false;
  submitLoading: boolean = false;

  constructor(
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) {
    this.getConfigs();
  }

  ngOnInit() {
    if(this.adjustInfo) {
      this.contractList = this.adjustInfo.deal_adjustment.deal;
      this.getDataList();
    }
  }

  addContract(): void {
    this.creatHasContractComponent();
  }

  editContract(data: any, index:number): void {
    this.creatHasContractComponent(data, index);
  }

  creatHasContractComponent(data?: any, idx?:number): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '合约',
      nzWrapClassName: 'modal-lg',
      nzContent: AdjustContractFormCComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        supplierList: this.supplierList,
        selectedOption: this.selectedOption,
        selectedSplitOption: this.selectedSplitOption
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
        // 判断是新增还是 编辑  data ? 编辑 : 新增
        if(data) {
          this.contractList.splice(idx, 1, result);
        }else {
          this.contractList.push(result);
        }
      }
    });
  }

  getDataList() {
    this.loadingContract = true;
    this.settingsConfigService.get(`/api/deal/project/${this.adjustInfo.project.id}`).subscribe((res: ApiData) => {
      // console.log(res, 'get contract list  by supplier info!');
      this.loadingContract = false;
      if (res.code === 200) {
        const data:any[] = res.data.deal;
        this.contractList = data.filter( v => v.active );
        this.contractList.forEach( v => {
           /******
            *  如果不时分割合同，记录已选合同
            *   是分割合同，则记录分割合同  split_id
            * ******/
          if(!v.split_contract) {
            this.selectedOption[v.contract.id] = true;
          } else {
            this.selectedSplitOption[v.split_contract.id] = true;
          }
          
        });
      }
    })
  }


  deleted(idx:number): void {
    this.contractList.splice(idx, 1);
  }

  submitForm():void {
    console.log(this.contractList, 'submit contract list adjust');
    this.submitLoading = true;

    setTimeout(() => {
      this.submitLoading = false;
    }, 1000);
  }

  cancel(): void { }

  getConfigs():void {
    this.settingsConfigService.get('/api/company/supplier/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        let data:any[] = res.data.company;
        this.supplierList = data.filter(v => v.active).sort((a:any, b:any) => a.sequence - b.sequence);
      }
    })
  }
}
