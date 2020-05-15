import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NoticeIconList, NoticeItem } from '@delon/abc/notice-icon';
import add from 'date-fns/add';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parse from 'date-fns/parse';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { zip } from 'rxjs';
import { _HttpClient } from '@delon/theme';

/**
 * 菜单通知
 */
@Component({
  selector: 'header-notify',
  template: `
    <notice-icon
      [data]="data"
      [count]="count"
      [loading]="loading"
      btnClass="alain-default__nav-item"
      btnIconClass="alain-default__nav-item-icon"
      (select)="select($event)"
      (clear)="clear($event)"
    ></notice-icon>
  `,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNotifyComponent {
  data: NoticeItem[] = [
    {
      title: '项目',
      list: [],
      emptyText: '你已查看所有通知',
      emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
      clearText: '',
    },
    {
      title: '合约',
      list: [],
      emptyText: '您已读完所有消息',
      emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg',
      clearText: '',
    },
    {
      title: '非合约',
      list: [],
      emptyText: '你已完成所有待办',
      emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg',
      clearText: '',
    },
    {
      title: '发票',
      list: [
        {
          id: '000000012',
          title: 'ABCD 版本发布',
          description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
          extra: '进行中',
          status: 'processing',
          type: '发票',
        }
      ],
      emptyText: '你已完成所有待办',
      emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg',
      clearText: '',
    }
  ];
  count:Number = 5;
  loading = false;

  constructor(
    private msg: NzMessageService,
    private nzI18n: NzI18nService,
    private httpClient: _HttpClient
  ) {
    this.loadData();
  }

  updateNoticeData(notices: NoticeIconList[]): NoticeItem[] {
    const data = this.data.slice();
    data.forEach((i) => (i.list = []));

    notices.forEach((item) => {
      const newItem = { ...item };
      if (typeof newItem.datetime === 'string') {
        newItem.datetime = parse(newItem.datetime, 'yyyy-MM-dd', new Date());
      }
      if (newItem.datetime) {
        newItem.datetime = formatDistanceToNow(newItem.datetime as Date, { locale: this.nzI18n.getDateLocale() });
      }
      if (newItem.extra && newItem.status) {
        newItem.color = ({
          todo: undefined,
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        } as { [key: string]: string | undefined })[newItem.status];
      }
      data.find((w) => w.title === newItem.type).list.push(newItem);
    });
    return data;
  }

  loadData() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    // console.log('132l3k');
    // zip(
    //   this.httpClient.get('/api/project/submit/forApproval/my'), // 待审批项目
    //   this.httpClient.get('/api/contract/pay/for_approval/my'), // 待审批 合约
    //   this.httpClient.get('/api/treaty/pay/for_approval/my'), // 待审批 非合约
    //   this.httpClient.get('/api/bill/for_approval/my') // 待审批 发票
    // ).subscribe(([projectData, contractData, treatyData, billData]) => {
    //   const projectCount:number = projectData.data.count;
    //   const contractCount:number = contractData.data.count;
    //   const treatyCount:number = treatyData.data.count;
    //   const billCount:number = billData.data.count;

    //   this.count = projectCount + contractCount + treatyCount + billCount;
    //   console.log(this.count);
    // });

    setTimeout(() => {
      const now = new Date();
      this.data = this.updateNoticeData([
        {
          id: '000000001',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
          title: '你收到了 14 份新周报',
          datetime: add(now, { days: 10 }),
          type: '通知',
        },
        {
          id: '000000006',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '曲丽丽 评论了你',
          description: '描述信息描述信息描述信息',
          datetime: '2017-08-07',
          type: '消息',
        },
        {
          id: '000000012',
          title: 'ABCD 版本发布',
          description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
          extra: '进行中',
          status: 'processing',
          type: '待办',
        },
      ]);

      this.loading = false;
    }, 500);
  }

  clear(type: string) {
    this.msg.success(`清空了 ${type}`);
  }

  select(res: any) {
    this.msg.success(`点击了 ${res.title} 的 ${res.item.title}`);
  }
}
