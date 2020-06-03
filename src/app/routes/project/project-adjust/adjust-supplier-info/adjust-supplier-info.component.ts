import { Component, OnChanges, Input } from '@angular/core';
import { _HttpClient, SettingsService } from '@delon/theme';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ApiData } from 'src/app/data/interface.data';
import { ProjectSupplierFormComponent } from '../../component/project-supplier/component/project-supplier-form/project-supplier-form.component';
import { AdjustSupplierFormCComponent } from './adjust-supplier-form-c/adjust-supplier-form-c.component';

@Component({
  selector: 'app-adjust-supplier-info',
  templateUrl: './adjust-supplier-info.component.html',
  styles: [
  ]
})
export class AdjustSupplierInfoComponent implements OnChanges {

  @Input() projectInfo:any;
  @Input() logInfo:any[] = [];
  
  supplier:any = null;
  
  showContractExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示
  showNoContractExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settings: SettingsService,
    private settingsConfigService: SettingsConfigService
  ) { }

  ngOnChanges() {
    if(this.projectInfo) {
      console.log('supplier info works!')
      this.getSupplierInfo();
    }
  }

  getSupplierInfo():void {

    this.settingsConfigService.get(`/api/supplier/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.supplier = res.data.supplier;
        // 是否默认展示供应商下 合约列表数据
        this.supplier.forEach(item => (this.showContractExpand[item.id] = true));
        this.supplier.forEach(item => (this.showNoContractExpand[item.id] = true));
        
        if(this.logInfo) {
          this.matchInfo();
        }else {
          this.logInfo = [];
        }
      }
    })
  }

  matchInfo() {
    console.log('match', this.logInfo, this.supplier);
  }

  showContract(id:number):void { // 切换供应商合约展示 与否 ？
    this.showContractExpand[id] = !this.showContractExpand[id];
  }
  showNoContract(id:number):void { // 切换供应商合约展示 与否 ？
    this.showNoContractExpand[id] = !this.showNoContractExpand[id];
  }

  
  addSupplier():void {
    this.creatModalComponent();
  }

  editSupplier(data:any):void {
    this.creatModalComponent(data);
  }

  creatModalComponent(data?:any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '供应商',
      nzWrapClassName: 'modal-lg',
      nzContent: AdjustSupplierFormCComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        supplierArray: this.supplier
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
        console.log(result.data);
        const changeData = result.data;
        // 判断修改信息里面有无当前数据， 如有，则替换， 无则修改。
        if(!this.judgeInfo(changeData.id)) {
          
          this.logInfo.push(changeData);
        }else {
          this.logInfo = this.logInfo.map( v => {
            if( v.id === changeData.id) {
              v = changeData;
            }
            return v;
          });
        }
        console.log(this.logInfo);
      }
    });
  }

  // 判断数组对象里面 是否 存在 id = x 的元素
  judgeInfo(id:number):boolean {
    let isData:boolean = false;
    if(this.logInfo && this.logInfo.length !== 0) {
      const supplierIds:number[] = this.logInfo.map(v => v.id);
      isData = supplierIds.includes(id);
    }else {
      isData = false;
    }
    
    return isData;
  }

}
