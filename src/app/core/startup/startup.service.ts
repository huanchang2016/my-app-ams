import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN, preloaderFinished, Menu } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ACLService } from '@delon/acl';

import { NzIconService } from 'ng-zorro-antd/icon';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { ICONS } from '../../../style-icons';
import { ApiData } from 'src/app/data/interface.data';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 * 初始基础数据信息
 */
@Injectable()
export class StartupService {

  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }


  menuData(permissions: any[]): Menu[] {
    const permissionGroup: string[] = permissions.map(v => v.code);
    
    this.aclService.setAbility(permissionGroup);
    window.localStorage.setItem('cw_permission', JSON.stringify(permissionGroup));

    return [
      {
        text: '',
        group: true,
        hideInBreadcrumb: true,
        children: [
          {
            text: '数据中心',
            link: '/dashboard',
            icon: { type: 'icon', value: 'appstore' }
          },
          {
            text: '项目管理',
            link: '/project',
            icon: { type: 'icon', value: 'bars' },
            children: [
              {
                text: '新建项目',
                link: '/project/create'
              },
              {
                text: '我的项目',
                // link: '/project/list'
                link: '/project/my-project'
                // children: [
                //   {
                //     text: '草稿',
                //     link: '/project/list/draft'
                //   },
                //   {
                //     text: '待审核',
                //     link: '/project/list/progress'
                //   },
                //   {
                //     text: '未通过',
                //     link: '/project/list/refuse'
                //   },
                //   {
                //     text: '已通过',
                //     link: '/project/list/finished'
                //   }
                // ]
              },
              {
                text: '项目审批',
                // link: '/project/approval',
                link: '/project/approvalList',
                hide: this.isHideRouter(['project_approval'], permissionGroup)
                // children: [
                //   {
                //     text: '我的审批',
                //     link: '/project/approve'
                //   },
                //   {
                //     text: '待审批',
                //     link: '/project/forApproved'
                //   },
                //   {
                //     text: '已审批',
                //     link: '/project/approved'
                //   }
                // ]
              },
              {
                text: '项目列表',
                link: '/project/projectList',
                hide: this.isHideRouter(['project_management_list'], permissionGroup),
              },
              {
                text: '项目列表(部门负责人)',
                link: '/project/department_head_list',
                hide: this.isHideRouter(['project_department_management_list'], permissionGroup),
              },
            ]
          },
          {
            text: '项目调整',
            link: '/adjust',
            icon: { type: 'icon', value: 'bars' },
            children: [
              {
                text: '我的项目',
                link: '/adjust/my'
              },
              {
                text: '我的调整',
                link: '/adjust/myAdjust'
              },
              {
                text: '调整审批',
                link: '/adjust/approvel'
              },
              {
                text: '调整列表',
                link: '/adjust/list',
                hide: this.isHideRouter(['adjustment_management_list'], permissionGroup),
              },
            ]
          },
          {
            text: '合约支付管理',
            link: '/approve/contract',
            icon: { type: 'icon', value: 'audit' },
            children: [
              {
                text: '支付草稿',
                // link: '/approve/list'
                link: '/approve/list'
              },
              {
                text: '我的支付',
                // link: '/approve/contract/apply'
                link: '/approve/contract/myApply'
                // children: [
                //   {
                //     text: '审批中',
                //     link: '/approve/contract/apply/in_progress'
                //   },
                //   {
                //     text: '已通过',
                //     link: '/approve/contract/apply/pass'
                //   },
                //   {
                //     text: '未通过',
                //     link: '/approve/contract/apply/refuse'
                //   }
                // ]
              },
              {
                text: '支付审批',
                // link: '/approve/contract/pay',
                link: '/approve/contract/approve',
                hide: this.isHideRouter(['contract_pay_approval'], permissionGroup),
                // children: [
                //   {
                //     text: '我的审批',
                //     link: '/approve/contract/pay/progress'
                //   },
                //   {
                //     text: '待审批',
                //     link: '/approve/contract/pay/forApproval'
                //   },
                //   {
                //     text: '已审批',
                //     link: '/approve/contract/pay/finished'
                //   }
                //   // {
                //   //   text: '未审批未通过',
                //   //   link: '/approve/contract/pay/without-pass'
                //   // }
                // ]
              },
              {
                text: '支付执行',
                // link: '/approve/contract/excute'
                link: '/approve/contract/excuteList',
                hide: this.isHideRouter(['contract_pay_execute'], permissionGroup),
                // children: [
                //   {
                //     text: '待执行',
                //     link: '/approve/contract/excute/my'
                //   },
                //   {
                //     text: '已执行',
                //     link: '/approve/contract/excute/finished'
                //   }
                // ]
              },
              {
                text: '支付列表',
                link: '/approve/contract/list',
                hide: this.isHideRouter(['contract_pay_management_list'], permissionGroup),
              },
              {
                text: '支付列表(部门负责人)',
                link: '/approve/contract/department_head_list',
                hide: this.isHideRouter(['contract_pay_department_management_list'], permissionGroup),
              },
            ]
          },
          {
            text: '非合约支付管理',
            link: '/approve/no-contract',
            icon: { type: 'icon', value: 'exception' },
            children: [
              {
                text: '支付草稿',
                link: '/approve/no-contract/list'
              },
              {
                text: '我的支付',
                // link: '/approve/no-contract/apply'
                link: '/approve/no-contract/myApply'
                // children: [
                //   {
                //     text: '审批中',
                //     link: '/approve/no-contract/apply/in_progress'
                //   },
                //   {
                //     text: '已通过',
                //     link: '/approve/no-contract/apply/pass'
                //   },
                //   {
                //     text: '未通过',
                //     link: '/approve/no-contract/apply/refuse'
                //   }
                // ]
              },
              {
                text: '支付审批',
                // link: '/approve/no-contract/pay',
                link: '/approve/no-contract/approve',
                hide: this.isHideRouter(['treaty_pay_approval'], permissionGroup)
                // children: [
                //   {
                //     text: '我的审批',
                //     link: '/approve/no-contract/pay/progress'
                //   },
                //   {
                //     text: '待审批',
                //     link: '/approve/no-contract/pay/forApproval'
                //   },
                //   {
                //     text: '已审批',
                //     link: '/approve/no-contract/pay/finished'
                //   }
                //   // {
                //   //   text: '未审批未通过',
                //   //   link: '/approve/no-contract/pay/without-pass'
                //   // }
                // ]
              },
              {
                text: '支付执行',
                // link: '/approve/no-contract/excute',
                link: '/approve/no-contract/excuteList',
                hide: this.isHideRouter(['treaty_pay_execute'], permissionGroup),
                // children: [
                //   {
                //     text: '待执行',
                //     link: '/approve/no-contract/excute/my'
                //   },
                //   {
                //     text: '已执行',
                //     link: '/approve/no-contract/excute/finished'
                //   }
                // ]
              },
              {
                text: '支付列表',
                link: '/approve/no-contract/applyList',
                hide: this.isHideRouter(['treaty_pay_management_list'], permissionGroup),
              },
              {
                text: '支付列表(部门负责人)',
                link: '/approve/no-contract/department_head_list',
                hide: this.isHideRouter(['treaty_pay_department_management_list'], permissionGroup),
              },

            ]
          },

          {
            text: '发票管理',
            link: '/bill',
            icon: { type: 'icon', value: 'transaction' },
            children: [
              {
                text: '发票草稿',
                link: '/bill/project'
              },
              {
                text: '我的发票',
                // link: '/bill/apply'
                link: '/bill/myBill'
                // children: [
                //   {
                //     text: '开票项目',
                //     link: '/bill/apply/projects'
                //   },
                //   {
                //     text: '进行中',
                //     link: '/bill/apply/in_progress'
                //   },
                //   {
                //     text: '已通过',
                //     link: '/bill/apply/pass'
                //   },
                //   {
                //     text: '已拒绝',
                //     link: '/bill/apply/refused'
                //   }
                // ]
              },
              {
                text: '发票审批',
                // link: '/bill/approve',
                link: '/bill/approveList',
                hide: this.isHideRouter(['bill_approval'], permissionGroup)
                // children: [
                //   {
                //     text: '我审批的',
                //     link: '/bill/approve/my'
                //   },
                //   {
                //     text: '待审批',
                //     link: '/bill/approve/forApprove'
                //   },
                //   {
                //     text: '已审批',
                //     link: '/bill/approve/finished'
                //   }
                // ]
              },
              {
                text: '发票执行',
                // link: '/bill/excute',
                link: '/bill/excuteList',
                hide: this.isHideRouter(['bill_execute'], permissionGroup),
                // children: [
                //   {
                //     text: "待执行",
                //     link: '/bill/excute/my'
                //   },
                //   {
                //     text: '已执行',
                //     link: '/bill/excute/finished'
                //   }
                // ]
              },
              {
                text: '发票列表',
                link: '/bill/list',
                hide: this.isHideRouter(['bill_management_list'], permissionGroup),
              },
              {
                text: '发票列表(部门负责人)',
                link: '/bill/department_head_list',
                hide: this.isHideRouter(['bill_department_management_list'], permissionGroup),
              },
            ]
          },
          {
            text: '合同管理',
            link: '/contract',
            icon: { type: 'icon', value: 'file-protect' },
            // hide: this.isHideRouter(['cost_list', 'tax_list', 'supplier_service_list'], permissionGroup),
            children: [
              {
                text: '合同列表',
                link: '/contract/list',
                // hide: this.isHideRouter(['cost_list'], permissionGroup)
              }
            ]
          },
          {
            text: '财务处理凭证',
            link: '/financial',
            icon: { type: 'icon', value: 'heat-map' },
            // hide: this.isHideRouter(['cost_list', 'tax_list', 'supplier_service_list'], permissionGroup),
            children: [
              {
                text: '合约凭证',
                // link: '/financial/contract',
                link: '/financial/contractList',
                hide: this.isHideRouter(['contract_pay_certificate'], permissionGroup)
              },
              {
                text: '非合约凭证',
                // link: '/financial/treaty',
                link: '/financial/treatyList',
                hide: this.isHideRouter(['treaty_pay_certificate'], permissionGroup)
              },
              {
                text: '发票凭证',
                // link: '/financial/bill',
                link: '/financial/billList',
                hide: this.isHideRouter(['bill_certificate'], permissionGroup)
              }
            ]
          },
          {
            text: '项目配置管理',
            link: '/pro-settings',
            icon: { type: 'icon', value: 'control' },
            hide: this.isHideRouter(['cost_list', 'tax_list', 'supplier_service_list'], permissionGroup),
            children: [
              {
                text: '成本类型配置',
                link: '/pro-settings/cost',
                hide: this.isHideRouter(['cost_list'], permissionGroup)
              },
              {
                text: '税目配置（收入）',
                link: '/pro-settings/income',
                hide: this.isHideRouter(['tax_list'], permissionGroup)
              },
              {
                text: '服务商类型',
                link: '/pro-settings/service-category',
                hide: this.isHideRouter(['supplier_service_list'], permissionGroup)
              },
              {
                text: '合同类型',
                link: '/pro-settings/contract-category',
                // hide: this.isHideRouter(['supplier_service_list'], permissionGroup)
              }
            ]
          },
          {
            text: '项目流程管理',
            link: '/workflow',
            icon: { type: 'icon', value: 'sort-ascending' },
            hide: this.isHideRouter(['workflow_list', 'quota_list'], permissionGroup),
            children: [
              {
                text: '流程列表',
                link: '/workflow/list',
                hide: this.isHideRouter(['workflow_list'], permissionGroup)
              },
              {
                text: '流程限额配置',
                link: '/workflow/quota-settings',
                hide: this.isHideRouter(['quota_list'], permissionGroup)
              }
            ]
          },
          {
            text: '基础配置',
            link: '/company',
            icon: { type: 'icon', value: 'setting' },
            hide: this.isHideRouter(['user_company_list', 'customer_company_list', 'supplier_company_list', 'department_list', 'department_category_list', 'project_category_list', 'position_list'], permissionGroup),
            children: [
              {
                text: '单位管理',
                hide: this.isHideRouter(['user_company_list', 'customer_company_list', 'supplier_company_list'], permissionGroup),
                children: [
                  {
                    text: '用户单位',
                    link: '/company/list',
                    hide: this.isHideRouter(['user_company_list'], permissionGroup)
                  },
                  {
                    text: '客户单位',
                    link: '/company/customer',
                    hide: this.isHideRouter(['customer_company_list'], permissionGroup)
                  },
                  {
                    text: '供应商',
                    link: '/company/supplier',
                    hide: this.isHideRouter(['supplier_company_list'], permissionGroup)
                  }
                ]
              },
              {
                text: '部门配置',
                link: '/department',
                hide: this.isHideRouter(['department_list', 'department_category_list', 'project_category_list'], permissionGroup),
                children: [
                  {
                    text: '部门管理',
                    link: '/department/list',
                    hide: this.isHideRouter(['department_list'], permissionGroup)
                  },
                  {
                    text: '部门类型',
                    link: '/department/category',
                    hide: this.isHideRouter(['department_category_list'], permissionGroup)
                  },
                  {
                    text: '项目类型',
                    link: '/department/project-category',
                    hide: this.isHideRouter(['project_category_list'], permissionGroup)
                  },
                  {
                    text: '类型科目',
                    link: '/department/category-subject',
                    hide: this.isHideRouter(['project_category_list'], permissionGroup)
                  }
                ]
              },
              {
                text: '职位管理',
                link: '/position/list',
                hide: this.isHideRouter(['position_list'], permissionGroup)
              }
            ]
          },
          {
            text: '用户管理',
            icon: { type: 'icon', value: 'usergroup-add' },
            hide: this.isHideRouter(['user_list'], permissionGroup),
            children: [
              {
                text: '用户列表',
                link: '/users/list',
                hide: this.isHideRouter(['user_list'], permissionGroup)
              }
            ]
          },
          {
            text: '权限管理',
            icon: { type: 'icon', value: 'key' },
            hide: this.isHideRouter(['permission_list'], permissionGroup),
            children: [
              {
                text: '角色管理',
                link: '/authority/roles',
                hide: this.isHideRouter(['permission_list'], permissionGroup)
              }
            ]
          },
          // {
          //   text: '派遣流程',
          //   link: '/dispatch',
          //   icon: { type: 'icon', value: 'key' },
          //   children: [
          //     {
          //       text: '派遣管理',
          //       link: '/dispatch/index',
          //     },
          //     // {
          //     //   text: '派遣创建',
          //     //   link: '/dispatch/create',
          //     // }
          //   ]
          // }

          {
            text: '报表管理',
            link: '/report',
            icon: { type: 'icon', value: 'key' },
            children: [
              {
                text: '发票报表',
                link: '/report/bill-report',
              },
              // {
              //   text: '派遣创建',
              //   link: '/dispatch/create',
              // }
            ]
          }
        ]
      }
    ];
  }

  isHideRouter(abilities: string[], permissionGroup: string[]): boolean {
    return abilities.filter(v => permissionGroup.includes(v)).length === 0;
  }


  private viaHttp(resolve: any, reject: any) {
    zip(
      this.httpClient.get('/api/user/info/my'),
      this.httpClient.get('/api/permission/my')
    ).pipe(
      catchError(([appData, permissionData]) => {
        resolve(null);
        return [appData, permissionData];
      })
    ).subscribe(([appData, permissionData]) => {
      console.log(appData, permissionData);
      const app: any = {
        name: `财务共享服务中心`,
        description: `全力推进公司业务快速发展，优化流程管理，提高信息化应用效率，提升公司核心竞争力，加大财务管理软件建设与应用力度，天府人资公司菁英软件青年突击队积极对接研发需求，以推动公司信息化水平迈上新台阶，进一步实现办公高效化、规范化、标准化和科学化`
      };
      const user: any = appData.data;
      // Application information: including site name, description, year
      this.settingService.setApp(app);
      // User information: including name, avatar, email address
      this.settingService.setUser(user);
      // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
      // this.aclService.setFull(true);
      // Menu data, https://ng-alain.com/theme/menu
      if (permissionData.code === 200) {
        this.menuService.add(this.menuData(permissionData.data.normal_permission));
      }
      // Can be set page suffix title, https://ng-alain.com/theme/title
      this.titleService.suffix = app.name;
    },
      () => { },
      () => {
        resolve(null);
      });
  }

  load(): Promise<any> {
    
      // // 授权登录
      // let s: string = window.location.href.split('?')[1];
      // let h: string[] = s ? s.split('&') : null;
      // // console.log('h', h);
      // let arr: string = h ? h.filter((item: string) => item.indexOf('code') !== -1)[0] : null;
      // // console.log('arr', arr);
      // let code = arr ? arr.split('=')[1] : null;
      // // console.log('code', code);
      // // 授权登录
      // /***** 如果code 存在，则表示是从微信授权登录过来的 *****/
      // // this.httpClient.get('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe6b54b37370b2706&redirect_uri=http%3a%2f%2fkpi.cdtfhr.com%2f%23%2fpassport%2flogin&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect').subscribe((res:any) => {
      // //   alert(res);
      // // })
      // if (code) {
      //   window.localStorage.removeItem('cw_permission');
      //   this.httpClient.post('/api/qywechat_login', { code: code }).subscribe((res: ApiData) => {
      //     if (res.code === 200) {
      //       // 清空路由复用信息
      //       this.reuseTabService.clear();
      //       // 设置用户Token信息
      //       this.tokenService.set({ token: res.data.access_token });
      //       // this.startupService.initMenuBypermission();
      //       // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
      //       // this.injector.get(Router).navigateByUrl('/');
      //       this.viaHttp(resolve, reject);
      //     } else {
      //       this.injector.get(Router).navigateByUrl('/passport/login');
      //     }
      //   });
      //   // resolve(null);
      // } else {
      //   this.viaHttp(resolve, reject);
      // }
    // only works with promises
    return new Promise((resolve, reject) => {
      // http
      this.viaHttp(resolve, reject);
      // this.viaMock(resolve, reject);
    });
  }
}
