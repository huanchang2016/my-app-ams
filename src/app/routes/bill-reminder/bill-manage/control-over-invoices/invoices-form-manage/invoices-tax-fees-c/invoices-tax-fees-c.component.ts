import { Component, forwardRef, Input, OnChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-invoices-tax-fees-c',
  templateUrl: './invoices-tax-fees-c.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InvoicesTaxFeesCComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InvoicesTaxFeesCComponent),
      multi: true
    }
  ]
})
export class InvoicesTaxFeesCComponent implements ControlValueAccessor, OnChanges {
  @Input() taxFeeArray:any[] = [];

  fees:any = [];

  private propagateChange = (_: any) => { };

  validateForm: FormGroup;
  controlArray: Array<{ id: number; name: string; key: string; }> = [];

  constructor(
    private fb: FormBuilder
  ) {}


  writeValue(obj: any): void {
    console.log(obj, 'objssssss')
    this.fees = obj || [];

    if(this.taxFeeArray.length !== 0) {
      this.initForm();
    }
  }

  ngOnChanges() {
    // if(this.taxFeeArray.length !== 0 && this.fees) {
    //   this.initForm();
    // }
  }

  initForm(): void {
    console.log(this.taxFeeArray, 'taxFeeArray Value Change');
    this.validateForm = this.fb.group({});
    this.controlArray = [];
    for (let i = 0; i < this.taxFeeArray.length; i++) {
      const fee = this.taxFeeArray[i];
      this.controlArray.push({ name: fee.name, id: fee.id, key: `tax_fee_id_${fee.id}` });
      this.validateForm.addControl(`tax_fee_id_${fee.id}`, new FormControl(this.initValue(fee.id), { validators: Validators.pattern(/^(([1-9]\d*|0)(\.\d{1,})?)$|(0\.0?([1-9]\d?))$/) }));
    }
    console.log(this.controlArray);
    
  }

  initValue(id:number): number {
    if(this.fees.length === 0) {
      return null;
    }
    const currentFees:any[] = this.fees.filter( v => v.tax_fee.id === id);
    return currentFees.length === 0 ? null : currentFees[0].amount;
  }

  
  findBillFeeId(id:number): number {
    if(this.fees.length === 0) {
      return null;
    }
    console.log(this.fees);
    const _currentFees:any[] = this.fees.filter( v => v.tax_fee.id === id);
    return _currentFees.length === 0 ? null : _currentFees[0].id;
  }

  valueChanges(key:string) {
    console.log(this.validateForm);

    const formValue:any = this.validateForm.value;
    let _fees:any[] = [];
    for (const key in formValue) {
      if (formValue.hasOwnProperty(key)) {
        const element = formValue[key];
        if(element) {
          const tax_fee_id:number = +key.split('tax_fee_id_')[1];
          _fees.push({
            tax_fee_id: tax_fee_id,
            bill_fee_id: this.findBillFeeId(tax_fee_id),
            amount: +element
          })
        }
        
      }
    }

    // this.fees = _fees;
    this.propagateChange(_fees);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  validate(control: AbstractControl): ValidationErrors | null {
    if(control.errors && control.errors.required) {
      return this.fees && this.fees.length !== 0 ? null : {
        isInvalid: {
          valid: false
        }
      }
    }else {
      return null;
    }
  }
}
