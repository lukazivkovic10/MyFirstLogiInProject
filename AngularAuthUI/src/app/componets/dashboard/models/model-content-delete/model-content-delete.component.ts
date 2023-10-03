import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { ListService } from 'src/app/services/list.service';
import { TagsService } from 'src/app/services/tags.service';

interface Tag
{
  tagid: number;
  tagName: string;
};

@Component({
  selector: 'app-model-content-delete',
  templateUrl: './model-content-delete.component.html',
  styleUrls: ['./model-content-delete.component.css']
})
export class ModelContentDeleteComponent {
  deleteForm!: FormGroup;
  public errors:any = [];
  public tags: { success: boolean; error: number; message: string; data: Tag[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };
  @Output() close = new EventEmitter<void>();

  constructor(private list: ListService,private fb: FormBuilder, private tagService: TagsService, private toast: NgToastService) 
  { };

  ngOnInit() {
    this.deleteForm = this.fb.group({
      tag: ['',Validators.required],
      ItemName: ['']
    });
    this.tagService.GetTags().subscribe(
      (res:any)=>{
        this.tags = res;
      }
    )
  }

  modelCloseDelete() 
  {
    this.close.emit();
    this.deleteForm.reset();
  }

  onDelete()
  {
    if(this.deleteForm.valid)
    {
      this.list.DeleteItem(this.deleteForm.value)
      .subscribe({
        next:(
          res=>{
            this.errors = res;
            this.deleteForm.reset();
            this.modelCloseDelete;
            this.toast.success({ detail: "Uspešno izbrisano opravilo.", duration: 2500 });
          }
        )
      })
    }else
    {
      this.toast.warning({ detail: "OPOZORILO", summary: "Manjkajo zahtevana polja.", duration: 2500 });
    }
  }
}
