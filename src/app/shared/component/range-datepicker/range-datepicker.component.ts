import { format } from 'date-fns';
import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors } from '@angular/forms';


@Component({
  selector: 'app-range-datepicker',
  templateUrl: './range-datepicker.component.html',
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeDatepickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RangeDatepickerComponent),
      multi: true
    }
  ]
})
export class RangeDatepickerComponent implements ControlValueAccessor {


  private propagateChange = (_: any) => { };
  
  rangeDate:any = null;

  writeValue(obj: any): void {
    if(obj) {
      this.rangeDate = [obj.start, obj.end];
    }
  }

  modelValueChange():void {
    this.propagateChange({
      start: format(this.rangeDate[0], 'YYYY/MM/DD'),
      end: format(this.rangeDate[1], 'YYYY/MM/DD')
    })
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  validate(control: AbstractControl): ValidationErrors | null {
    if(control.errors && control.errors.required) {
      return this.rangeDate && this.rangeDate.length !== 0 ? null : {
        isInvalid: {
          valid: false
        }
      }
    }else {
      return null;
    }
  }

}
