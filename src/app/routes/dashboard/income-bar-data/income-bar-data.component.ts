import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SettingsConfigService } from '../../service/settings-config.service';
import * as echarts from 'echarts';
import { ApiData } from 'src/app/data/interface.data';
import { format, startOfMonth } from 'date-fns';

@Component({
  selector: 'app-income-bar-data',
  templateUrl: './income-bar-data.component.html',
  styles: [
  ]
})
export class IncomeBarDataComponent implements OnInit {

  // idName:string = 'charts-bar';
  mychart: any;
  chartBarValueList: any[] = [];

  loadingData: boolean = true;

  permissions: string[] = [];

  validateForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    public settingsConfigService: SettingsConfigService
  ) { }

  requestUrl: string;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      year: [null]
    });

    this.validateForm.valueChanges.subscribe(_ => this.submitForm());

    const _permission = JSON.parse(window.localStorage.getItem('cw_permission'));
    if (_permission) {
      this.permissions = _permission;
    }

    if (this.settingsConfigService.isPermissionsIncludes('data_management_list', this.permissions)) {
      // 部门负责人
      this.requestUrl = '/api/department_head_year_income';

    }
    if (this.settingsConfigService.isPermissionsIncludes('data_department_management_list', this.permissions)) {
      // 管理员
      this.requestUrl = '/api/year_management_income';
    }

    this.getDataV();
  }

  submitForm(): void {
    // this.getDataV();
    this.getDataV();
  }

  getDataV(): void {
    
    if(!this.requestUrl) {
      return;
    }
    this.loadingData = true;
    const value:any = this.validateForm.value;
    const year:Date = value.year ? value.year: new Date();
    const opt:any = {
      year:  format(year, 'yyyy')
    };
    this.settingsConfigService.post(this.requestUrl, opt).subscribe((res:ApiData) => {
      this.loadingData = false;
      if(res.code === 200) {
        this.chartBarValueList = res.data.months;
        // this.mychart = echarts.init(document.querySelector(`#cost_category_data`)); // 获取到数据才会渲染html
        // this.createEchart();
        this.setDepartmentMembersCharts();
      }

    })

  }

  // 重置图表 柱状图
  setDepartmentMembersCharts() {
    if (this.mychart) { // 清除画布
      this.mychart.clear();
    }
    setTimeout(() => {
      this.showChartsBarElement();
    }, 0);
    

  }
  // 初始化图表
  showChartsBarElement() {
    this.mychart = echarts.init(document.querySelector(`#income_category_data`));
    const xData:string[] = Object.keys(this.chartBarValueList);
    const yData:number[] = Object.values(this.chartBarValueList);
    

    const labelOption = {
      show: true,
      // position: app.config.position,
      // distance: app.config.distance,
      // align: app.config.align,
      // verticalAlign: app.config.verticalAlign,
      // rotate: app.config.rotate,
      // formatter: '{c}  {name|{a}}',
      fontSize: 16,
      rich: {
        name: {
          textBorderColor: '#fff'
        }
      }
    };

    const option: any = {
      color: ['#003366'], // , '#006699', '#4cabce', '#e5323e'
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['收入统计']
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: true },
          magicType: { show: true, type: ['line', 'bar'] }, // , 'stack', 'tiled'
          // restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: 'category',
          name: '月份',
          axisTick: { show: false },
          // 显示类型 横坐标
          data: xData // ['2012', '2013', '2014', '2015', '2016']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '收入（元）'
        }
      ],
      series: [
        {
          name: '收入',
          type: 'bar',
          barGap: 0,
          label: labelOption,

          data: yData, // [320, 332, 301, 334, 390]
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'top',
                textStyle: {
                  color: '#615a5a',
                  fontSize: 14
                }
                // formatter: () => (Math.random() * 2).toFixed(2)
              }
            }
          },
        }
      ]
    };
    this.mychart.setOption(option);
  }
}
