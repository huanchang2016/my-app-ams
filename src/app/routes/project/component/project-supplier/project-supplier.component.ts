import { ProjectSupplierFormComponent } from './component/project-supplier-form/project-supplier-form.component';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ApiData } from 'src/app/data/interface.data';

@Component({
  selector: 'app-project-supplier',
  templateUrl: './project-supplier.component.html',
  styleUrls: ['./project-supplier.component.less']
})
export class ProjectSupplierComponent implements OnChanges, OnInit {

  @Input() projectInfo:any;

  @Output() prevStepsChange:EventEmitter<any> = new EventEmitter();
  @Output() nextStepsChange:EventEmitter<any> = new EventEmitter();

  dataList:any[] = [];

  // isAllDisplayDataChecked = false;
  // isOperating = false;
  // isIndeterminate = false;
  // listOfDisplayData: any[] = [];
  listOfAllData: any[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  // numberOfChecked = 0;


  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private modalService: NzModalService,
    public settingConfigService: SettingsConfigService
  ) { }

  serviceCategory:any[] = [];
  

  ngOnChanges() {
    if(this.projectInfo) {
      this.getSupplierInfo();
      this.getServiceCategory();
    }
  }

  ngOnInit(): void {
    
  }
  
  showContract(id:number):void {
    this.showExpand[id] = !this.showExpand[id];
  }
  
  addSupplier():void {
    this.creatModalComponent();
  }

  editSupplier(data:any):void {
    this.creatModalComponent(data);
  }

  creatModalComponent(data?:any): void {
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '供应商',
      nzWrapClassName: 'modal-lg',
      nzContent: ProjectSupplierFormComponent,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data,
        projectId: this.projectInfo.id,
        supplierArray: this.listOfAllData
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getSupplierInfo();
      }
    });
  }
  
  
  
  // refreshStatus(): void {
  //   this.isAllDisplayDataChecked = this.listOfDisplayData
  //     .every(item => this.mapOfCheckedId[item.id]);
  //   this.isIndeterminate =
  //     this.listOfDisplayData.some(item => this.mapOfCheckedId[item.id]) &&
  //     !this.isAllDisplayDataChecked;
  //   this.numberOfChecked = this.listOfAllData.filter(item => this.mapOfCheckedId[item.id]).length;
  // }

  // checkAll(value: boolean): void {
  //   this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedId[item.id] = value));
  //   this.refreshStatus();
  // }

  // 删除所有选择的 供应商 数据
  // deletedSelectList(): void {
  //   this.isOperating = true;
  //   setTimeout(() => {
  //     this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
  //     this.refreshStatus();
  //     this.isOperating = false;
  //   }, 1000);
  // }


  showExpand:{ [key: string]: boolean } = {};

  getSupplierInfo() {

    this.settingConfigService.get(`/api/supplier/project/${this.projectInfo.id}`).subscribe((res:ApiData) => {
      // console.log(res, 'get supplier info!');
      if(res.code === 200) {
        // this.listOfDisplayData = this.listOfAllData = res.data.supplier;
        this.listOfAllData = res.data.supplier;
        // 是否默认展示供应商下 合约列表数据
        this.listOfAllData.forEach(item => (this.showExpand[item.id] = false));
      }
    })
  }

  getServiceCategory():void {
    this.settingConfigService.get(`/api/service/category/${this.projectInfo.company.id}`).subscribe((res:ApiData) => {
      // console.log(res);
      if(res.code === 200) {
        const list:any[] = res.data.service_category;
        this.serviceCategory = list.filter( v => v.active );
      }
    });
  }

  prevSteps() {
    this.prevStepsChange.emit();
  }
  
  nextSteps() {
    this.nextStepsChange.emit();
  }
  
  deleted(id:number):void {
    const opt:any = {
      supplier_id: id,
      project_id: this.projectInfo.id
    };
    
    this.settingConfigService.post(`/api/supplier/project/delete`, opt).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.msg.success('供应商删除成功');
        // this.listOfDisplayData = this.listOfAllData = this.listOfAllData.filter( v => v.id !== id);
        this.listOfAllData = this.listOfAllData.filter( v => v.id !== id);
      }else {
        this.msg.error(res.error || '删除失败');
      }
    })
  }

  cancel(): void {}
}
