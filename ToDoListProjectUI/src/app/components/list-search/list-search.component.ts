import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.css']
})
export class ListSearchComponent implements OnInit  {
  constructor(private auth: AuthService,private fb: FormBuilder,private toastr: ToastrService) {};
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
        this.searchForm.reset();
      }
    )
  }

  showAll(){
    this.auth.GetAllItems()
    .subscribe(res=>{
      this.items = res;
    })
  }

  showAllDone(){
    this.auth.GetAllDoneItems()
    .subscribe(res=>{
      this.items = res;
    })
  }

  doneCurrent(current:any)
  {
      console.log(current)
      this.auth.DoneItem(current)
      .subscribe({
        next:(
          res=>{
            window.location.reload();
          }
        )
      })
  }

  notDoneCurrent(Ncurrent:any)
  {
      console.log(Ncurrent)
      this.auth.NotDoneItem(Ncurrent)
      .subscribe({
        next:(
          res=>{
            window.location.reload();
          }
        )
      })
  }
}
