import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth.service';
import { ModelContentComponent } from '../models/model-content/model-content.component';
import { SharedDataService } from 'src/app/services/shared-data-service.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  showModalCreate: boolean = false;
  showModalEdit: boolean = false;
  showModalDelete: boolean = false;
  public items:any = [];
  constructor(private auth: AuthService,private fb: FormBuilder,private toast: NgToastService,  private sharedDataService: SharedDataService) {};
  searchForm!: FormGroup;
  
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['']
    })
  }

  onSearch(){
    this.auth.SearchItem(this.searchForm.value)
    .subscribe(
      (res: any)=>{
        this.items = res;
        this.searchForm.reset();
        this.sharedDataService.updateSearchResult(res);
      }
    )
  }

  modelOpenCreate() 
  {
    this.showModalCreate = true;
  }

  modelCloseCreate() 
  {
    this.showModalCreate = false;
  }

  modelOpenDelete() 
  {
    this.showModalDelete = true;
  }

  modelCloseDelete() 
  {
    this.showModalDelete = false;
  }

  modelOpenEdit() 
  {
    this.showModalEdit = true;
  }

  modelCloseEdit() 
  {
    this.showModalEdit = false;
  }
}
