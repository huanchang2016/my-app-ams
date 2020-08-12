import { ApiData, List } from 'src/app/data/interface.data';
import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { CommonFunctionService } from 'src/app/routes/service/common-function.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzMessageService, NzDrawerService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-my-adjust-search',
  templateUrl: './my-adjust-search.component.html',
  styles: [
  ]
})
export class MyAdjustSearchComponent implements OnInit {

  @Output() private outer = new EventEmitter();

  @Input() type_id: number;

  @Input() type_name: number;

  // @Output() searchOptionsEmit: EventEmitter<any> = new EventEmitter();
  constructor(
    // private commonFn: CommonFunctionService,
    private fb: FormBuilder,
    private settingsConfigService: SettingsConfigService,
    private msg: NzMessageService,
    private router: Router
  ) { }
  validateForm: FormGroup;


  listOfData: any = [];

  loading = false;

  total = 0;

  pageOption: any = {
    page: 1,
    page_size: 10
  };

  list: any[] = [];

  swithFlag = true;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      status_name: ['草稿'], // 状态名称
      project_name: [null],  // 项目名称
      project_number: [null],  // 项目编号
      page: [null], // 页
      page_size: [null] // 页码
    });
    this.submit();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes, this.type_id, 'this.type_id', this.type_name, 'this.type_name');
    if (this.validateForm) {
      this.validateForm.patchValue({
        status_name: this.type_name
      });
      this.submit();
      console.log('this.validateForm.value', this.validateForm.value);
      console.log(this.validateForm.get('status_name').value, 'status_name value');
      if (this.validateForm.get('status_name').value === '草稿') {
        this.swithFlag = true;
        console.log(this.swithFlag, 'this.swithFlag1');
      } else {
        this.swithFlag = false;
        console.log(this.swithFlag, 'this.swithFlag2');
      }
    }
  }

  edit(data: any): void {
    this.router.navigateByUrl(`/adjust/update/${data.project.id}`);
  }

  view(data: any) {
    // this.router.navigateByUrl(`/approve/no-contract/pay/view/${data.project.id}?treaty_pay_id=${data.id}`);
    this.router.navigateByUrl(`/adjust/view/${data.project.id}`);
  }

  deletedProject(id: number): void {
    this.settingsConfigService
      .post('/api/project/disable', { project_ids: id })
      .subscribe((res: ApiData) => {
        if (res.code === 200) {
          this.msg.success('项目已删除');
          // this.list = this.list.filter(v => v.id !== id);
          // this.searchOptionsChange();
          this.submit();
        } else {
          this.msg.error(res.error || '删除失败，请重试');
        }
      })
  }

  cancel(): void { }

  submit() {
    const option: any = this.validateForm.value;
    console.log(option, 'option');
    this.listRequest(option);
  }

  pageIndexChange($event: number) {
    this.pageOption.page = $event;
    this.submit();
  }

  pageSizeChange($event: number) {
    this.pageOption.page_size = $event;
    this.submit();
  }

  listRequest(option) {
    console.log('listRequest option', option);
    this.settingsConfigService.post('/api/adjustment/my', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('项目调整 我的调整');
        this.listOfData = res.data.adjustment;
        console.log('listRequest listOfData', this.listOfData);
        return;
      }
      return;
    });
  }

  resetForm(): void {
    console.log('........reset start')
    this.outer.emit();
    this.validateForm.patchValue({
      status_name: '草稿', // 状态名称
      project_name: null,  // 项目名称
      project_number: null,  // 项目编号
      page: null, // 页
      page_size: null // 页码
    });
    this.submit();
    console.log('........reset end')
  }
}
