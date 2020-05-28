import { Component, OnInit, Input } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { SubincomeFormCComponent } from './subincome-form-c/subincome-form-c.component';

@Component({
  selector: 'app-pro-subincome-list-c',
  templateUrl: './pro-subincome-list-c.component.html',
  styles: []
})
export class ProSubincomeListCComponent implements OnInit {
  @Input() tax:any;

  userList:any[] = [];

  list: any[] = [];
  listOfData:any[] = [];
  loading: boolean = false;
  

  constructor(
    private modalService: NzModalService,
    private commonFn: CommonFunctionService,
    private msg: NzMessageService,
    private settingsConfigService: SettingsConfigService
  ) {
    // 获取当前单位下的用户信息
    
  }

  ngOnInit() {
    this.getDataList();
  }

  // status: boolean = true;

  // statusChange() {
  //   this.getDataList();
  // }

  add() :void {
    this.createComponentModal();
  }

  edit(data:any): void {
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '税目类别',
      nzContent: SubincomeFormCComponent,
      // nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        tax_id: this.tax.id,
        data: data
      },
      nzFooter: null
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

    // Return a result when closed
    modal.afterClose.subscribe(result => {
      if(result) {
        if(result.data) {
          this.sortByDrag(result.data.id);
        }else {
          this.sortByDrag();
        }
        
      }
    });

  }
  
  cancel(): void {}

  disabled(id:number): void {
    const option:any = {
      tax_fee_ids: [id],
      tax_id: this.tax.id
    };
    this.settingsConfigService
        .post('/api/tax/fee/disable', option)
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('禁用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.sortByDrag();
          }else {
            this.msg.error(res.error || '禁用失败，请重试');
          }
    })
  }
  enabled(id:number): void {
    const option:any = {
      tax_fee_ids: [id],
      tax_id: this.tax.id
    };
    this.settingsConfigService
        .post('/api/tax/fee/enable', option)
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('启用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
            this.sortByDrag();
          }else {
            this.msg.error(res.error || '启用失败，请重试');
          }
    })
  }
  
  getDataList(id:number = this.tax.id) { // 获取单位下的数据
    if(!id) {
      return;
    }
    let url:string = `/api/tax/fee/${id}`;
    // if(!this.status) {
    //   url =`/api/tax/fee/disable/${id}`;
    // }
    this.loading = true;
    this.settingsConfigService.get(url).subscribe((res:ApiData) => {
      // console.log(res, 'tax_fee list');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.tax_fee;
        this.listOfData = data.sort((a:any, b:any) => a.sequence - b.sequence);
      }
    });
  }
  // 排序
  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.listOfData, event.previousIndex, event.currentIndex);
    this.sortByDrag();
  }

  sortByDrag(addId?:number) :void {
    let fees:any = this.listOfData.map(( val: any, index:number) => {
      return {
        fee_id: val.id,
        sequence: index + 1
      };
    });
    if(addId) {
      fees.push({
        fee_id: addId,
        sequence: this.listOfData.length + 1
      })
    }
    const option:any = {
      tax_id: this.tax.id,
      fees: fees
    };
    this.settingsConfigService.post('/api/tax/fee/sort', option).subscribe( _ => this.getDataList());
  }
}
