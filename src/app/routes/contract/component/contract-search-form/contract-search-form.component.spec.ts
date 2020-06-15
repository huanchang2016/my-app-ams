import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractContractSearchFormComponent } from './contract-search-form.component';

describe('ContractContractSearchFormComponent', () => {
  let component: ContractContractSearchFormComponent;
  let fixture: ComponentFixture<ContractContractSearchFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractContractSearchFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractContractSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
