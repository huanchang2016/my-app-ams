import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showTextareaContent'
})
export class ShowTextareaContentPipe implements PipeTransform {

  transform(value: string = ''): any {
    if(!value) return '';
    let str: string = value.replace(/\r\n/g, "<br>")
    let val = str.replace(/\n/g, "<br>");
    if(val.indexOf(' ') != -1) {
      val = val.replace(/\s/g, '&nbsp;');
    }
    return val;
  }

}
