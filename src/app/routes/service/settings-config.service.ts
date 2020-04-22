import { Injectable } from '@angular/core';
import { _HttpClient, SettingsService } from '@delon/theme';
import { Observable, zip } from 'rxjs';
import { ApiData } from 'src/app/data/interface.data';

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
    private httpClient: _HttpClient
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
  
  get(api:string, opt?:any): Observable<ApiData> {
    return this.httpClient.get(api, opt);
  }

  
  post(api:string, opt?:any): Observable<ApiData> {
    return this.httpClient.post(api, opt);
  }

}
