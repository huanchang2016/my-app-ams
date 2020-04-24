import { Injectable } from '@angular/core';
import { zip } from 'rxjs';
import { _HttpClient } from '@delon/theme';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  taskOption:any = {
    totalTaskNumber:  0,
    projectNumber:  0,
    contractNumber:  0,
    treatyNumber:  0,
    billNumber:  0,
  };
  
  constructor(
    private httpClient: _HttpClient
  ) { }
  
  getTaskList() {
    console.log('global settings service works!');
    zip(
      this.httpClient.get('/api/project/submit/forApproval/my'), // 待审批项目
      this.httpClient.get('/api/contract/pay/for_approval/my'), // 待审批 合约
      this.httpClient.get('/api/treaty/pay/for_approval/my'), // 待审批 非合约
      this.httpClient.get('/api/bill/for_approval/my') // 待审批 发票
    ).subscribe(([projectData, contractData, treatyData, billData]) => {
      this.taskOption.projectNumber = projectData.data.count;
      this.taskOption.contractNumber = contractData.data.count;
      this.taskOption.treatyNumber = treatyData.data.count;
      this.taskOption.billNumber = billData.data.count;

      this.taskOption.totalTaskNumber = this.taskOption.projectNumber + this.taskOption.contractNumber + this.taskOption.treatyNumber + this.taskOption.billNumber;

    });
  }
}
