import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiData, List } from 'src/app/data/interface.data';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-cascader-area',
  templateUrl: './cascader-area.component.html',
  styles: [`
    nz-select {
      margin-right: 1%;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascaderAreaComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CascaderAreaComponent),
      multi: true
    }
  ]
})
export class CascaderAreaComponent implements ControlValueAccessor {


  private propagateChange = (_: any) => { };
  
  selectedProvince:number;
  selectedCity:number;
  selectedDistrict:number;
  provinceData: Array<List> = [];
  cityData: Array<List> = [];
  districtData: Array<List> = [];

  constructor(
    public http: _HttpClient
  ) {
    this.http.get('/api/province').subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.provinceData = res.data.province;
      }
    })
  }

  selectedValueChange() {
    let data:number[] = [this.selectedProvince, this.selectedCity, this.selectedDistrict];
    this.propagateChange(data);
  }

  writeValue(obj: any[]): void {
    console.log(obj);
    if(obj && obj.length != 0) {
      this.selectedProvince = obj[0];
      this.selectedCity = obj[1];
      this.selectedDistrict = obj[2];
      if(this.selectedProvince) {
        this.getCities(this.selectedProvince);
      }
      if(this.selectedCity) {
        this.getDistrict(this.selectedCity);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  // validate(c: FormControl): { [key: string]: any } {
  //   return this.selectedDistrict ? null : {
  //     natureInvalid: {
  //       valid: false
  //     }
  //   }
  // }
  validate(control: AbstractControl): ValidationErrors | null {
    if(control.errors && control.errors.required) {
      return this.selectedDistrict ? null : {
        natureInvalid: {
          valid: false
        }
      }
    }else {
      return null;
    }
  }
  
  provinceChange(id: any): void {
    this.selectedCity = null;
    this.selectedDistrict = null;
    this.getCities(id);
  }

  cityChange(id: any) :void {
    this.selectedDistrict = null;
    this.getDistrict(id);
  }

  getCities(id: number) {
    this.http.get(`/api/city/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.cityData = res.data.city;
      }
    })
  }

  getDistrict(id: number) {
    this.http.get(`/api/area/${id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.districtData = res.data.area;
      }
    })
  }
}
