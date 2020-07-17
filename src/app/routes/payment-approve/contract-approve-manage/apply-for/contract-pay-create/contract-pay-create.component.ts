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
      if (params && params.id) {
        this.projectId = +params.id;
        this.getProjectInfo();
        this.getContractList();
        this.getBudgetInfo();
      }
    });
  }
  listOfData: any[] = [];

  listOfTax: any[] = [];

  costlist: any[] = []; // 所有成本数据 

  taxlist: any[] = []; // 所有税目数据

  projectInfo: any = null;
  projectId: number = null;

  contract_pay_id: number = null;

  contractInfo: any = null;  // 合同信息
  contract_id: number = null; //  选择的合同id
  single_contract_id: number = null; //  选择的合同id
  contract_payment_id: number = null;
  selectedContract: any = null;
  selectedFlag = false;  // 选择显示标杆
  contractList: any[] = [];
  saveDisable = false;  //  保存按钮标杆

  costArr: any[] = []; // 所有的成本列表  需要通过预算（通过项目） 获取

  taxArr: any[] = [];

  summary = ''; // 合同支付 摘要信息

  pageTitle = '';
  submitLoading = false;

  currentSelectCost: any = null;

  // 新增 成本支付
  tplModal: NzModalRef;

  validateCostForm: FormGroup;

  // 新增 发票台账
  billModal: NzModalRef;

  validateBillForm: FormGroup;

  isEditCost = false;
  // 金额大写
  transferNumber = '';

  // 附件上传
  attachment: any[] = [];
  isAttachmentChange = false;

  attachmentCategory: List[] = [];


  // 流程进程信息
  progressInfo: any = null;
  nodeProcess: any[] = [];
  currentNodeProcess: any = null;
  isCurrentCheck = false;

  checkOption: any = {
    agree: null,
    remark: ''
  }

  isPrinter = false;
  pdfPosition = 0;


  ngOnInit() {

    this.validateCostForm = this.fb.group({
      cost_id: [null, [Validators.required]],
      amount: [null, [Validators.required, this.confirmationAmountValidator]],
      remark: [null]
    });
    this.validateBillForm = this.fb.group({
      contract_payment_id: [null, [Validators.required]],
      bill_category_id: [null, [Validators.required]],
      exclude_tax_amount: [null, [Validators.required]],
      tax_amount: [null, [Validators.required]],
      amount: [null, [Validators.required]],
    });
    this.getCategoryList();
    this.getTaxCategoryList();

    // 当成本类型发生变化时，支付金额也有限制输入
    this.validateCostForm.get('cost_id').valueChanges.subscribe((cost_id: number) => {
      if (cost_id) {
        this.currentSelectCost = this.costArr.filter(v => v.id === cost_id)[0];
        console.log(this.currentSelectCost)
      }
    });
  }
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
    [this.selectedContract] = this.contractList.filter(v => v.contract.id === this.contract_id);
    this.single_contract_id = this.selectedContract.id
    console.log('selectedContract', this.selectedContract)
  }

  getContractList(): void { // 通过项目获取合约
    this.settingsConfigService.get(`/api/deal/project/${this.projectId}`).subscribe((res: ApiData) => {
      console.log('contract list deal: ', res);
      if (res.code === 200) {
        this.contractList = res.data.deal;
        // 如果有 contract_pay_id 参数， 则表示为编辑 合约支付
        this.activatedRoute.queryParams.subscribe(params => {
          if (params && params.contract_pay_id) {
            this.contract_pay_id = +(params.contract_pay_id);
            this.pageTitle = '编辑合约支付申请';
            this.getContractPayDetail();
            this.getContractPayment();
            this.getAttachment();
            this.getContractTax();
            this.selectedFlag = true;
          } else {
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
          this.contract_id = res.data.deal.contract.id;
          console.log('this.contract_id', this.contract_id)
          console.log('this.contractInfo', this.contractInfo)
          this.summary = this.contractInfo.summary; // 合约支付摘要
          [this.selectedContract] = this.contractList.filter(v => v.contract.id === this.contract_id);
          if (!this.contractInfo.draft) {
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
          console.log('getContractPayment listOfData', this.listOfData)
        }
      })
  }

  getContractTax() {
    this.settingsConfigService.get(`/api/contract/payment/tax/${this.contract_pay_id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '合约支付税目');
        if (res.code === 200) {
          const contractTax: any[] = res.data.contract_payment;
          this.listOfTax = contractTax;
          console.log('getContractTax listOfTax', this.listOfTax)
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

  // 成本支出
  addPaymentCost(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, e: MouseEvent): void {
    e.preventDefault();
    this.isEditCost = false;
    console.log('111this.costArr', this.costArr)
    console.log('this.listOfData', this.listOfData)
    this.tplModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }
  edit(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>, data: any, i: any): void {
    // 将 之前 禁用的 成本类型  disabled  ===> false
    this.isEditCost = true;
    this.costArr = this.costArr.map(v => {
      if (v.id === data.cost.id) {
        v.disabled = true;
      }
      return v;
    })
    console.log('222this.costArr', this.costArr)
    console.log('111data', data)
    this.contract_payment_id = this.listOfData[i].id;
    console.log('this.contract_payment_id by listOfData', this.contract_payment_id)
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

  // 发票台账
  addBillTicket(billTitle: TemplateRef<{}>, billContent: TemplateRef<{}>, billFooter: TemplateRef<{}>, e: MouseEvent): void {
    e.preventDefault();
    this.billModal = this.modalService.create({
      nzTitle: billTitle,
      nzContent: billContent,
      nzFooter: billFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
    console.log('发票台账costArr', this.costArr)
  }
  editBillTicket(billTitle: TemplateRef<{}>, billContent: TemplateRef<{}>, billFooter: TemplateRef<{}>, data: any, i): void {
    this.isEditCost = true;
    console.log('edittax', data);
    // this.taxArr = this.taxArr.map(v => {
    //   if (v.id === data.cost.id) {
    //     v.disabled = true;
    //   }
    //   return v;
    // })
    // console.log('taxArr',this.taxArr);
    this.contract_payment_id = this.listOfTax[i].id;
    this.resetTaxForm(data);
    this.billModal = this.modalService.create({
      nzTitle: billTitle,
      nzContent: billContent,
      nzFooter: billFooter,
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
  closeTaxModal(): void {
    this.currentSelectCost = null;
    this.isEditCost = false;
    this.billModal.destroy();
    this.validateBillForm.reset();
  }

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

      const remark: string = value.remark || '';
      // 列表渲染数据
      const selectCost: any = this.costlist.filter(v => v.id === value.cost_id)[0];

      const createArray = {
        contract_pay_id: this.contract_pay_id,
        cost_id: selectCost.id,
        amount: Number(value.amount),
        remark: remark.trim()
      }
      const editArray = {
        contract_payment_id: this.contract_payment_id,
        cost_id: selectCost.id,
        amount: Number(value.amount),
        remark: remark.trim()
      }
      if (!this.isEditCost) {
        this.createContractPaymentDetail(createArray);
      } else {
        this.editContractPaymentDetail(editArray);
      }
      this.closeModal();
    }
  }
  createContractPaymentDetail(option) {
    console.log('createOption', option);
    this.settingsConfigService.post('/api/contract/payment/create', option).subscribe((res: ApiData) => {
      console.log('create res', res.data);
      if (res.code === 200) {
        console.log('新建合同支付详情  成功');
        this.saveDisable = true;
        this.getContractPayment();
        this.contract_payment_id = res.data.id;
        console.log('创建合约支付详情后生成payment_id', this.contract_payment_id)
      } else {
        this.submitLoading = false;
      }
    });
  }

  editContractPaymentDetail(option) {
    console.log('editOption', option);
    console.log('edit this.contract_payment_id', this.contract_payment_id)
    this.settingsConfigService.post('/api/contract/payment/update', option).subscribe((res: ApiData) => {
      console.log('edit res', res.data);
      if (res.code === 200) {
        console.log('编辑合同支付详情  成功');
        this.saveDisable = true;
        this.getContractPayment();
      } else {
        this.submitLoading = false;
      }
    });
  }

  submitPayAmount() {
    this.submitLoading = true;
    console.log('contract_id: ', this.contract_id, '摘要信息', this.summary, 'project_id: ', this.projectId, 'payment: ', this.listOfData);

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
      deal_id: this.selectedContract.id,
      summary: this.summary,
      payment
    };
    this.settingsConfigService.post('/api/contract/pay/create', option).subscribe((res: ApiData) => {
      console.log(res);
      if (res.code === 200) {
        // this.msg.success('提交成功');
        // this.router.navigateByUrl(`/approve/contract/apply/pay/${this.projectId}`);

        this.bindAttachment(res.data.id);
      } else {
        this.submitLoading = false;
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
      summary: this.summary,
      payment: payMent
    };
    this.settingsConfigService.post('/api/contract/pay/update', opt).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('更新成功');
        this.router.navigateByUrl(`/approve/list/apply/pay/${this.projectId}`);
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
    let paymentId = null;
    this.listOfData.length !== 1 ? paymentId = this.listOfData[id - 1].id : paymentId = this.listOfData[0].id
    console.log('delete', paymentId)
    console.log('deleteid', id)
    console.log('listOfData', this.listOfData)
    this.settingsConfigService.post('/api/contract/payment/disable', { contract_payment_id: paymentId }).subscribe((res: ApiData) => {
      console.log('create res', res.data);
      if (res.code === 200) {
        console.log('删除合同支付详情  成功');
        this.listOfData = this.listOfData.filter(v => v.cost.id !== id);
        this.costArr = this.costArr.map(v => {
          if (v.id === id) {
            v.disabled = false;
          }
          return v
        });
      } else {
        this.submitLoading = false;
      }
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

  resetTaxForm(opt: any): void {
    this.validateCostForm.patchValue({
      cost_id: opt.cost.id,
      amount: opt.amount,
      remark: opt.remark
    });
  }

  submitContractPay(): void {
    console.log(this.contract_pay_id, '合约支付信息提交');
    if (this.contract_pay_id) {
      this.submit();
    }

  }
  submit(): void {
    this.settingsConfigService.post('/api/contract_pay/submit', { contract_pay_id: this.contract_pay_id }).subscribe((res: ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if (res.code === 200) {
        this.msg.success('支付信息提交成功');
        this.router.navigateByUrl(`/approve/list/apply/pay/${this.projectId}`);
      }
    });
  }
  transferAmount(num: number) {
    this.settingsConfigService.post(`/api/finance/transfer`, { num }).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.transferNumber = res.data.number;
      }
    });
  }
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
      contract_pay_id,
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
          this.router.navigateByUrl(`/approve/list/apply/pay/${this.projectId}`);
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
  getTaxCategoryList() {
    this.settingsConfigService.get('/api/bill/category/all').subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log(res, 'getTaxCategoryList 获取所有开票类型');
        // res.data.bill_category
        this.taxArr = res.data.bill_category
      }
    })
  }

  getWorkflow() {
    this.settingsConfigService
      .get(`/api/contract/pay/process/${this.contract_pay_id}`)
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
          if (this.currentNodeProcess) {
            this.isCurrentCheck = this.currentNodeProcess.user.id === this.settings.user.id;
          }
        }
      })
  }

  executeChange(data: any) {
    console.log('执行情况信息 提交: ', data);
    const option: any = { ...data, process_id: this.progressInfo.id };
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

  // 打印
  printCurrentModal(idname: string, title: string) {
    const printWindow = window.open();

    html2canvas(document.querySelector(`#${idname}`)).then(canvas => {
      const compress = document.createElement('canvas');

      // change the image size

      compress.width = canvas.width;

      compress.height = canvas.height;

      const imageStr = canvas.toDataURL("image/png");

      const image = new Image();

      image.src = imageStr;

      image.onload = function () {

        compress.getContext("2d").drawImage(image, 0, 0, compress.width, compress.height);

        const imgString = compress.toDataURL("image/png");

        // const iframe = '<iframe src="' + imageStr + '" frameborder="0" style="border:0;" allowfullscreen></iframe>'
        const head: string = document.querySelector('head').innerHTML;;
        const style = `<style>body {-webkit-print-color-adjust: exact; padding: 12px!important;}</style>`;
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
  // pdf
  downloadFile(type: string) {
    this.isPrinter = true;
    setTimeout(() => {
      const data: any = document.getElementById('print-box');
      html2canvas(data).then(canvas => {
        this.isPrinter = false;
        // Few necessary setting options  
        const imgWidth = 208;
        const imgHeight: number = canvas.height * imgWidth / canvas.width;
        console.log(canvas, imgWidth, imgHeight);
        const pageHeight = 295;
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
  exportPdf(contentDataURL: any, imgWidth: number, imgHeight: number, pageHeight: number, leftHeight: number) {
    const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
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
    const base64Img = contentDataURL;
    const oA: any = document.createElement('a');
    oA.href = base64Img;
    oA.download = this.projectInfo.name + "_" + (new Date().getTime());
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    oA.dispatchEvent(event);
  }

  submitSum() {
    if (!this.contract_pay_id) {
      this.createContractPayment();
    } else {
      this.editContractPayment();
    }

  }
  createContractPayment() {
    const option: any = {
      project_id: this.projectId,
      deal_id: this.single_contract_id,
      summary: this.summary,
    };
    this.settingsConfigService.post('/api/contract/pay/create', option).subscribe((res: ApiData) => {
      console.log('create res', res.data);
      if (res.code === 200) {
        console.log('创建合同支付  成功');
        this.contract_pay_id = res.data.id;
        this.saveDisable = true;
        this.selectedFlag = true;
      } else {
        this.submitLoading = false;
      }
    });
  }
  editContractPayment() {
    const option: any = {
      contract_pay_id: this.contract_pay_id,
      summary: this.summary,
    };
    this.settingsConfigService.post('/api/contract/pay/update', option).subscribe((res: ApiData) => {
      console.log('create res', res.data);
      if (res.code === 200) {
        console.log('编辑合同支付  成功');
        this.saveDisable = true;
        this.selectedFlag = true;
      } else {
        this.submitLoading = false;
      }
    });
  }

  sureOk() {
    this.submitTaxForm()
  }

  submitTaxForm(): void {
    for (const key in this.validateBillForm.controls) {
      this.validateBillForm.controls[key].markAsDirty();
      this.validateBillForm.controls[key].updateValueAndValidity();
    }
    if (this.validateBillForm.valid) {
      const value: any = this.validateBillForm.value;
      console.log('value', value);

      // 添加成本预算后， 当前 税目类型就变成不可选
      // this.taxArr = this.taxArr.map(v => {
      //   if (v.id === value.cost_id) {
      //     v.disabled = true;
      //   }
      //   return v;
      // });

      // const remark: string = value.remark || '';
      // // 列表渲染数据
      // const selectCost: any = this.costlist.filter(v => v.id === value.index)[0];

      const createArray = {
        contract_payment_id: this.contract_payment_id,
        bill_category_id: value.bill_category_id,
        exclude_tax_amount: Number(value.exclude_tax_amount),
        tax_amount: Number(value.tax_amount),
        amount: Number(value.amount),
        index: value.bill_category_id,
        // cost_id: selectCost.id,
        // amount: Number(value.amount),
        // remark: remark.trim()
      }
      console.log('createArray', createArray);
      const editArray = {
        // contract_payment_id: this.contract_payment_id,
        // cost_id: selectCost.id,
        // amount: Number(value.amount),
        // remark: remark.trim()
      }

      console.log('isEditCost', this.isEditCost);
      if (!this.isEditCost) {
        this.createContractTax(createArray);
      } else {
        this.editContractTax(editArray);
      }
      this.closeTaxModal();
    }
  }

  createContractTax(option) {
    this.settingsConfigService.post('/api/contract/payment/tax/create', option).subscribe((res: ApiData) => {
      if (res.code === 200) {
        console.log('createContractTax res', res.data);
        console.log('创建合同支付税目  成功');
      }
    });
  }

  editContractTax(option) {

  }

}
