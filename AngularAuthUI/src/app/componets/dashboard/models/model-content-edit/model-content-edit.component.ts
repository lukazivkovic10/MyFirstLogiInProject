import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ListService } from 'src/app/services/list.service';
import { TagsService } from 'src/app/services/tags.service';

interface Tag
{
  tagid: number;
  tagName: string;
};

@Component({
  selector: 'app-model-content-edit',
  templateUrl: './model-content-edit.component.html',
  styleUrls: ['./model-content-edit.component.css']
})
export class ModelContentEditComponent {
  updateForm!: FormGroup;
  public errors:any = [];
  public tags: { success: boolean; error: number; message: string; data: Tag[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  @Output() close = new EventEmitter<void>();
  constructor(private list: ListService,private fb: FormBuilder, private router: Router, private tagService: TagsService) 
  { };

  ngOnInit() {
    this.updateForm = this.fb.group({
      Tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: [''],
      CompleteDate: [''],
      Active: ['']
    });
    this.tagService.GetTags().subscribe(
      (res:any)=>{
        this.tags = res;
      }
    )
  }

  modelCloseEdit(){
    this.close.emit();
    this.updateForm.reset();
  }

  onUpdate()
  {
    const tag = this.updateForm.get('Tag')?.value;
    const itemName = this.updateForm.get('ItemName')?.value;
    const itemDesc = this.updateForm.get('ItemDesc')?.value;
    const completeDate = this.updateForm.get('CompleteDate')?.value;
    const active = this.updateForm.get('Active')?.value;
    console.log(this.updateForm.value)
    if (this.updateForm.get('ItemDesc')?.valid)
    {
      const data = {
        Tag: tag,
        ItemName: itemName,
        ItemDesc: itemDesc
      };
      this.list.UpdateItem(data).subscribe
      ({next:(
        res=>{
          this.errors = res;
          this.updateForm.get('ItemDesc')?.reset();
        }
      )
      })
    }else if(this.updateForm.get('CompleteDate')?.valid)
    {
    const data = {
      Tag: tag,
      ItemName: itemName,
      ItemDesc: itemDesc,
      CompleteDate: completeDate
    };
      this.list.UpdateItemDate(data).subscribe
      ({next:(
        res=>{
          this.errors = res;
          this.updateForm.get('CompleteDate')?.reset();
        }
      )
      })
    }else if(this.updateForm.get('Active')?.valid)
    {
      const data = {
        Tag: tag,
        ItemName: itemName,
        ItemDesc: itemDesc,
        Active: active
      };
      this.list.UpdateItemStatus(data).subscribe
      ({next:(
        res=>{
          this.errors = res;
          this.updateForm.get('Active')?.reset();
        }
      )
      })
    };
    this.modelCloseEdit();
  }
}
