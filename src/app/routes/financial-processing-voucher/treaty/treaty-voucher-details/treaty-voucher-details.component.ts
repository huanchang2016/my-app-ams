import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ApiData } from 'src/app/data/interface.data';
import { STColumn, STChange } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { format } from 'date-fns';

@Component({
  selector: 'app-financial-processing-voucher-treaty-voucher-details',
  templateUrl: './treaty-voucher-details.component.html',
  styleUrls: ['./treaty-voucher-details.component.less']
})
export class FinancialProcessingVoucherTreatyVoucherDetailsComponent implements OnInit {
  id: number;

  info: any = null;
  treatyPayment: any[] = []; // 支付成本列表

  loading: boolean = false; // 生成凭证

  listOfData: any[] = [];
  list: any[] = []; // download list of data;

  billCategoryArray: any[] = [];

  columns: STColumn[] = [
    { title: '', index: 'id', type: 'checkbox' },
    { title: '制单人', index: 'user.name' },
    { title: '科目编码', index: 'subject_number' },
    { title: '摘要', index: 'abstract' },
    { title: '借方金额', index: 'debit_amount' },
    { title: '贷方金额', index: 'credit_amount' },
    { title: '供应商编码', index: 'customer_code' },
    { title: '项目编码', index: 'project_number' }
  ];

  constructor(
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private xlsx: XlsxService
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params && params['id']) {
        this.id = +params['id'];
        this.getDataInfo();
        this.getPaymentBillTaxList();
      }
    });

    // 获取开票类型
    this.settingsConfigService.get(`/api/bill/category/all`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.billCategoryArray = res.data.bill_category;
      }
    })
  }

  ngOnInit() {

  }


  download() {
    if (this.list.length < 1) {
      this.msg.error('未选择任何数据');
      return;
    }
    const data = [this.columns.filter(v => v.index !== 'id').map(i => i.title)];
    this.list.forEach(i =>
      data.push(this.columns.filter(v => v.index !== 'id').map(c => {
        if (c.index !== 'id') {
          if (c.title === '制单人') {
            return i.user.name;
          } else {
            return i[c.index as string];
          }
        }

      }))
    );

    this.xlsx.export({
      sheets: [
        {
          data: data,
          name: '项目非合同付款凭证',
        },
      ],
      filename: `${this.info.project.name}-非合同付款凭证-${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.xlsx`
    });
  }

  change(e: STChange) {
    switch (e.type) {
      case 'checkbox':
        this.list = e.checkbox;
        break;
    }
  }


  generateCertificate(): void {
    // 生成凭证
    this.loading = true;
    this.settingsConfigService.post(`/api/certificate/generate`, { certificate_id: this.info.certificate.id }).subscribe((res: ApiData) => {
      console.log(res.data, '生成凭证 详情');
      this.loading = false;
      if (res.code === 200) {
        // this.getCertificateInfo();
        this.getDataInfo();
      }
    })
  }

  getDataInfo(): void {
    this.settingsConfigService.get(`/api/treaty/pay/detail/${this.id}`)
      .subscribe((res: ApiData) => {
        console.log(res, '非合约支付信息1111');
        if (res.code === 200) {
          this.info = res.data;
          if (this.info.certificate && this.info.certificate.is_deal) {
            this.getCertificateInfo();
          }
          this.getProjectInfo();
        }
      })

  }

  loadingData: boolean = false;
  getCertificateInfo() {
    this.loadingData = true;
    this.settingsConfigService.get(`/api/certificate_detail/${this.info.certificate.id}`).subscribe((res: ApiData) => {
      console.log(res.data, '凭证详情信息')
      this.loadingData = false;
      if (res.code === 200) {
        this.listOfData = res.data.certificate_detail;
      }
    })

  }

  projectInfo: any = null;
  getProjectInfo() {
    this.settingsConfigService.get(`/api/project/detail/${this.info.project.id}`).subscribe((res: ApiData) => {
      if (res.code === 200) {
        this.projectInfo = res.data;
      }
    });
    this.settingsConfigService.get(`/api/treaty/payment/${this.info.id}`)
      .subscribe((res: ApiData) => {
        if (res.code === 200) {
          const treatyPayment: any[] = res.data.treaty_payment;
          this.treatyPayment = treatyPayment;
        }
      })
  }

  paymentTaxList:any[] = []; // 支付 发票台账（执行人填写）
  getPaymentBillTaxList():void {
    const listUrl = `/api/treaty/payment/tax/${this.id}`;
    this.settingsConfigService.get(listUrl).subscribe((res: ApiData) => {
      console.log(res, '非合约 支付详情对应税 列表')
      if (res.code === 200) {
        const list: any[] = res.data.contract_payment_tax;
        this.paymentTaxList = list.sort((a: any, b: any) => a.id - b.id);
      }
    });
  }
}
