import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.css']
})
export class ModelContentComponent implements OnInit{
  createForm!: FormGroup;
  public errors:any = [];
  constructor(private auth: AuthService,private fb: FormBuilder, private router: Router,private toastr: ToastrService)
  { };
  ngOnInit() {
    this.createForm = this.fb.group({
      tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: ['',Validators.required]
    })
  }
  onCreate()
  {
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
