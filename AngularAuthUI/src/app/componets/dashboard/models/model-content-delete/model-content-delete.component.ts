import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-model-content-delete',
  templateUrl: './model-content-delete.component.html',
  styleUrls: ['./model-content-delete.component.css']
})
export class ModelContentDeleteComponent {
  deleteForm!: FormGroup;
  public errors:any = [];
  @Output() close = new EventEmitter<void>();
  constructor(private auth: AuthService,private fb: FormBuilder) 
  { };
  ngOnInit() {
    this.deleteForm = this.fb.group({
      tag: ['',Validators.required],
      ItemName: ['']
    })
  }

  modelCloseDelete() 
  {
    this.close.emit();
  }

  onDelete()
  {
    if(this.deleteForm.valid)
    {
      this.auth.DeleteItem(this.deleteForm.value)
      .subscribe({
        next:(
          res=>{
            this.errors = res;
            this.deleteForm.reset();
            window.location.reload();
          }
        )
      })
    }
  }
}
