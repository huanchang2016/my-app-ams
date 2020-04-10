import { Component } from '@angular/core';

@Component({
  selector: 'layout-passport',
  templateUrl: './passport.component.html',
  styleUrls: ['./passport.component.less'],
})
export class LayoutPassportComponent {
  links = [
    {
      title: '天府菁英网',
      href: 'http://www.cdtfhr.com',
      blankTarget: true
    },
    {
      title: '云课堂',
      href: 'http://cdtfhr.yunxuetang.cn/login.htm',
      blankTarget: true
    },
    {
      title: '菁英招聘',
      href: 'http://www.cdtfhr.com/zhaopin',
      blankTarget: true
    },
    {
      title: '薪酬绩效',
      href: 'http://kpi.cdtfhr.com',
      blankTarget: true
    },
  ];
}
