import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth.service';
import { ModelContentComponent } from '../models/model-content/model-content.component';
import { SharedDataService } from 'src/app/services/shared-data-service.service';
import { SearchTagService } from 'src/app/services/search-tag.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchTagString!: string;
  public items:any = [];

  @Output() searchTagEvent = new EventEmitter<string>();
  constructor(private auth: AuthService,private fb: FormBuilder,private toast: NgToastService,  private sharedDataService: SharedDataService, private searchService: SearchTagService) {};
  searchForm!: FormGroup;
  
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: ['',Validators.required]
    })
  }

  onSearch(){
    this.auth.SearchItem(this.searchForm.value)
    .subscribe(
      (res: any)=>{
        console.log(res);
        if(res.data!=404)
        {
          this.items = res;
          this.sharedDataService.updateSearchResult(res);
          this.searchService.setSearchData(this.searchForm.value);
          this.searchForm.reset();
        }else
        {
          this.toast.error({detail:res.error, summary:res.message, duration: 5000});
        }
      }
    )
  }

  searchTag()
  {
    this.searchTagString = this.searchForm.value;
    this.searchTagEvent.emit(this.searchTagString);
  }
}
