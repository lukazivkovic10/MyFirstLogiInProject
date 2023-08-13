import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

interface Tag
{
  tagid: number;
  tagName: string;
};

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.css']
})
export class ModelContentComponent {
  createForm!: FormGroup;
  public errors:any = [];
  public tags: { success: boolean; error: number; message: string; data: Tag[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };
  @Output() close = new EventEmitter<void>();
  constructor(private auth: AuthService,private fb: FormBuilder, private router: Router, private toast: NgToastService){ };

  public ds: Date = new Date();
  ngOnInit() {
    this.createForm = this.fb.group({
      Tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: [''],
      ItemStatus: ['1'],
      Active: ['',Validators.required],
      CreatedDate: [this.ds],
      CompleteDate: ['',Validators.required]
    });
    this.auth.GetTags().subscribe(
      (res:any)=>{
        this.tags = res;
      }
    )
  }

  modelCloseCreate() 
  {
    this.close.emit();
    this.createForm.reset();
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
          }
        )
      })
    }
  }
}
