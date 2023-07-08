import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.css']
})
export class ListSearchComponent implements OnInit  {
  constructor(private auth: AuthService,private fb: FormBuilder) {};
  searchForm!: FormGroup;
  public items:any = [];

  ngOnInit() 
  {
    this.searchForm = this.fb.group({
      search: ['']
    }),
    this.auth.GetAllItems()
    .subscribe(res=>{
      this.items = res;
    })
  }

  onSearch(){
    this.auth.SearchItem(this.searchForm.value)
    .subscribe(
      res=>{
        this.items = res;
      }
    )
  }

  showAll(){
    this.auth.GetAllItems()
    .subscribe(res=>{
      this.items = res;
    })
  }
}
