import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.css']
})
export class ModelContentComponent {
  createForm!: FormGroup;
  public errors:any = [];
  @Output() close = new EventEmitter<void>();
  constructor(private auth: AuthService,private fb: FormBuilder, private router: Router, private toaster: NgToastService){ };
  ngOnInit() {
    this.createForm = this.fb.group({
      Tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: ['',Validators.required],
      ItemStatus: ['1'],
      Active: ['',Validators.required]
    })
  }

  modelCloseCreate() 
  {
    this.close.emit();
  }

  onCreate()
  {
    console.log(this.createForm.value);
    if(this.createForm.valid)
    {
      this.auth.CreateItem(this.createForm.value)
      .subscribe({
        next:(
          res=>{
            this.errors = res;
            this.createForm.reset();
            window.location.reload();
          }
        )
      })
    }
  }
}
