import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.less']
})
export class CompanyFormComponent implements OnInit {

  /**
   * page 1: name  code (customer || supplier)
   * page 2: others
   * 
   * *****/
  currentStep: number = 0;
  
  @Input() data:any;
  @Input() type:string = 'user' || 'customer' || 'supplier';
  @Input() companyId:number;

  showReferInfo:boolean = false; // 当为用户单位时，提示 客户和供应商编码必填一项

  companyArray:List[] = [];

  basicInfoForm: FormGroup; // 基本资料
  otherInfoForm: FormGroup; // 其它非必填信息

  submitBasicLoading:boolean = false;
  submitOtherLoading:boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    public settingsConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {

    this.basicInfoForm = this.fb.group({
      name: [null, [Validators.required]],
      customer_code: [ null ],
      supplier_code: [ null ],
      is_user: [ false ]
    });
    
    if(this.type === 'supplier') {
      this.basicInfoForm.get('supplier_code').setValidators(Validators.required);
    } else if(this.type === 'customer') {
      this.basicInfoForm.get('customer_code').setValidators(Validators.required);
    } else {
      this.basicInfoForm.get('is_user').setValidators(Validators.required);
      this.showReferInfo = true;
    }

    
    
    this.otherInfoForm = this.fb.group({
      // name: [null, [Validators.required]],
      logo: [ null ],
      company_nature_id: [ null ],
      code: [ null ],
      represent: [ null ],
      // province: [ null ],
      // city: [ null ],
      // area: [ null ],
      cascader: [ null ],
      address: [ null ],
      email: [ null, [ Validators.email ] ],
      tel: [ null, [ Validators.minLength(7) ] ],
      capital: [ null ],
      website: [ null ],
      description: [ null ]
    });

    if(this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    }
  }

  codeValueChange(): void {
    let d:any = this.basicInfoForm.value;
    
    if((d.customer_code  && d.customer_code.trim()) || (d.supplier_code  && d.supplier_code.trim())) {
      this.showReferInfo = false;
    }else {
      this.showReferInfo = true;
    }
    
  }
  
  submitbasicInfoForm(): void {
    for (const i in this.basicInfoForm.controls) {
      this.basicInfoForm.controls[i].markAsDirty();
      this.basicInfoForm.controls[i].updateValueAndValidity();
    }
    if(this.basicInfoForm.valid) {
      let value:any = this.basicInfoForm.value;
      if(this.type === 'user' && this.showReferInfo) {
        return;
      }
      let opt:any = {
        name: value.name,
        customer_code: value.customer_code ? value.customer_code.trim() : '',
        supplier_code: value.supplier_code ? value.supplier_code.trim() : '',
        is_user: value.is_user
      };
      this.submitBasicLoading = true;
      if(this.data) {
        //  请求编辑 接口
        let option:any = Object.assign({ company_id: this.data.id }, opt );
        this.editBasicInfo(option);
      }else {
        //  请求 新增接口
        this.createBasicInfo(opt);
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  submitOtherInfoForm(): void {
    for (const i in this.otherInfoForm.controls) {
      this.otherInfoForm.controls[i].markAsDirty();
      this.otherInfoForm.controls[i].updateValueAndValidity();
    }
    if(this.otherInfoForm.valid) {
      let value:any = this.otherInfoForm.value;
      let cascader: number[] = value.cascader ? value.cascader : [];
      let opt:any = {
        // name: value.name,
        logo: value.logo,
        company_nature_id: value.company_nature_id,
        code: value.code,
        represent: value.represent,
        province_id: cascader[0] || null,
        city_id: cascader[1] || null,
        area_id: cascader[2] || null,
        address: value.address,
        email: value.email,
        tel: value.tel,
        capital: value.capital,
        website: value.website,
        description: value.description
      };
      this.submitOtherLoading = true;

      // 所有其它信息  均为 更新。
      let option:any = Object.assign({ company_id: this.data.id }, opt );

      this.updateOtherInfo(option);
      // if(this.data) {
      //   //  请求编辑 接口
      //   let option:any = Object.assign({ company_id: this.data.id }, opt );
      //   this.editOtherInfo(option);
      // }else {
      //   //  请求 新增接口
      //   this.createOtherInfo(opt);
      // }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }

  createBasicInfo(opt:any) {
    
    let url: string = '';
    if(this.type === 'user') {
      url = '/api/company/all/add';
    } else if(this.type === 'customer') {
      url = '/api/company/customer/add';
    }else {
      url = '/api/company/supplier/add';
    }

    this.settingsConfigService.post(url, opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitBasicLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.currentStep++;
        this.data = res.data;
        this.setFormValue(res.data);
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  editBasicInfo(opt:any) {

    let url: string = '';

    if(this.type === 'user') {
      url = '/api/company/all/update';
    } else if(this.type === 'customer') {
      url = '/api/company/customer/update';
    }else {
      url = '/api/company/supplier/update';
    }
    console.log(url, opt);

    this.settingsConfigService.post(url, opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitBasicLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.currentStep++;
        this.data = res.data;
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  
  updateOtherInfo(opt:any) {
    this.settingsConfigService.post('/api/company/update', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitOtherLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.currentStep++;
        // this.destroyModal(opt, true);
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }


  setFormValue(data:any) :void {

    this.basicInfoForm.patchValue({
      name: data.name,
      customer_code: data.customer_code,
      supplier_code: data.supplier_code,
      is_user: data.is_user
    });

    if(this.type === 'user') {
      if(data.customer_code || data.supplier_code) {
        this.showReferInfo = false;
      }
    }

    let cascader:number[] = [];
    // [ data.province, data.city, data.area ]
    if(data.area) {
      cascader = [ data.area.province.id, data.area.city.id, data.area.id ];
    }

    this.otherInfoForm.patchValue({
      logo: data.logo,
      company_nature_id: data.nature ? data.nature.id : null,
      code: data.code,
      represent: data.represent,
      cascader: cascader,
      address: data.address,
      email: data.email,
      tel: data.tel,
      capital: data.capital,
      website: data.website,
      description: data.description
    });
  }

  finished() {
    this.destroyModal({}, true);
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
