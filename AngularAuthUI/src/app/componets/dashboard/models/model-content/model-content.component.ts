import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { ListService } from 'src/app/services/list.service';
import { TagsService } from 'src/app/services/tags.service';

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
  constructor(private list: ListService,private fb: FormBuilder, private router: Router, private toast: NgToastService, private tagService: TagsService){ };

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
    this.tagService.GetTags().subscribe(
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
      this.list.CreateItem(this.createForm.value)
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
