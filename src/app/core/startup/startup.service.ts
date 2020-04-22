import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN, preloaderFinished } from '@delon/theme';
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
  menuArray:any[] = [
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
              link: '/project/my',
              children: [
                {
                  text: '草稿',
                  link: '/project/my/draft'
                },
                {
                  text: '已提交 待审核',
                  link: '/project/my/progress'
                },
                {
                  text: '提交未通过',
                  link: '/project/my/refuse'
                },
                {
                  text: '提交已通过',
                  link: '/project/my/finished'
                }
              ]
            },
            {
              text: '项目审批',
              link: '/project/approve',
              children: [
                {
                  text: '我的审批',
                  link: '/project/approve'
                },
                {
                  text: '待审批',
                  link: '/project/forApproved'
                },
                {
                  text: '已审批',
                  link: '/project/approved'
                }
              ]
            },
          ]
        },
        {
          text: '支付审批管理',
          link: '/approve',
          icon: { type: 'icon', value: 'audit' },
          children: [
            {
              text: '合同支付申请',
              link: '/approve/contract/apply',
              children: [
                {
                  text: '项目列表',
                  link: '/approve/contract/apply/draft'
                },
                {
                  text: '审批中',
                  link: '/approve/contract/apply/in_progress'
                },
                {
                  text: '已通过',
                  link: '/approve/contract/apply/pass'
                },
                {
                  text: '未通过',
                  link: '/approve/contract/apply/refuse'
                }
              ]
            },
            {
              text: '合同支付审批',
              link: '/approve/contract/pay',
              children: [
                {
                  text: '我的审批',
                  link: '/approve/contract/pay/progress'
                },
                {
                  text: '待审批',
                  link: '/approve/contract/pay/forApproval'
                },
                {
                  text: '审批完成',
                  link: '/approve/contract/pay/finished'
                },
                {
                  text: '未审批未通过',
                  link: '/approve/contract/pay/without-pass'
                }
              ]
            },
            {
              text: '非合约支付申请',
              link: '/approve/no-contract/apply',
              children: [
                {
                  text: '项目列表',
                  link: '/approve/no-contract/apply/draft'
                },
                {
                  text: '审批中',
                  link: '/approve/no-contract/apply/in_progress'
                },
                {
                  text: '已通过',
                  link: '/approve/no-contract/apply/pass'
                },
                {
                  text: '未通过',
                  link: '/approve/no-contract/apply/refuse'
                }
              ]
            },
            {
              text: '非合约支付审批',
              link: '/approve/no-contract/pay',
              children: [
                {
                  text: '我的审批',
                  link: '/approve/no-contract/pay/progress'
                },
                {
                  text: '待审批',
                  link: '/approve/no-contract/pay/forApproval'
                },
                {
                  text: '审批完成',
                  link: '/approve/no-contract/pay/finished'
                },
                {
                  text: '未审批未通过',
                  link: '/approve/no-contract/pay/without-pass'
                }
              ]
            },
            
          ]
        },
        {
          text: '账务管理',
          link: '/bill',
          icon: { type: 'icon', value: 'transaction' },
          children: [
            {
              text: '开票申请',
              link: '/bill/apply',
              children: [
                {
                  text: '开票项目',
                  link: '/bill/apply/projects'
                },
                {
                  text: '进行中',
                  link: '/bill/apply/in_progress'
                },
                {
                  text: '已通过',
                  link: '/bill/apply/pass'
                },
                {
                  text: '已拒绝',
                  link: '/bill/apply/refused'
                }
              ]
            },
            {
              text: '开票审批',
              link: '/bill/approve',
              children: [
                {
                  text: '我审批的',
                  link: '/bill/approve/my'
                },
                {
                  text: '待审批（我的）',
                  link: '/bill/approve/forApprove'
                },
                {
                  text: '已审批',
                  link: '/bill/approve/finished'
                },
                {
                  text: '未审批未通过',
                  link: '/bill/approve/without'
                }
              ]
            }
          ]
        },
        {
          text: '项目配置管理',
          link: '/pro-settings',
          icon: { type: 'icon', value: 'control' },
          children: [
            {
              text: '成本类型配置',
              link: '/pro-settings/cost'
            },
            {
              text: '税目配置（收入）',
              link: '/pro-settings/income'
            },
            {
              text: '服务商类型',
              link: '/pro-settings/service-category'
            }
          ]
        },
        {
          text: '项目流程管理',
          link: '/workflow',
          icon: { type: 'icon', value: 'sort-ascending' },
          children: [
            {
              text: '流程列表',
              link: '/workflow/list'
            },
            {
              text: '流程限额配置',
              link: '/workflow/quota-settings'
            }
          ]
        },
        {
          text: '基础配置',
          link: '/company',
          icon: { type: 'icon', value: 'setting' },
          children: [
            {
              text: '单位管理',
              children: [
                {
                  text: '用户单位',
                  link: '/company/list'
                },
                {
                  text: '客户单位',
                  link: '/company/customer'
                },
                {
                  text: '供应商',
                  link: '/company/supplier'
                }
              ]
            },
            {
              text: '部门配置',
              link: '/department',
              children: [
                {
                  text: '部门管理',
                  link: '/department/list'
                },
                {
                  text: '类型管理',
                  link: '/department/category'
                },
                {
                  text: '项目类型',
                  link: '/department/project-category'
                }
              ]
            },
            {
              text: '职位管理',
              link: '/position/list'
            }
          ]
        },
        {
          text: '权限管理',
          icon: { type: 'icon', value: 'key' },
          children: [
            {
              text: '角色管理',
              link: '/authority/roles'
            },
            {
              text: '权限设置',
              link: '/authority/home'
            }
          ]
        },
        {
          text: '用户管理',
          icon: { type: 'icon', value: 'usergroup-add' },
          children: [
            {
              text: '用户列表',
              link: '/users/list'
            }
          ]
        }
      ]
    }
  ];
  private viaHttp(resolve: any, reject: any) {
    zip(
      this.httpClient.get('/api/user/info/my')
    ).pipe(
      catchError(([appData]) => {
          resolve(null);
          return [appData];
      })
    ).subscribe(([appData]) => {
      // console.log(appData);
      const app: any = {
        name: `财务共享服务中心`,
        description: `全力推进公司业务快速发展，优化流程管理，提高信息化应用效率，提升公司核心竞争力，加大财务管理软件建设与应用力度，天府人资公司菁英软件青年突击队积极对接研发需求，以推动公司信息化水平迈上新台阶，进一步实现办公高效化、规范化、标准化和科学化`
      };
      // const user: any = {
      //   name: '天府人资财务部',
      //   avatar: './assets/imgs/logo-color.png',
      //   email: 'cdtfhr@admin.com',
      //   companyname: '成都天府新区人力资源开发服务有限公司'
      // };
      const user:any = appData.data;
      // Application information: including site name, description, year
      this.settingService.setApp(app);
      // User information: including name, avatar, email address
      this.settingService.setUser(user);
      // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
      this.aclService.setFull(true);
      // Menu data, https://ng-alain.com/theme/menu
      this.menuService.add(this.menuArray);
      // Can be set page suffix title, https://ng-alain.com/theme/title
      this.titleService.suffix = app.name;
    },
    () => { },
    () => {
      resolve(null);
    });
  }

  // 获取单位类型
  getCompanyNatureList() {
    this.httpClient.get('/api/company_nature/all').subscribe((res:ApiData) => {
      console.log(res, 'nature');
      if(res.code === 200) {
        
      }
    })
  }
  
  private viaMock(resolve: any, reject: any) {
    // mock
    
    const app: any = {
      name: `财务共享服务中心`,
      description: `全力推进公司业务快速发展，优化流程管理，提高信息化应用效率，提升公司核心竞争力，加大财务管理软件建设与应用力度，天府人资公司菁英软件青年突击队积极对接研发需求，以推动公司信息化水平迈上新台阶，进一步实现办公高效化、规范化、标准化和科学化`
    };
    const user: any = {
      name: '天府人资财务部',
      avatar: './assets/imgs/logo-color.png',
      email: 'cdtfhr@admin.com',
      companyname: '成都天府新区人力资源开发服务有限公司'
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add(this.menuArray);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = app.name;

    resolve({});
  }

  load(): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve, reject) => {
      // http
      this.viaHttp(resolve, reject);
      // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行
      // this.viaMock(resolve, reject);

    });
  }
}
