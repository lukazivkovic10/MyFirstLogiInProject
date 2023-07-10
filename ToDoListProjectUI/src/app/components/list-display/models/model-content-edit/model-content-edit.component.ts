import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-model-content-edit',
  templateUrl: './model-content-edit.component.html',
  styleUrls: ['./model-content-edit.component.css']
})
export class ModelContentEditComponent {
  updateForm!: FormGroup;
  public errors:any = [];
  constructor(private auth: AuthService,private fb: FormBuilder, private router: Router) 
  { };
  ngOnInit() {
    this.updateForm = this.fb.group({
      tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: ['']
    })
  }

  onUpdate()
  {
    if(this.updateForm.valid)
    {
      this.auth.UpdateItem(this.updateForm.value)
      .subscribe({
        next:(
          res=>{
            this.errors = res;
            this.updateForm.reset();
          }
        )
      })
    }
  }
}
