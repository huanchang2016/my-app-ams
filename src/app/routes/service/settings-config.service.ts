import { Injectable } from '@angular/core';
import { _HttpClient, SettingsService } from '@delon/theme';
import { Observable, zip, interval, of } from 'rxjs';
import { ApiData } from 'src/app/data/interface.data';
import { GlobalSettingsService } from '@core/global-service/global-settings.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsConfigService {

  configs:any = {
    companyArray: [],
    companyNature: [],
    invoiceArray: []
  };

  constructor(
    public settings: SettingsService,
    private httpClient: _HttpClient,
    private globalService: GlobalSettingsService
  ) {
    this.getConfigs();
  }

  getConfigs() {
    zip(
      this.httpClient.get('/api/company_nature/all'),  // 获取单位类型
      this.httpClient.get('/api/invoice/all'),  // 获取所有开票方式
    ).subscribe(([nature, invoice]) => {
      // console.log(nature, origin, invoice, 'settings info');
      if(nature.code === 200) {
        this.configs.companyNature = nature.data.company_nature;
      }

      if(invoice.code === 200) {
        this.configs.invoiceArray = invoice.data.invoice;
      }

    });
    
  }

  resetGlobalTasks() {
    this.globalService.getTaskList();
  }
  
  get(api:string, opt?:any): Observable<ApiData> {
    return this.httpClient.get(api, opt);
  }

  
  post(api:string, opt?:any): Observable<ApiData> {
    return this.httpClient.post(api, opt);
  }

  /***** 测试学习
   * promise 和 Observable 处理请求的区别 
   * 
   * ******/
  count:number = 10;
  getPromiseIntervalData() {
    return new Promise((resolve) => {
      interval(1000).subscribe( () => {
        resolve(this.count++);
      })
    })
  }

  observaleCount:number = 100;
  getObservableIntervalData() {
    return new Observable(
      observer => {
        interval(1000).subscribe(
          () => observer.next(this.observaleCount++)
        )
      }
    )
  }

  /***** 测试学习 end******/
}
