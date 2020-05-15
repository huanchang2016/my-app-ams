import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from '@core';
import { AlainThemeModule } from '@delon/theme';
import { AlainConfig, ALAIN_CONFIG } from '@delon/util';

// Please refer to: https://ng-alain.com/docs/global-config
// #region NG-ALAIN Config

import { DelonACLModule } from '@delon/acl';

const alainConfig: AlainConfig = {
  st: { modal: { size: 'lg' } },
  pageHeader: {
    // homeI18n: 'home'
    homeI18n: ''
  },
  // lodop: { // 打印功能 lodop 插件 许可证
  //   license: `A59B099A586B3851E0F0D7FDBF37B603`,
  //   licenseA: `C94CEE276DB2187AE6B65D56B3FC2848`,
  // },
  auth: {
    login_url: '/passport/login',
    token_send_place: 'header',
    store_key: 'ams_auth_token',
    token_send_key: 'Authorization',
    token_send_template: 'Bearer ${token}',
    ignores: [ /\/user\/login/, /\/get_verification_code/, /assets\//, /\/auth/, /\/change_password_by_message/, /\/verification\/code\/get/ ]
  },
};

const alainModules = [
  AlainThemeModule.forRoot(),
  DelonACLModule.forRoot()
];
const alainProvides = [{ provide: ALAIN_CONFIG, useValue: alainConfig }];


import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';

const ngZorroConfig: NzConfig = {};

const zorroProvides = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

// #endregion

@NgModule({
  imports: [...alainModules],
})
export class GlobalConfigModule {
  constructor(@Optional() @SkipSelf() parentModule: GlobalConfigModule) {
    throwIfAlreadyLoaded(parentModule, 'GlobalConfigModule');
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlobalConfigModule,
      providers: [...alainProvides, ...zorroProvides],
    };
  }
}
