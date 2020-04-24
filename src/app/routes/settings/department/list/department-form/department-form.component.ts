import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }

      .phone-select {
        width: 70px;
      }

      .register-are {
        margin-bottom: 8px;
      }
    `
  ]
})
export class DepartmentFormComponent implements OnInit {

      @Input() data:any;
      @Input() COMPANY:List[];
      @Input() categoryArray:List[];
      @Input() companyId:number;
    
      categoryLoading:boolean = false;
    
      validateForm: FormGroup;
    
      submitLoading:boolean = false;

      constructor(
        private modal: NzModalRef,
        private fb: FormBuilder,
        private msg: NzMessageService,
        private settingsConfigService: SettingsConfigService
      ) { }
    
    
      ngOnInit(): void {
    
        this.validateForm = this.fb.group({
          name: [ null, [Validators.required]],
          alias: [ null ],
          company_id: [ this.companyId, Validators.required ],
          category_id: [ null ],
          business: [ null ],
          duty: [ null ]
        });
    
        // 获取当前单位下的 部门
        if(this.companyId) {
          this.getCategory(this.companyId);
        }
        this.validateForm.get('company_id').valueChanges.subscribe( id => {
          this.categoryArray = [];
          this.getCategory(id);
        });
        
    
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
        this.settingsConfigService.post('/api/department/create', opt).subscribe((res:ApiData) => {
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
        let opt:any = this.validateForm.value;
        
        let obj:any = Object.assign({ department_id: this.data.id }, opt);

        this.settingsConfigService.post('/api/department/update', obj).subscribe((res:ApiData) => {
          console.log(res);
          this.submitLoading = false;
          if(res.code === 200) {
            this.msg.success('更新成功');
            this.destroyModal(opt, true);
          }else {
            this.msg.error(res.error || '更新失败');
          }
        });
      }
    
      setFormValue(data:any) :void {
        this.validateForm.patchValue({
          name: data.name,
          alias: data.alias,
          // company_id: data.company.id,
          category_id: data.category ? data.category.id : null,
          business: data.business,
          duty: data.duty
        });
      }
    
      getCategory(id:number): void {
        this.categoryLoading = true;
        this.settingsConfigService.get(`/api/department_category/${id}`).subscribe((res:ApiData) => {
          this.categoryLoading = false;
          if(res.code === 200) {
            let data:any[] = res.data.department_category;
            this.categoryArray = data.sort((a:any, b:any) => a.sequence - b.sequence).filter( v => v.active);
          }
        });
      }
    
      destroyModal(data:any, isEdit: boolean = false): void {
        this.modal.destroy({
          data: data,
          isEdit: isEdit
        });
      }
}
