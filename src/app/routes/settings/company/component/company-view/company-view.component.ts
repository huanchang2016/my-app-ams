import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { environment } from '@env/environment';

@Component({
  selector: 'app-company-view',
  templateUrl: './company-view.component.html',
  styleUrls: ['./company-view.component.less']
})
export class CompanyViewComponent implements OnInit {
  environment = environment;
  
  @Input() data:any;

  constructor(
    private modal: NzModalRef
  ) { }

  ngOnInit() {
    console.log(this.data);
  }


  
  destroyModal(): void {
    this.modal.destroy();
  }

}
