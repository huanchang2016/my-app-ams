import { Component, OnInit, Input } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ApiData } from 'src/app/data/interface.data';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';
import { NodeFormComponent } from './../node-form/node-form.component';

import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
  styles: []
})
export class NodeListComponent implements OnInit {

  @Input() workflowInfo:any;

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

    if(this.workflowInfo) {
      this.getUserList();
    }
  }
  getUserList() {
    this.settingsConfigService.get(`/api/user/company/${this.workflowInfo.company.id}`).subscribe((res:ApiData) => {
      console.log(res, 'users')
      if(res.code === 200) {
        let data:any[] = res.data.user;
        this.userList = data.map( v => {
          return { id: v.id, name: v.name };
        });
      }
    })
  }

  add() :void {
    this.createComponentModal();
  }

  edit(data:any): void {
    console.log('data', data);
    this.createComponentModal(data);
  }

  createComponentModal(data:any = null): void {
    console.log(data);
    const modal = this.modalService.create({
      nzTitle: (!data ? '新增' : '编辑') + '节点',
      nzContent: NodeFormComponent,
      nzWrapClassName: 'modal-lg',
      nzMaskClosable: false,
      nzComponentParams: {
        USERS: this.userList,
        workflow_id: this.workflowInfo.id,
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
          this.getDataList();
        }
        
      }
    });

  }
  
  cancel(): void {}

  disabled(id:number): void {
    const option:any = {
      node_ids: [id],
      workflow_id: this.workflowInfo.id
    };
    this.settingsConfigService
        .post('/api/node/disable', option)
        .subscribe((res:ApiData) => {
          if(res.code === 200) {
            this.msg.success('禁用成功');
            this.listOfData = this.listOfData.filter( v => v.id !== id);
          }else {
            this.msg.error(res.error || '禁用失败，请重试');
          }
    })
  }
  
  getDataList(id:number = this.workflowInfo.id) { // 获取单位下的数据
    if(!id) {
      return;
    }
    this.loading = true;
    this.settingsConfigService.get(`/api/node/workflow/${id}`).subscribe((res:ApiData) => {
      console.log(res, 'node list');
      this.loading = false;
      if(res.code === 200) {
        let data:any[] = res.data.node;
        this.listOfData = data.sort((a:any, b:any) => a.sequence - b.sequence);
      }
    });
  }
  // 排序
  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.listOfData, event.previousIndex, event.currentIndex);
    this.sortByDrag();
  }

  sortByDrag(addNodeId?:number) :void {
    let nodes:any = this.listOfData.map(( val: any, index:number) => {
      return {
        node_id: val.id,
        sequence: index + 1
      };
    });
    console.log(addNodeId, 'addnode id');
    if(addNodeId) {
      nodes.push({
        node_id: addNodeId,
        sequence: this.listOfData.length + 1
      })
    }
    const option:any = {
      workflow_id: this.workflowInfo.id,
      nodes: nodes
    };
    this.settingsConfigService.post('/api/node/sort', option).subscribe( _ => this.getDataList());
  }

}
