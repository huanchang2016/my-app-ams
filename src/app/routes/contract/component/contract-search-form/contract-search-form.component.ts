import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-contract-contract-search-form',
  templateUrl: './contract-search-form.component.html',
})
export class ContractContractSearchFormComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
