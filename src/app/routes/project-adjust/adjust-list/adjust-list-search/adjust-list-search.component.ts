import { ApiData } from 'src/app/data/interface.data';
import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { SettingsConfigService } from 'src/app/routes/service/settings-config.service';

@Component({
  selector: 'app-adjust-list-search',
  templateUrl: './adjust-list-search.component.html',
  styles: [
  ]
})
export class AdjustListSearchComponent implements OnInit {

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
      status_name: ['进行中'], // 状态名称
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
      if (this.validateForm.get('status_name').value === '进行中') {
        this.swithFlag = true;
        console.log(this.swithFlag, 'this.swithFlag1');
      } else {
        this.swithFlag = false;
        console.log(this.swithFlag, 'this.swithFlag2');
      }
    }
  }

  add(): void {
    this.router.navigateByUrl('/project/create');
  }

  edit(data: any): void {
    this.router.navigateByUrl(`/project/edit/${data.id}`);
  }

  view(data: any) {
    // this.router.navigateByUrl(`/approve/no-contract/pay/view/${data.project.id}?treaty_pay_id=${data.id}`);
    this.router.navigateByUrl(`/project/view/${data.id}`);
  }

  submitProject(id: number): void {
    this.settingsConfigService
      .post('/api/project/submit', { project_id: id })
      .subscribe((res: ApiData) => {
        if (res.code === 200) {
          this.msg.success('项目已提交');
          // this.list = this.list.filter(v => v.id !== id);
          // this.searchOptionsChange();
          this.submit();
        } else {
          this.msg.error(res.error || '提交失败，请重试');
        }
      })
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
    this.settingsConfigService.post('/api/adjustment/management', option).subscribe((res: ApiData) => {
      console.log('listRequest res', res.data);
      if (res.code === 200) {
        console.log('项目调整 调整列表');
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
      status_name: '进行中', // 状态名称
      project_name: null,  // 项目名称
      project_number: null,  // 项目编号
      page: null, // 页
      page_size: null // 页码
    });
    this.submit();
    console.log('........reset end')
  }

}
