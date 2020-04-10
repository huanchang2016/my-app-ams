import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { SettingsConfigService } from '../../../service/settings-config.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { PaymentContractFormComponent } from '../../component/payment-contract-form/payment-contract-form.component';

@Component({
  selector: 'app-view-approve-project',
  templateUrl: './view-approve-project.component.html',
  styleUrls: ['./view-approve-project.component.less']
})
export class ViewApproveProjectComponent implements OnInit {
  projectId:number = null;

  projectInfo:any = null;

  showExpand:{ [key: string]: boolean } = {}; // 供应商 合约展示
  

  constructor(
    private modalService: NzModalService,
    public msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params:Params) => {
      if(params && params['id']) {
        this.projectId = +params['id'];
        this.getDataInfo(params['id']);
      }
    })
  }

  ngOnInit() {

  }

  addContract() :void {
    this.createComponentModal();
  }

  edit(data:any): void {
    console.log('data', data);
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '项目成本类型',
      nzContent: PaymentContractFormComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        proId: this.projectId,
        contractArr: []
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result) {
        console.log('modal close after', result);
      }
    });

  }
  
  getDataInfo(id:number):void {
    this.settingsConfigService.get(`/api/project/detail/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        console.log('project info : ', res.data);
        this.projectInfo = res.data;
        // this.getBudgetInfo(this.project.info.id);
        // this.getSupplierInfo(this.project.info.id);
      }
    })
  }

  // getBudgetInfo(proId:number):void {
  //   this.settingsConfigService.get(`/api/budget/project/${proId}`).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       const budget:any = res.data;
  //       this.settingsConfigService.get(`/api/cost/budget/${res.data.id}`).subscribe((costRes:ApiData) => {
  //         if(costRes.code === 200) {
  //           this.project.budget = Object.assign(budget, { cost: costRes.data.cost });
  //           console.log(this.project);
  //         }
  //       })
  //     }
  //   })
  // }
  
  // getSupplierInfo(proId:number):void {

  //   this.settingsConfigService.get(`/api/supplier/project/${proId}`).subscribe((res:ApiData) => {
  //     if(res.code === 200) {
  //       this.project.supplier = res.data.supplier;
  //       // 是否默认展示供应商下 合约列表数据
  //       this.project.supplier.forEach(item => (this.showExpand[item.id] = true));
  //     }
  //   })
  // }

  showContract(id:number):void { // 切换供应商合约展示 与否 ？
    this.showExpand[id] = !this.showExpand[id];
  }
}
