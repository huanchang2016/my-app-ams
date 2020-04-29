import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor() { }

  exportExcel(list:any) {
    console.log('export ', list);
    //列标题
    let str = `<tr style="font-weight: bold;">
        <td>名称</td>
        <td>供应商编码</td>
        <td>客户编码</td>
        <td>法人</td>
        <td>电话</td>
        <td>地址</td>
        <td>统一社会信用代码</td>
        <td>开户行名称</td>
        <td>开户行账号</td>
      </tr>`;
    //循环遍历，每行加入tr标签，每个单元格加td标签
    for (let i = 0; i < list.length; i++) {
      const rowItem: any = list[i];
      str += `<tr style="mso-number-format:'\@';">
        <td>${ rowItem.name + '\t'}</td>
        <td>${ rowItem.customer_code ? rowItem.customer_code : '' + '\t'}</td>
        <td>${ rowItem.supplier_code ? rowItem.supplier_code : '' + '\t'}</td>
        <td>${ rowItem.represent ? rowItem.represent : '' + '\t'}</td>
        <td>${ rowItem.tel ? rowItem.tel : '' + '\t'}</td>
        <td>${ rowItem.address ? rowItem.address : '' + '\t'}</td>
        <td>${ rowItem.code ? rowItem.code : '' + '\t'}</td>
        <td>${ rowItem.bank_name ? rowItem.bank_name : '' + '\t'}</td>
        <td>${ rowItem.bank_account ? rowItem.bank_account : '' + '\t'}</td>
      </tr>`;
    }
    //Worksheet名
    const worksheet = 'Sheet1'
    const uri = 'data:application/vnd.ms-excel;base64,';

    //下载的表格模板数据
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
    xmlns:x="urn:schemas-microsoft-com:office:excel" 
    xmlns="http://www.w3.org/TR/REC-html40">
    <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>${worksheet}</x:Name>
      <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
      </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head><body><table>${str}</table></body></html>`;
    //下载模板
    window.location.href = uri + this.base64(template);

  }
  //输出base64编码
  base64(s) {
    return window.btoa(unescape(encodeURIComponent(s)))
  }
}
