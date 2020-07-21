import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-bill-execute-flow',
  templateUrl: './users-bill-execute-flow.component.html',
  styles: [
    `
      .check-box {
        width: 300px;
      }
    `
  ]
})
export class UsersBillExecuteFlowComponent implements OnChanges {
  @Input() progressInfo:any;
  @Input() billInfo:any;

  @Output() executeChange:EventEmitter<any> = new EventEmitter();

  nodeProcess:any[] = [];

  isExecuteUser:boolean = false;

  
  // 执行情况：
  //    如果执行成功，需要填写  发票号码 发票金额(不含税)  税额 
  //    如果 未执行 ，需要填写 不能执行的原因
  // checkOption: any = {
  //   is_execute: 'A',
  //   remark: '', // 备注原因
  //   invoice_number: null, // 发票号码
  //   invoice_amount: null, // 发票金额
  //   tax_amount: null // 发票税额
  // }

  constructor(
    private settings: SettingsService,
    private fb: FormBuilder
  ) { }

  ngOnChanges() {
    if(this.progressInfo) {
      console.log(this.progressInfo, 'app-users-execute-flow');
      this.nodeProcess = [this.progressInfo.execute_user];
      this.isExecuteUser = this.progressInfo.execute_user.id === this.settings.user.id;
    }
  }

  validateForm!: FormGroup;

  ngOnInit(): void {

    this.validateForm = this.fb.group({
      is_execute: ['A', [Validators.required] ],
      remark: [null ],
      invoice_number: [null, [Validators.required] ],
      invoice_amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)] ],
      tax_amount: [null, [Validators.required, Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/)] ]
    });

    this.validateForm.get('is_execute').valueChanges.subscribe( val => {
      if (val === 'B') {
        this.validateForm.get('invoice_number')!.clearValidators();
        this.validateForm.get('invoice_number')!.markAsPristine();

        this.validateForm.get('invoice_amount')!.clearValidators();
        this.validateForm.get('invoice_amount')!.markAsPristine();
        
        this.validateForm.get('tax_amount')!.clearValidators();
        this.validateForm.get('tax_amount')!.markAsPristine();


        this.validateForm.get('remark')!.setValidators(Validators.required);
        this.validateForm.get('remark')!.markAsDirty();
      } else {
        this.validateForm.get('invoice_number')!.setValidators(Validators.required);
        this.validateForm.get('invoice_number')!.markAsDirty();
        this.validateForm.get('invoice_amount')!.setValidators(Validators.required);
        this.validateForm.get('invoice_amount')!.markAsDirty();
        this.validateForm.get('tax_amount')!.setValidators(Validators.required);
        this.validateForm.get('tax_amount')!.markAsDirty();

        
        this.validateForm.get('remark')!.clearValidators();
        this.validateForm.get('remark')!.markAsPristine();
      }
      this.validateForm!.updateValueAndValidity();
    });

    this.validateForm.get('invoice_amount').valueChanges.subscribe( v => {
      const _amount = Number(v) || 0;
      const _tax_amount = (_amount * this.billInfo.tax_rate).toFixed(2);
      this.validateForm.patchValue({
        tax_amount: _tax_amount
      })
    })
  }

  
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log('submit', this.validateForm);

    if(this.validateForm.valid) {
      const is_execute = {
        is_execute: this.validateForm.get('is_execute').value === 'A' ? true : false
      }
      const option = Object.assign(this.validateForm.value, is_execute);
      this.executeChange.emit(option);
    }
  }

  cancel() { }

}
