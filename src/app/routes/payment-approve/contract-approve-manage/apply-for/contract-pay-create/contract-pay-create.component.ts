import { Component, OnInit, TemplateRef } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { filter, map } from 'rxjs/operators';
import { SettingsService } from '@delon/theme';

@Component({
  selector: 'app-contract-pay-create',
  templateUrl: './contract-pay-create.component.html',
  styles: [`
    nz-form-label {
      min-width: 120px;
    }
    nz-form-control {
        flex-grow: 1;
    }
  `]
})
export class ContractPayCreateComponent implements OnInit {
  listOfData: any[] = [];

  costlist: any[] = []; // 所有成本数据 

  projectInfo: any = null;
  projectId: number = null;

  contract_pay_id: number = null;

  contractInfo: any = null;  // 合同信息
  contract_id: number = null; //  选择的合同id
  selectedContract: any = null;
  contractList: any[] = [];

  costArr: any[] = []; // 所有的成本列表  需要通过预算（通过项目） 获取

  pageTitle:string = '';

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private settings: SettingsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.projectId = +params['id'];
        this.getProjectInfo();
        this.getContractList();
        this.getBudgetInfo();
      }
    });
  }
  submitLoading: boolean = false;


  ngOnInit() {

    this.validateCostForm = this.fb.group({
      cost_id: [null, [Validators.required]],
      amount: [null, [Validators.required, this.confirmationAmountValidator]],
      remark: [null]
    });
    this.getCategoryList();

    // 当成本类型发生变化时，支付金额也有限制输入
    this.validateCostForm.get('cost_id').valueChanges.subscribe((cost_id: number) => {
      if (cost_id) {
        this.currentSelectCost = this.costArr.filter(v => v.id === cost_id)[0];
        console.log(this.currentSelectCost)
      }
    });
  }

  currentSelectCost: any = null;
  confirmationAmountValidator = (control: FormControl): { [s: string]: boolean } => {

    if (!this.currentSelectCost) {
      return { required: true };
    } else {
      const max: number = this.currentSelectCost.max - this.currentSelectCost.pay_amount;
      const amount: number = Number(control.value);
      if (!amount) {
        return { required: true };
      } else if (amount > max || amount > this.selectedContract.amount) {
        return { confirm: true, error: true };
      }
      return {};
    }


  };

  contractValueChange() {
    [this.selectedContract] = this.contractList.filter(v => v.id === this.contract_id);
    this.transferAmount(this.selectedContract.amount);
  }

  getContractList(): void { // 通过项目获取合约
    this.settingsConfigService.get(`/api/contract/project/${this.projectId}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.contractList = res.data.contract;
        // 如果有 contract_pay_id 参数， 则表示为编辑 合约支付
        this.activatedRoute.queryParams.subscribe(params => {
          if (params && params['contract_pay_id']) {
            this.contract_pay_id = +(params['contract_pay_id']);
            this.pageTitle = '编辑合约支付申请';
            this.getContractPayDetail();
            this.getContractPayment();
            this.getAttachment();
          }else {
            this.pageTitle = '新增合约支付申请';
          }
        })
      }
    })
  }

  getContractPayDetail(): void {
    this.settingsConfigService.get(`/api/contract/pay/detail/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付信息');
        if (res.code === 200) {
          this.contractInfo = res.data;
          this.contract_id = res.data.contract.id;
          [this.selectedContract] = this.contractList.filter(v => v.id === this.contract_id);
          this.transferAmount(this.selectedContract.amount);

          if(!this.contractInfo.draft) {
            this.getWorkflow();
          }
        }
      })
  }
  getContractPayment() {
    this.settingsConfigService.get(`/api/contract/payment/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付详情列表');
        if (res.code === 200) {
          const contractPayment: any[] = res.data.contract_payment;
          this.listOfData = contractPayment;

        }
      })
  }

  getProjectInfo() { // 项目基础信息
    this.settingsConfigService.get(`/api/project/detail/${this.projectId}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.projectInfo = res.data;
      }
    })
  }

  getBudgetInfo() { // 获取预算信息， 然后获取当前项目下的成本
    this.settingsConfigService.get(`/api/budget/project/${this.projectId}`).subscribe((res: ApiData) => {
      // console.log(res);
      if (res.code === 200) {
        // this.setFormValue(res.data);
        const budget: any = res.data;
        this.getCostArrByBudgetId(budget.id);
      }
    })
  }
  getCostArrByBudgetId(id: number): void {
    this.settingsConfigService.get(`/api/cost/budget/${id}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        const cost: any[] = res.data.cost;
        this.costlist = cost;
        this.dealCostSelectArr(cost);
      }
    })
  }

  // 新增 成本支付
  tplModal: NzModalRef;

  validateCostForm: FormGroup;

  addPaymentCost(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent): void {
    e.preventDefault();
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }
  edit(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, data: any): void {
    // 将 之前 禁用的 成本类型  disabled  ===> false
    this.isEditCost = true;
    this.costArr = this.costArr.map(v => {
      if (v.id === data.cost.id) {
        v.disabled = false;
      }
      return v;
    })
    this.resetForm(data);
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  handleOk(): void {
    this.submitForm();
  }

  closeModal(): void {
    this.currentSelectCost = null;
    this.isEditCost = false;
    this.tplModal.destroy();
    this.validateCostForm.reset();
  }

  isEditCost: boolean = false;

  submitForm(): void {
    for (const key in this.validateCostForm.controls) {
      this.validateCostForm.controls[key].markAsDirty();
      this.validateCostForm.controls[key].updateValueAndValidity();
    }
    if (this.validateCostForm.valid) {
      const value: any = this.validateCostForm.value;

      // 添加成本预算后， 当前 成本类型就变成不可选
      this.costArr = this.costArr.map(v => {
        if (v.id === value.cost_id) {
          v.disabled = true;
        }
        return v;
      });

      let remark: string = value.remark || '';
      // 列表渲染数据
      const selectCost: any = this.costlist.filter(v => v.id === value.cost_id)[0];

      let _list: any[] = this.listOfData.filter(v => v.cost.id !== value.cost_id);

      // _list.push(Object.assign(selectCost, {
      //     current_pay_amount: Number(value.amount),
      //     remark: remark.trim()
      //   })
      // );
      _list.push({
        cost: selectCost,
        amount: Number(value.amount),
        remark: remark.trim()
      })

      this.listOfData = [..._list];
      console.log(this.listOfData)
      this.closeModal();
    }
  }

  submitPayAmount() {
    this.submitLoading = true;
    console.log('contract_id: ', this.contract_id, 'project_id: ', this.projectId, 'payment: ', this.listOfData);

    if (!this.contract_pay_id) {

      this.createContractPay();
    } else {
      this.updateContractPay();
    }

  }

  createContractPay() {
    const payment: any[] = this.listOfData.map(v => {
      return {
        cost_id: v.cost.id,
        amount: v.amount,
        remark: v.remark
      }
    });
    const option: any = {
      project_id: this.projectId,
      contract_id: this.contract_id,
      payment: payment
    };
    this.settingsConfigService.post('/api/contract/pay/create', option).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        // this.msg.success('提交成功');
        // this.router.navigateByUrl(`/approve/contract/apply/pay/${this.projectId}`);

        this.bindAttachment(res.data.id);
      }
    });
  }
  updateContractPay() {
    const payMent: any[] = this.listOfData.map(v => {
      return {
        contract_payment_id: v.id ? v.id : null,
        cost_id: v.cost.id,
        amount: v.amount,
        remark: v.remark
      }
    });
    const opt: any = {
      contract_pay_id: this.contract_pay_id,
      payment: payMent
    };
    this.settingsConfigService.post('/api/contract/pay/update', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('更新成功');
        this.router.navigateByUrl(`/approve/contract/apply/pay/${this.projectId}`);
      }
    });
  }


  dealCostSelectArr(arr: any[]) {
    const list: any[] = arr;
    this.costArr = list.map(v => {
      return {
        id: v.id,
        name: v.cost_category.name,
        max: v.amount,
        pay_amount: v.pay_amount,
        disabled: this.checkIsSelectedCost(v.id)
      }
    });
    console.log(this.costArr);
  }

  checkIsSelectedCost(id: number): boolean {
    if (this.listOfData && this.listOfData.length !== 0) {
      return this.listOfData.filter(v => v.cost.id === id).length > 0;
    }
    return false;
  }

  cancel(): void { }

  delete(id: number): void {
    this.listOfData = this.listOfData.filter(v => v.cost.id !== id);
    this.costArr = this.costArr.map(v => {
      if (v.id === id) {
        v.disabled = false;
      }
      return v
    });
    this.msg.success('支付成本删除成功!');
  }

  resetForm(opt: any): void {
    this.validateCostForm.patchValue({
      cost_id: opt.cost.id,
      amount: opt.amount,
      remark: opt.remark
    });
  }

  submitContractPay(): void {
    console.log(this.contract_pay_id, '合约支付信息提交')
    this.settingsConfigService.post('/api/contract_pay/submit', { contract_pay_id: this.contract_pay_id }).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('支付信息提交成功');
        this.router.navigateByUrl(`/approve/contract/apply/pay/${this.projectId}`);
      }
    });
  }
  // 金额大写
  transferNumber: string = '';
  transferAmount(num: number) {
    console.log(num, 'sldkjfslkjdf');

    this.settingsConfigService.post(`/api/finance/transfer`, { num }).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.transferNumber = res.data.number;
      }
    });
  }

  // 附件上传
  attachment: any[] = [];
  isAttachmentChange: boolean = false;
  attachmentChange(option: any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if (this.contract_pay_id) {
      this.bindAttachment(this.contract_pay_id, true);
    }
  }

  bindAttachment(contract_pay_id: number, isRefer: boolean = false) {
    const opt: any = {
      attachment_ids: this.attachment.map(v => v.id),
      project_id: this.projectInfo.id,
      contract_pay_id: contract_pay_id,
      is_basic: false
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        if (this.contract_pay_id) {
          if (isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        } else {
          this.msg.success('提交成功');
          this.router.navigateByUrl(`/approve/contract/apply/pay/${this.projectId}`);
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/contract_pay/${this.contract_pay_id}`).subscribe((res: ApiData) => {
      console.log('项目 基础附件：', res);
      if (res.code === 200) {
        this.attachment = res.data.attachment;
      }
    })
  }

  attachmentCategory: List[] = [];
  getCategoryList() {
    const opt: any = {
      is_project: false,
      is_contract: false,
      is_pay: true,
      is_bill: false
    };
    this.settingsConfigService.post('/api/attachment/category/list', opt).pipe(
      filter(v => v.code === 200),
      map(v => v.data)
    ).subscribe(data => {
      const cateArrData: any[] = data.attachment_category;
      this.attachmentCategory = cateArrData.sort((a: any, b: any) => a.sequence - b.sequence).map(v => {
        return { id: v.id, name: v.name }
      });

    });

  }

  
  // 流程进程信息
  progressInfo:any = null;
  nodeProcess:any[] = [];
  currentNodeProcess:any = null;
  isCurrentCheck:boolean = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  getWorkflow() {
    this.settingsConfigService
        .get(`/api/contract/pay/process/${this.contract_pay_id}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'workflow');
          if(res.code === 200) {
            this.progressInfo = res.data;
            this.getNodeProcess();
          }
    })
  }

  getNodeProcess():void {
    this.isCurrentCheck = false;
    this.settingsConfigService
        .get(`/api/node/process/${this.progressInfo.id}`)
        .subscribe((res:ApiData) => {
          console.log(res, 'node_process');
          if(res.code === 200) {
            this.nodeProcess = res.data.node_process;
            this.currentNodeProcess = this.nodeProcess.filter( v => v.current)[0];
            if(this.currentNodeProcess) {
              this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
            }
          }
    })
  }
  
  executeChange(data: any) {
    console.log('执行情况信息 提交: ', data);
    const option: any = Object.assign(data, { process_id: this.progressInfo.id });
    this.settingsConfigService.post('/api/contract/pay/execute', option).subscribe((res: ApiData) => {
      console.log(res, '执行情况确认');
      if (res.code === 200) {
        this.msg.success('执行情况更新成功');
        this.settingsConfigService
          .get(`/api/contract/pay/process/${this.contract_pay_id}`)
          .subscribe((res: ApiData) => {
            if (res.code === 200) {
              this.progressInfo = res.data;
            }
          })
      }
    })
  }

}
