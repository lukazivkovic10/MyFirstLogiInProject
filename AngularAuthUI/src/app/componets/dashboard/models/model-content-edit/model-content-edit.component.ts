import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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
  constructor(private auth: AuthService,private fb: FormBuilder, private router: Router) 
  { };

  ngOnInit() {
    this.updateForm = this.fb.group({
      Tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: ['',Validators.required],
      CompleteDate: ['',Validators.required],
      Active: ['',Validators.required]
    });
    this.auth.GetTags().subscribe(
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
      this.auth.UpdateItem(data).subscribe
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
      this.auth.UpdateItemDate(data).subscribe
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
      this.auth.UpdateItemStatus(data).subscribe
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
