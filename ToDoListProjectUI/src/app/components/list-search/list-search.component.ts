import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.css']
})
export class ListSearchComponent implements OnInit  {
  constructor(private auth: AuthService) {};

  public items:any = [];

  ngOnInit() 
  {
    this.auth.GetAllItems()
    .subscribe(res=>{
      this.items = res;
    })
  }
}
