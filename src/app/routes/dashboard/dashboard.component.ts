import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  validateForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [null]
    });

    this.validateForm.get('remember').valueChanges.subscribe((res:any) => {
      if(res) {
        this.validateForm.get('userName').setValue(3423423);
        this.validateForm.get('userName').enable();
      }else {
        this.validateForm.get('userName').setValue(0);
        this.validateForm.get('userName').disable();
      }
        
    })
  }

  
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

  }

}
