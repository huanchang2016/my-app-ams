import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-user-forms',
  templateUrl: './user-forms.component.html',
  styles: [
    `
      [nz-form] {
        max-width: 600px;
        margin: 0 auto;
      }
    `
  ]
})
export class UserFormsComponent implements OnInit {
  @Input() data:any;
  @Input() COMPANY:List[];
  @Input() companyId:number;

  departmentArray:List[] = [];
  departmentLoading:boolean = false;
  positionArray:List[] = [];
  positionLoading:boolean = false;

  validateForm: FormGroup;
  isEditUsername: boolean = true;

  submitLoading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private settingConfigService: SettingsConfigService
  ) { }


  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      username: [ null, [Validators.required]],
      tel: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(11)]],
      mail: [null, [Validators.email]],
      company_id: [ this.companyId, [Validators.required] ],
      department_id: [ null, [Validators.required] ],
      position_id: [ null, [Validators.required] ]
    });

    // 获取当前单位下的 部门
    if(this.companyId) {
      this.getDepartment(this.companyId);
    }



    // this.validateForm.get('department_id').valueChanges.subscribe( id => {
    //   if(id) {
    //     this.validateForm.patchValue({
    //       position_id: null
    //     })
    //     this.getPosition(id);
    //   }
    // });
    

    if(this.data) {
      //  如果存在 data， 那么需要给表单设置
      this.setFormValue(this.data);
    }
  }

  nameChange(val:string):void {
    this.isEditUsername = true;
    if(val.trim()) {
      this.settingConfigService.post('/api/user/username/generate', { name: val }).subscribe((res:ApiData) => {
        if(res.code === 200) {
          this.isEditUsername = false;
          this.validateForm.patchValue({
            username: res.data.username
          })
        }
        
      })
    }
  }
  usernameValueChange():void {
    if(!this.validateForm.get('name').value || !this.validateForm.get('name').value.trim()) {
      this.validateForm.patchValue({
        username: ''
      })
    }
  }

  companyValueChange() {
    if(this.validateForm.value.company_id) {
      this.validateForm.patchValue({
        department_id: null,
        position_id: null
      });
      this.getDepartment(this.validateForm.value.company_id);
    }
  }
  departmentValueChange() {
    if(this.validateForm.value.department_id) {
      this.validateForm.patchValue({
        position_id: null
      });
      
      this.getPosition(this.validateForm.value.department_id);
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
        // this.edit();
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
    this.settingConfigService.post('/api/user/create', opt).subscribe((res:ApiData) => {
      this.submitLoading = false;
      if(res.code === 200) {
        this.msg.success('创建成功');
        this.destroyModal(opt, false);
      }else {
        this.msg.error(res.error || '创建失败');
      }
    });
  }

  // edit() {
  //   let opt:any = {
  //     name: this.validateForm.value.name,
  //     is_leader: this.validateForm.value.is_leader,
  //     sequence: this.validateForm.value.sequence,
  //     description: this.validateForm.value.description
  //   };
    
  //   let obj:any = Object.assign({ position_id: this.data.id }, opt);

  //   this.settingConfigService.post('/api/user/update', obj).subscribe((res:ApiData) => {
  //     console.log(res);
  //     this.submitLoading = false;
  //     if(res.code === 200) {
  //       this.msg.success('更新成功');
  //       this.destroyModal(obj, true);
  //     }else {
  //       this.msg.error(res.error || '更新失败');
  //     }
  //   });
  // }

  setFormValue(data:any) :void {
    console.log(data);
    this.validateForm.patchValue({
      name: data.name,
      username: data.username,
      tel: data.tel,
      mail: data.mail,
      company_id: data.company.id,
      department_id: data.department.id,
      position_id: data.position.id
    });

    // this.getDepartment()
  }

  getDepartment(id:number): void {
    this.departmentLoading = true;
    this.departmentArray = [];
    this.settingConfigService.get(`/api/department/${id}`).subscribe((res:ApiData) => {
      this.departmentLoading = false;
      if(res.code === 200) {
        let data:any[] = res.data.department;
        this.departmentArray = data.sort((a:any, b:any) => a.sequence - b.sequence)
                                   .filter( v => v.active )
                                   .map( v => {
                                     return { id: v.id, name: v.name };
                                   });
      }
    });
  }
  getPosition(id:number): void {
    this.positionLoading = true;
    this.positionArray = [];
    this.settingConfigService.get(`/api/position/department/${id}`).subscribe((res:ApiData) => {
      this.positionLoading = false;
      if(res.code === 200) {
        let data:any[] = res.data.position;
        this.positionArray = data.sort((a:any, b:any) => a.sequence - b.sequence)
                                   .filter( v => v.active )
                                   .map( v => {
                                     return { id: v.id, name: v.name };
                                   });
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
