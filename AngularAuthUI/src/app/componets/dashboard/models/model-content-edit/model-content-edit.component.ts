import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { JwtDecodeService } from 'src/app/services/jwt-decode.service';
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
  @Input() item_tag: string = '';
  @Input() item_itemName: string = '';
  @Input() item_desc: string = '';
  @Input() item_date!: Date;

  updateForm!: FormGroup;
  public errors:any = [];
  public tags: { success: boolean; error: number; message: string; data: Tag[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  @Output() close = new EventEmitter<void>();
  @Output() refreshData: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private jwtDecode: JwtDecodeService,
    private list: ListService,
    private fb: FormBuilder,
    private router: Router,
    private tagService: TagsService,
    private toast: NgToastService)
  { };

  ngOnInit() {
    this.updateForm = this.fb.group({
      Tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: [''],
      CompleteDate: [''],
      Active: [''],
      LastEditBy: [this.userGet()]
    });
  }

  modelCloseEdit(){
    this.close.emit();
    this.updateForm.reset();
    this.refreshData.emit();
  }

  userGet() : string
  {
    return this.jwtDecode.userEmail();
  }

  onUpdate()
  {
    if(this.updateForm.valid)
    {
      this.list.UpdateItem(this.updateForm.value).subscribe({
        next:res=>{
          this.updateForm.reset();
          this.modelCloseEdit;
          this.toast.success({ detail: "Uspešno posodboljeno opravilo." , duration: 2500 });
        }
      });
    }
    this.modelCloseEdit();
  }
}
