import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
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
export class AdjustContractComponent implements OnChanges, OnInit {
  @Input() adjustInfo: any;
  @Input() submitLoading:boolean;
  @Output() adjustmentChange:EventEmitter<any> = new EventEmitter();

  supplierList: any[] = [];

  contractList: any[] = [];
  selectedOption:{ [key:string]: boolean } = {};
  selectedSplitOption:{ [key:string]: boolean } = {};

  constructor(
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingsConfigService: SettingsConfigService
  ) {
    this.getConfigs();
  }

  ngOnChanges() {
    if(this.adjustInfo.deal_adjustment) {
      this.contractList = this.adjustInfo.deal_adjustment.deal_adjustment;
      this.selectedItems();
    }
  }

  ngOnInit() {
    if(this.adjustInfo) {
      this.contractList = this.adjustInfo.deal_adjustment.deal_adjustment;
      this.selectedItems();
    }
  }

  selectedItems():void {
    /******
     *  如果不是分割合同，记录已选合同
     *   是分割合同，则记录分割合同  split_id
     * ******/
    this.selectedOption = {};
    this.selectedSplitOption = {};
    if(this.contractList && this.contractList.length !== 0) {
      this.contractList.forEach(v => {
        if (!v.split_contract) {
          this.selectedOption[v.contract.id] = true;
        } else {
          this.selectedSplitOption[v.split_contract.id] = true;
        }

      });
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
        // selectArr: this.contractList
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
        this.contractList = [...this.contractList];
        this.selectedItems();
      }
    });
  }

  deleted(idx: number, deal_id:number | null): void {
    // 删除时需要判断 当前数据是否可以删除， 如果可以删除，则继续删除。
    // 如果不能删除，则提示用户，当前数据不可删除。
    if(deal_id) {
      this.settingsConfigService.get(`/api/is_delete_cost_adjustment/${deal_id}`).subscribe((res:ApiData) => {
        const data = res.data;
        if(res.code === 200) {
          if(data.delete) {
            this.contractList = this.contractList.filter(v => {
              if(v.deal) {
                return v.deal.id !== deal_id;
              }else {
                return true;
              }
            });
            this.selectedItems();
          }else {
            this.msg.warning(data.msg);
          }
          
        }else {
          this.msg.warning(res.error || '删除失败');
        }
      })
    }else {
      this.contractList.splice(idx, 1);
      this.contractList = [...this.contractList];

      this.selectedItems();
    }
    
  }

  submitForm():void {
    // this.submitLoading = true;

    // setTimeout(() => {
    //   this.submitLoading = false;
    // }, 1000);
    // 处理 表单组 里面的数据
    const dealArr:any[] = this.contractList.map( v => {
      return {
        deal_adjustment_id: v.id ? v.id : null,

        contract_id: v.contract.id,
        split_contract_id: v.split_contract ? v.split_contract.id : null,
        amount: v.amount
      }
    });
    let option:any = {
      adjustment_id: this.adjustInfo.id,
      category_name: '合约调整',
      
      deal_adjustments: dealArr
    };

    // this.submitLoading = true;
    this.adjustmentChange.emit(option);

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
