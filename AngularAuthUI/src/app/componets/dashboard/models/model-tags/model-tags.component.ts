import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TagsService } from 'src/app/services/tags.service';

interface Tag
{
  tagid: number;
  tagName: string;
};

@Component({
  selector: 'app-model-tags',
  templateUrl: './model-tags.component.html',
  styleUrls: ['./model-tags.component.css']
})

export class ModelTagsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  tagCreateForm!: FormGroup;

  public tags: { success: boolean; error: number; message: string; data: Tag[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(private auth: TagsService,private fb: FormBuilder, private router: Router){}
  ngOnInit(): void {
    this.auth.GetTags().subscribe(
      (res:any)=>{
        this.tags = res;
      }
    );
    this.tagCreateForm = this.fb.group({
      tagName: ['',Validators.required]
    });
  }
  modelCloseTags(){
    this.close.emit();
  }

  getTags()
  {
    this.auth.GetTags().subscribe(
      (res:any)=>{
        this.tags = res;
      }
    );
  }

  onCreate()
  {
    this.auth.CreateTags(this.tagCreateForm.value).subscribe(
      {
        next:(
          (res:any) => 
          {
            this.tagCreateForm.reset();
            this.getTags();
          }
          )
      }
    )
  }

  onDelete(current:any)
  {
    console.log(current);
    this.auth.DeleteTag(current)
      .subscribe({
        next:(
          res=>{
            this.getTags();
          }
        )
      });
  }
}
