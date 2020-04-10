import { Component, OnInit } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { List, ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { ProjectCategoryFormComponent } from './project-category-form/project-category-form.component';

import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-project-category',
  templateUrl: './project-category.component.html',
  styles: [`
    .oper-td a { white-space: nowrap; }
  `]
})
export class ProjectCategoryComponent implements OnInit {
  companyArray: List[] = [];
  departmentArray: List[] = [];
  // 单位id
  companyId:number = null;
  departmentId:number = null;

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  constructor(
    private modalService: NzModalService,
    private commonFn: CommonFunctionService,
    private msg: NzMessageService,
    private settingConfigService: SettingsConfigService
  ) {
    this.settingConfigService.get('/api/company/user/all').subscribe((res:ApiData) => {
      if(res.code === 200) {
        let data:any[] = res.data.company;
        this.companyArray = data.map( v => {
          return { id: v.id, name: v.name };
        });
      }
    })
  }

  ngOnInit() {

  }

  add() :void {
    if(this.departmentId) {
      this.createComponentModal();
    }else {
      this.msg.warning('请先选择所属部门');
    }
  }

  edit(data:any): void {
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '项目类型',
      nzContent: ProjectCategoryFormComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        companyId: this.companyId,
        departmentId: this.departmentId,
        COMPANY: this.companyArray,
        total: this.listOfData.length,
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result && this.departmentId) {
        this.getDataList();
      }
    });

  }
  
  disabled(id:number):void {
    this.settingConfigService.post('/api/project_category/disable', { category_ids: [id] })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('禁用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.list = this.list.map( v => {
              if(v.id === id ) v.active = false;
              return v;
            });
          }else {
            this.msg.error(res.error || '禁用失败')
          }
    });
  }
  enabled(id:number):void {
    this.settingConfigService.post('/api/project_category/enable', { category_ids: [id] })
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('启用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.list = this.list.map( v => {
              if(v.id === id ) v.active = true;
              return v;
            });
          }else {
            this.msg.error(res.error || '启用失败')
          }
    })
  }


  // 搜索条件发生变化
  searchOptionsChange(option?:any) {
    if(this.list.length !== 0) {
      let object:any = {};
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          const element = option[key];
          if(key !== 'company_id') {
            object[key] = element;
          }
        }
      }
      this.listOfData = this.commonFn.filterListOfData(this.list, object);
    }
  }
  // 单位筛选发生变化
  companyValueChange({company_id}):void {
    this.companyId = company_id;
    this.settingConfigService.get(`/api/department/${company_id}`).subscribe((res:ApiData) => {
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

  departmentValueChange({department_id}):void {
    this.departmentId = department_id;
    this.getDataList();
  }
  
  getDataList() { // 获取单位下的数据
    this.loading = true;
    this.settingConfigService.get(`/api/project_category/department/${this.departmentId}`).subscribe((res:ApiData) => {
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.project_category;
        // this.list = data.sort((a:any, b:any) => a.sequence - b.sequence);
        this.list = data;
        this.searchOptionsChange();
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.listOfData, event.previousIndex, event.currentIndex);
    let categories:any = this.listOfData.map(( val: any, index:number) => {
      return {
        category_id: val.id,
        sequence: index + 1
      };
    });
    this.sortByDrag({ categories: categories });
  }

  sortByDrag(opt:any) :void {
    this.settingConfigService.post('/api/project_category/sort', opt).subscribe();
  }

}
