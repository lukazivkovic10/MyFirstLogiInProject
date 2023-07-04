import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.css']
})
export class ListSearchComponent implements OnInit  {
  searchForm!: FormGroup;
  constructor(private fb: FormBuilder) {};
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['']
    })
  }

  onSearch(){
    console.log(this.searchForm.value);
  }

}
