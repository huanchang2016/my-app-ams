import { BillExcuteListComponent } from './bill-manage/bill-excute/bill-excute-list/bill-excute-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// 发票开具申请
import { BillApplyProjectsComponent } from './bill-manage/bill-apply/bill-apply-projects/bill-apply-projects.component';
import { BillReminderInvoicesListComponent } from './bill-manage/control-over-invoices/invoices-list/invoices-list.component';
import { InvoicesFormManageComponent } from './bill-manage/control-over-invoices/invoices-form-manage/invoices-form-manage.component';
import { BillReminderBillApplyInProgressComponent } from './bill-manage/bill-apply/bill-apply-in-progress/bill-apply-in-progress.component';
import { BillApplyPassComponent } from './bill-manage/bill-apply/bill-apply-pass/bill-apply-pass.component';
import { BillApplyRefusedComponent } from './bill-manage/bill-apply/bill-apply-refused/bill-apply-refused.component';

// 发票开具 审批
import { BillApproveBemyComponent } from './bill-manage/bill-approve/bill-approve-bemy/bill-approve-bemy.component';
import { BillApproveFormyComponent } from './bill-manage/bill-approve/bill-approve-formy/bill-approve-formy.component';
import { BillApproveFinishedComponent } from './bill-manage/bill-approve/bill-approve-finished/bill-approve-finished.component';
import { BillApproveWithoutComponent } from './bill-manage/bill-approve/bill-approve-without/bill-approve-without.component';

// 开票执行情况
import { BillExcuteNotStartComponent } from './bill-manage/bill-excute/bill-excute-not-start/bill-excute-not-start.component';
import { BillExcuteFinishedComponent } from './bill-manage/bill-excute/bill-excute-finished/bill-excute-finished.component';

// 发票详情
import { BillReminderInvoicesInfoViewComponent } from './bill-manage/control-over-invoices/invoices-info-view/invoices-info-view.component';

import { ACLGuard, ACLType } from '@delon/acl';

import { BillApplyListComponent } from './bill-manage/bill-apply/bill-apply-list/bill-apply-list.component';
import { BillApproveListComponent } from './bill-manage/bill-approve/bill-approve-list/bill-approve-list.component';

const routes: Routes = [
  { path: 'apply/project/list', component: BillApplyProjectsComponent },
  // 项目下的开票申请列表
  { path: 'apply/invoices/list/:id', component: BillReminderInvoicesListComponent, data: { title: '项目发票'} },
  { path: 'apply/invoices/add', component: InvoicesFormManageComponent, data: { title: '新增项目发票'} },
  { path: 'apply/invoices/edit/:id', component: InvoicesFormManageComponent, data: { title: '编辑项目发票'} },

  { path: 'apply', component: BillApplyListComponent,
    children: [
      { path: '', redirectTo: 'in_progress', pathMatch: 'full' },
      { path: 'in_progress', component: BillReminderBillApplyInProgressComponent },
      { path: 'pass', component: BillApplyPassComponent },
      { path: 'refused', component: BillApplyRefusedComponent }
    ]
  },

  // 开票审批
  { path: 'approve', component: BillApproveListComponent,
    children: [
      { path: '', redirectTo: 'forApprove', pathMatch: 'full' },
      { path: 'forApprove', component: BillApproveFormyComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['bill_approval']
          }
        }
      },
      { path: 'finished', component: BillApproveFinishedComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['bill_approval']
          }
        }
      },
      { path: 'my', component: BillApproveBemyComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['bill_approval']
          }
        }
      },
      { path: 'without', component: BillApproveWithoutComponent,
        canActivate: [ACLGuard],
        data: {
          guard: <ACLType>{
            ability: ['bill_approval']
          }
        }
      }
    ]
  },
  // 开票执行情况，路由
  // 待执行 任务
  { path: 'excute', component: BillExcuteListComponent,
    children: [
      { path: '', redirectTo: 'my', pathMatch: 'full' },
      { path: 'my', component: BillExcuteNotStartComponent,
        // canActivate: [ACLGuard],
        // data: {
        //   guard: <ACLType>{
        //     ability: ['bill_approval']
        //   }
        // }
      },
      { path: 'finished', component: BillExcuteFinishedComponent,
        // canActivate: [ACLGuard],
        // data: {
        //   guard: <ACLType>{
        //     ability: ['bill_approval']
        //   }
        // }
      },
    ]
  },
  
  

  // 发票开具 详情
  { path: 'apply/invoices/view/:id', component: BillReminderInvoicesInfoViewComponent, data: { title: '开票详情'} },

  // 发票审批 详情
  { path: 'approve/view/:id', component: BillReminderInvoicesInfoViewComponent, data: { title: '开票详情'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillReminderRoutingModule { }
