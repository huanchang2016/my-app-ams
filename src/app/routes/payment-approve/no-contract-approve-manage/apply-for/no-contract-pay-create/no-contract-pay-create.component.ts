import { Component, OnInit, TemplateRef } from '@angular/core';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiData, List } from 'src/app/data/interface.data';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { filter, map } from 'rxjs/operators';
import { SettingsService } from '@delon/theme';

// html ===> pdf
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-no-contract-pay-create',
  templateUrl: './no-contract-pay-create.component.html',
  styles: [`
    nz-form-label {
      min-width: 120px;
    }
    nz-form-control {
        flex-grow: 1;
    }
  `]
})
export class NoContractPayCreateComponent implements OnInit {
  listOfData: any[] = [];

  costlist: any[] = []; // 所有成本数据 

  projectInfo: any = null;
  projectId: number = null;

  treaty_pay_id: number = null;
  treatypayInfo: any = null;
  treaty_id: number = null;

  treatyListArr: any[] = [];

  costArr: any[] = []; // 所有的成本列表  需要通过预算（通过项目） 获取

  pageTitle: string = '';
  
  billCategoryArray:any[] = [];

  constructor(
    public msg: NzMessageService,
    private modalService: NzModalService,
    private settingsConfigService: SettingsConfigService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private settings: SettingsService
  ) {

    this.settingsConfigService.get('/api/bill/category/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        const list:any = res.data.bill_category;
        if(list.length !== 0) {
          this.billCategoryArray = list.sort((a:any, b:any) => a.sequence - b.sequence);
        }
      }
    })

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.projectId = +params['id'];
        this.getProjectInfo(); // 项目信息
        this.getTreatyList(); // 项目下的协议信息
        this.getBudgetInfo();
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params['treaty_pay_id']) {
        this.treaty_pay_id = +(params['treaty_pay_id']);
        this.pageTitle = '编辑非合约支付';
        this.getAttachment();
      } else {
        this.pageTitle = '新增非合约支付';
      }
    })

  }
  saveLoading: boolean = false;
  submitLoading: boolean = false;

  validateTreatyForm: FormGroup;

  ifWriteOff: boolean = false;

  ngOnInit() {
    this.validateTreatyForm = this.fb.group({
      // treaty_id: new FormControl({ value: null, disabled: this.treaty_pay_id ? true : false }, Validators.required),
      pay_company: [null, [Validators.required]],
      bank_account: [null, [Validators.required]],
      bank_name: [null, [Validators.required]],
      if_write_off: [null, [Validators.required]],
      write_off_amount: [null, [Validators.required]]
    });

    this.getCategoryList();
    // 是否冲销借款   改版  冲销金额的验证
    this.validateTreatyForm.get('if_write_off').valueChanges.subscribe((if_write_off: boolean) => {
      console.log('if_write_off', if_write_off);
      if (if_write_off) {
        this.ifWriteOff = true;
      } else {
        this.ifWriteOff = false;
        this.validateTreatyForm.get('write_off_amount').setValue(0);
      }
      
    });


    this.validateCostForm = this.fb.group({
      treaty_id: [null, [Validators.required]],
      abstract: [null, [Validators.required]],
      cost_id: [null, [Validators.required]],
      amount: [null, [Validators.required, this.confirmationAmountValidator]],
      remark: [null]
    });
    
    // 当成本类型发生变化时，支付金额也有限制输入
    this.validateCostForm.get('treaty_id').valueChanges.subscribe((treaty_id: number) => {
      if (treaty_id) {
        [this.currentTreaty] = this.treatyListArr.filter( v => v.id === treaty_id);
        console.log(treaty_id , 'treaty change', this.currentTreaty);
        this.countMaxAmount();
        this.changeCostItemStatus();
      }
    });

    // 当成本类型发生变化时，支付金额也有限制输入
    this.validateCostForm.get('cost_id').valueChanges.subscribe((cost_id: number) => {
      if (cost_id) {
        console.log(cost_id, 'cost -id');
        
        this.currentSelectCost = this.costArr.filter(v => v.id === cost_id)[0];
        console.log(this.currentSelectCost, 'currentselectCost');
        this.countMaxAmount();
      }
    });

  }

  changeCostItemStatus() {
    /***
     * 供应商发生变化, 将当前供应商选择的成本类型设置为 disabled
     * ******/
    if(this.listOfData.length !== 0) {
      this.costArr = this.costArr.map(v => {
        // if (v.id === value.cost_id) {
        //   v.disabled = true;
        // }
        
        
        if(this.supplierCostFind(v.id)) {
          v.disabled = true;
        }else {
          v.disabled = false;
        }
        return v;
      });
      console.log(this.costArr);
      
    }
    
  }

  supplierCostFind(cost_id:number): boolean {
    const supplier:any[] = this.listOfData.filter(v => v.treaty.id === this.currentTreaty.id);
    return supplier.filter( v => v.cost.id === cost_id).length > 0;
  }

  max_pay_amount:number = 0;
  countMaxAmount() {
    // 计算可以支付的最大金额数
    const cost_pay:number = this.currentSelectCost ? this.currentSelectCost.max - this.currentSelectCost.pay_amount : 0;
    const treaty_pay:number = this.currentTreaty ? this.currentTreaty.amount - this.currentTreaty.use_amount : 0;
    this.max_pay_amount = Math.min(cost_pay, treaty_pay);
  }

  currentSelectCost: any = null;
  currentTreaty:any = null;
  confirmationAmountValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!this.currentSelectCost) {
      return { required: true };
    } else {
      const max: number = this.currentSelectCost.max - this.currentSelectCost.pay_amount;
      const amount: number = Number(control.value);
      if (!amount) {
        return { required: true };
      } else if (amount > max) {
        return { confirm: true, error: true };
      }
      return {};
    }
  };

  getTreatyList(): void { // 通过项目获取非合约 协议列表
    this.settingsConfigService.get(`/api/treaty/${this.projectId}`).subscribe((res: ApiData) => {
      console.log(res, '非合约 协议列表')
      if (res.code === 200) {
        this.treatyListArr = res.data.treaty;
        // 如果有 treaty_pay_id 参数， 则表示为编辑 非合约支付
        if (this.treaty_pay_id) {
          this.getTreatyPayDetail();
        }
      }
    })
  }

  getTreatyPayDetail(): void {
    this.settingsConfigService.get(`/api/treaty/pay/detail/${this.treaty_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '非合约支付信息1111');
        if (res.code === 200) {
          this.treaty_id = res.data.id;
          this.treatypayInfo = res.data;
          this.setTreatyForm(res.data);
          this.getTreatyPayment();
          if (!this.treatypayInfo.draft) {
            this.getWorkflow();
          }
        }
      })
  }
  getTreatyPayment() {
    this.settingsConfigService.get(`/api/treaty/payment/${this.treaty_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '非合约支付详情列表2222');
        if (res.code === 200) {
          const treatyPayment: any[] = res.data.treaty_payment;
          this.listOfData = treatyPayment;
        }
      })
  }
  setTreatyForm(data: any): void {
    this.validateTreatyForm.patchValue({
      // treaty_id: data.treaty.id,
      pay_company: data.pay_company,
      bank_account: data.bank_account,
      bank_name: data.bank_name,
      if_write_off: data.if_write_off,
      write_off_amount: data.write_off_amount
    });
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
      if (res.code === 200) {
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
    this.currentEditCost = data;
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

  submitCostLoading:boolean = false;
  handleOk(): void {
    this.submitCostForm();
  }

  closeModal(): void {
    this.currentSelectCost = null;
    this.isEditCost = false;
    this.currentEditCost = null;
    this.tplModal.destroy();
    this.validateCostForm.reset();
  }

  isEditCost: boolean = false;
  currentEditCost:any = null;
  editCostData:any = null;

  submitCostForm(): void {
    for (const key in this.validateCostForm.controls) {
      this.validateCostForm.controls[key].markAsDirty();
      this.validateCostForm.controls[key].updateValueAndValidity();
    }
    if (this.validateCostForm.valid) {
      this.submitCostLoading = true;

      const value: any = this.validateCostForm.value;

      // 添加成本预算后， 当前 成本类型就变成不可选
      this.costArr = this.costArr.map(v => {
        if (v.id === value.cost_id) {
          v.disabled = true;
        }
        return v;
      });
      if(this.isEditCost) {
        this.updatePayment(value);
      }else {
        this.createPayment(value);
      }
      
    }
  }

  updatePayment(opt:any) {

    const option:any = Object.assign(opt, { treaty_payment_id: this.currentEditCost.id, amount: +opt.amount });

    this.settingsConfigService.post('/api/treaty/payment/update', option).subscribe((res:ApiData) => {
      this.submitCostLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.getTreatyPayment(); // 获取详情支付列表
        this.closeModal();
      }
    })
  }
  createPayment(opt:any) {
    const option:any = Object.assign(opt, { treaty_pay_id: this.treaty_pay_id, amount: +opt.amount });

    this.settingsConfigService.post('/api/treaty/payment/create', option).subscribe((res:ApiData) => {
      this.submitCostLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.getTreatyPayment(); // 获取详情支付列表
        this.closeModal();
      }
    })
  }
  disabledPayment(id:number) {
    this.settingsConfigService.post('/api/treaty/payment/disable', { treaty_payment_id: id }).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('删除成功');
        this.listOfData = this.listOfData.filter( v => v.id !== id);
      }
    })
  }

  saveTreatyForm() {
    for (const key in this.validateTreatyForm.controls) {
      this.validateTreatyForm.controls[key].markAsDirty();
      this.validateTreatyForm.controls[key].updateValueAndValidity();
    }

    console.log(this.validateTreatyForm, '无合约协议表单数据');
    if (this.validateTreatyForm.valid) {
      this.saveLoading = true;
      if (this.treaty_pay_id) {
        this.updateTreatyPay(this.validateTreatyForm.value);
      } else {
        this.createTreatyPay(this.validateTreatyForm.value);
      }

    }else {
      this.msg.warning('协议支付信息填写不完整');
    }
  }

  createTreatyPay(data: any): void {
    let obj: any = {
      project_id: this.projectId,
      pay_company: data.pay_company,
      bank_account: data.bank_account,
      bank_name: data.bank_name,
      if_write_off: data.if_write_off,
      write_off_amount: data.if_write_off ? +data.write_off_amount : 0
    };
    this.settingsConfigService.post(`/api/treaty/pay/create`, obj).subscribe((res: ApiData) => {
      console.log(res, '新增无合约非合约支付')
      this.saveLoading = false;
      if (res.code === 200) {
        if(this.attachment.length !== 0) {
          this.bindAttachment(res.data.id);
        }else {
          this.treaty_pay_id = res.data.id;
          this.msg.success('新增成功');
          // this.router.navigateByUrl(`/approve/no-contract/list/apply/pay/edit/${this.projectId}?treaty_pay_id=${res.data.id}`);
        }
      } else {
        this.msg.error(res.error || '非合约支付提交失败');
      }
    })

  }


  updateTreatyPay(data: any) {
    const obj: any = Object.assign(data, { treaty_pay_id: this.treaty_pay_id });

    this.settingsConfigService.post(`/api/treaty/pay/update`, obj).subscribe((res: ApiData) => {
      console.log(res, '编辑无合约非合约支付审批单')
      this.saveLoading = false;
      if (res.code === 200) {
        if(this.submitLoading) {
          this.submit(res.data.id);
        }else {
          this.msg.success('保存成功');
          // this.router.navigateByUrl(`/approve/no-contract/list/apply/pay/${this.projectId}`);
        }
        
      } else {
        this.msg.error(res.error || '保存失败');
      }
    })
  }

  submit(id:number) {
    this.settingsConfigService.post('/api/treaty_pay/submit', { treaty_pay_id: id }).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('支付信息提交成功');
        this.router.navigateByUrl(`/approve/no-contract/list/apply/pay/${this.projectId}`);
      } else {
        this.msg.error(res.error || '提交失败')
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
        disabled: false // edit 
        // disabled: this.checkIsSelectedCost(v.id)
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

  resetForm(opt: any): void {
    console.log(opt);
    this.editCostData = opt;
    this.validateCostForm.patchValue({
      treaty_id: opt.treaty.id,
      abstract: opt.abstract,
      cost_id: opt.cost.id,
      amount: opt.amount,
      card_number: opt.card_number,
      account_name: opt.account_name,
      is_business_card: opt.is_business_card,
      remark: opt.remark
    });
  }

  submitContractPay(): void {
    console.log(this.treaty_pay_id, '非合约支付信息提交');
    // 提交信息前, 需要先保存数据
    this.submitLoading = true;
    this.saveTreatyForm();
  }


  // 附件上传
  attachment: any[] = [];
  isAttachmentChange: boolean = false;
  attachmentChange(option: any) {
    this.attachment.push(option);
    this.isAttachmentChange = !this.isAttachmentChange;
    if (this.treaty_pay_id) {
      this.bindAttachment(this.treaty_pay_id, true);
    }
  }

  bindAttachment(treaty_pay_id: number, isRefer: boolean = false) {
    const opt: any = {
      attachment_ids: this.attachment.map(v => v.id),
      project_id: this.projectInfo.id,
      treaty_pay_id: treaty_pay_id,
      is_basic: false
    };
    console.log(opt);
    this.settingsConfigService.post('/api/attachment/bind', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.saveLoading = false;
      if (res.code === 200) {
        if (this.treaty_pay_id) {
          if (isRefer) {
            this.msg.success('附件绑定成功');
          }
          this.getAttachment();
        } else {
          if(this.submitLoading) {
            this.submit(res.data.id);
          }else {
            this.msg.success('保存成功');
            // this.router.navigateByUrl(`/approve/no-contract/list/apply/pay/${this.projectId}`);
          }
        }
      } else {
        this.msg.error(res.error || '附件绑定失败')
      }
    })
  }

  getAttachment() {
    this.settingsConfigService.get(`/api/attachment/treaty_pay/${this.treaty_pay_id}`).subscribe((res: ApiData) => {
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

  treatyCostTotal(arr:any[]):number {
    let total:number = 0;
    if(arr && arr.length !== 0) {
      total = arr.map(item => item.amount).reduce( (a, b) => a + b, 0);
    }
    
    return total;
  }

  // 流程进程信息
  progressInfo: any = null;
  nodeProcess: any[] = [];
  currentNodeProcess: any = null;
  isCurrentCheck: boolean = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  getWorkflow() {
    this.settingsConfigService
      .get(`/api/treaty/pay/process/${this.treaty_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'workflow');
        if (res.code === 200) {
          this.progressInfo = res.data;
          this.getNodeProcess();
        }
      })
  }

  getNodeProcess(): void {
    this.isCurrentCheck = false;
    this.settingsConfigService
      .get(`/api/node/process/${this.progressInfo.id}`)
      .subscribe((res: ApiData) => {
        console.log(res, 'node_process');
        if (res.code === 200) {
          this.nodeProcess = res.data.node_process;
          this.currentNodeProcess = this.nodeProcess.filter(v => v.current)[0];
          console.log(this.currentNodeProcess, this.isCurrentCheck, this.settings.user);
          if (this.currentNodeProcess) {
            this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
          }
        }
      })
  }
  // 打印
  printCurrentModal(idname: string, title: string) {
    let printWindow = window.open();

    html2canvas(document.querySelector(`#${idname}`)).then(canvas => {
      let compress = document.createElement('canvas');

      // change the image size

      compress.width = canvas.width;

      compress.height = canvas.height;

      const imageStr = canvas.toDataURL("image/png");

      let image = new Image();

      image.src = imageStr;

      image.onload = function () {

        compress.getContext("2d").drawImage(image, 0, 0, compress.width, compress.height);

        const imgString = compress.toDataURL("image/png");

        // const iframe = '<iframe src="' + imageStr + '" frameborder="0" style="border:0;" allowfullscreen></iframe>'
        const head: string = document.querySelector('head').innerHTML;;
        const style: string = `<style>body {-webkit-print-color-adjust: exact; padding: 12px!important;}</style>`;
        const div: string = '<div>' + '<img src="' + imgString + '" />' + '</div>';

        const docStr = head + style + div;

        printWindow.document.write(docStr);

        printWindow.document.close();

        printWindow.onload = function () {

          printWindow.print();
          printWindow.close();

        };

      }

    });
  }

  isPrinter: boolean = false;
  // pdf
  downloadFile(type: string) {
    this.isPrinter = true;
    setTimeout(() => {
      const data: any = document.getElementById('print-box');
      html2canvas(data).then(canvas => {
        this.isPrinter = false;
        // Few necessary setting options  
        const imgWidth: number = 208;
        const imgHeight: number = canvas.height * imgWidth / canvas.width;
        console.log(canvas, imgWidth, imgHeight);
        const pageHeight: number = 295;
        const leftHeight: number = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png', 1.0)
        if (type === 'pdf') {
          this.exportPdf(contentDataURL, imgWidth, imgHeight, pageHeight, leftHeight);
        }
        if (type === 'image') {
          this.exportImage(contentDataURL);
        }

      });
    }, 500);

  }
  pdfPosition: number = 0;
  exportPdf(contentDataURL: any, imgWidth: number, imgHeight: number, pageHeight: number, leftHeight: number) {
    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
    if (leftHeight + 10 < pageHeight) {
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      while (leftHeight > 0) {
        pdf.addImage(contentDataURL, 'PNG', 0, this.pdfPosition, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        this.pdfPosition -= 295;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage()
        }
      }
    }

    const pdf_name: string = this.projectInfo.name + "_" + (new Date().getTime()) + '.pdf';
    pdf.save(pdf_name); // Generated PDF 
  }
  // 图片和 pdf 下载 功能
  exportImage(contentDataURL: any) {
    var base64Img = contentDataURL;
    let oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.projectInfo.name + "_" + (new Date().getTime());
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }
}
