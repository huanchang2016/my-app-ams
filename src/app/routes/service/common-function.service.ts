import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonFunctionService {

  constructor() { }

  
  /****    筛选数据   *****
   * 
   * 1. option中 部含有影响远程数据请求的字段筛选， 如单位变化，显示的职位列表变化，无 company_id 字段
   * 2. 只操作了第一层条件筛选， 
   *    如： company: {id: 1, name: '天府人资' } 这部分筛选条件，
   *    需要在引入组件自行筛选 TODO 备注： 通过单位获取列表的，单位不做查询
   * 3. 解决了查询 如： nature: {id: 1, name: '国有企业' } 的条件查询
   * *****/
  filterListOfData(list:any[], option:any = {}): any[] {
    if(option && Object.keys(option).length !== 0) {
      for (const key in option) {
        if (option.hasOwnProperty(key)) {
          list = list.filter(v => {
            // 如果需要查询到下一层 如  nature.id 
            console.log(v[key])
            if(typeof(v[key]) !== 'object') {
              if(typeof(v[key]) === 'string') {
                if(option[key] == null) return v; 
                return (v[key].toUpperCase()).indexOf((option[key].toUpperCase())) !== -1 ? v : false;
              }else {
                return v[key] === option[key] ? v : false;
              }
            }else {
              if(!option[key]) return v;
              if(!v[key])  return false; // 列表数据中当前条件值为 null
              return v[key].id === option[key] ? v : false;
            }
          });
        }
      }
    }
    
    return list.sort((a:any, b:any) => a.sequence ? a.sequence - b.sequence : 1);
  }
}
