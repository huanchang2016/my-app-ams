import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-contract-contract-form',
  templateUrl: './contract-form.component.html',
})
export class ContractContractFormComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
