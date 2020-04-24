import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { debounceTime } from 'rxjs/operators';
import { zip } from 'rxjs';

@Component({
  selector: 'app-payment-contract-form',
  templateUrl: './payment-contract-form.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class PaymentContractFormComponent implements OnInit {

  @Input() data:any;
  @Input() proId:number;
  @Input() contractArr:any;

  contractTreatyArr:any[] = []; // 供应商下的 合约或者协议列表

  validateForm: FormGroup;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {

    this.validateForm = this.fb.group({
      contract_id: [null, [Validators.required] ],
      payment_amount: [ null, [Validators.required] ],
      note: [ null ]
    });
    
    // this.validateForm.get('contract_id').valueChanges
    //     .pipe(debounceTime(100))
    //     .subscribe(( supplierId:number) => {
    //       this.getContractTreatyList(supplierId);
    // })
    if(this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    }
  }
  
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(this.validateForm.valid) {
      // this.destroyModal(this.validateForm.value);
      if(this.data) {
        //  请求编辑 接口
        this.edit();
      }else {
        //  请求 新增接口
        this.create();
      }
    } else {
      this.msg.warning('信息填写不完整');
    }
  }
  create() {
    let opt:any = this.validateForm.value;
    console.log(opt);
    this.settingsConfigService.post('/api/cost/category/create', opt).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal(opt, false);
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  edit() {
    let opt:any = {
      name: this.validateForm.value.name,
      description: this.validateForm.value.description
    };
    
    let obj:any = Object.assign({ category_id: this.data.id }, opt);

    this.settingsConfigService.post('/api/cost/category/update', obj).subscribe((res:ApiData) => {
      console.log(res);
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('更新成功');
        this.destroyModal(obj, true);
      }else {
        this.msg.error(res.error || '更新失败');
      }
    });
  }

  getContractTreatyList(id:number) {
    const opt: any = {
      project_id: this.proId,
      supplier_id: id
    };
    zip(
      this.settingsConfigService.post(`/api/contract/supplier`, opt),
      this.settingsConfigService.post(`/api/treaty/supplier`, opt)
    ).subscribe(([resContract, resTreaty]) => {
      const conList:any[] = resContract.data.contract.filter( v => v.active );
      
      const treatyList:any[] = resTreaty.data.treaty.filter(v => v.active);

      this.contractTreatyArr = [...conList, ...treatyList];
      console.log(this.contractTreatyArr);
    });
  }

  setFormValue(data:any) :void {
    console.log(data);
    
    this.validateForm.patchValue({
      name: data.name,
      description: data.description
    });
  }

  destroyModal(data:any, isEdit: boolean = false): void {
    this.modal.destroy({
      data: data,
      isEdit: isEdit
    });
  }
}
