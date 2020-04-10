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
    originArray: [],
    projectCateArray: [],
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
      this.httpClient.get('/api/project/origin/list'),  // 获取单位类型
      this.httpClient.get('/api/invoice/all'),  // 获取所有开票方式
    ).subscribe(([nature, origin, invoice]) => {
      // console.log(nature, origin, invoice, 'settings info');
      if(nature.code === 200) {
        this.configs.companyNature = nature.data.company_nature;
      }

      if(origin.code === 200) {
        this.configs.originArray = origin.data.project_origin.sort( (a:any, b:any) => a.sequence - b.sequence);
      }

      if(invoice.code === 200) {
        this.configs.invoiceArray = invoice.data.invoice;
      }

      
      
    });
    // 获取当前用户所在部门 的 项目类型
    if(!this.settings.user.department) {
      return;
    }
    this.httpClient.get(`/api/project_category/department/${this.settings.user.department.id}`).subscribe((res:ApiData) => {
      if(res.code === 200) {
        this.configs.projectCateArray = res.data.project_category.sort( (a:any, b:any) => a.sequence - b.sequence);
      }
    })
  }
  



  get(api:string, opt?:any): Observable<ApiData> {
    return this.httpClient.get(api, opt);
  }

  
  post(api:string, opt?:any): Observable<ApiData> {
    return this.httpClient.post(api, opt);
  }

}
