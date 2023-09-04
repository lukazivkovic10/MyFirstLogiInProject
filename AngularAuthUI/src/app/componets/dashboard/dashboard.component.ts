import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { ListService } from 'src/app/services/list.service';
import { SearchTagService } from 'src/app/services/search-tag.service';
import { SharedDataService } from 'src/app/services/shared-data-service.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface Item
{
  id: number;
  tag: string;
  itemName: string;
  itemDesc: string;
  itemStatus: number;
  active: number;
  createdDate: Date;
  completeDate: Date;
  dateOfCompletion: Date;
  TimeTakenSeconds: number;
  TimeTaken: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit{

  public items: { success: boolean; error: number; message: string; data: Item[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  public searchData: {search: string} = 
  {
    search: ''
  };

  public error: {success: boolean; error: number; message: string; data: string} =
  {
    success: true,
    error: 404,
    message: '',
    data: ''
  }

  public savedTag: string = "";

  showModalCreate: boolean = false;
  showModalEdit: boolean = false;
  showModalDelete: boolean = false;
  showModalTags: boolean = false;

  public hideNotDone: boolean = false; 
  public hideNotDoneYet: boolean = false; 
  public hideDeleted: boolean = false;
  public hideDone: boolean = false; 

  constructor(private auth: ListService, private sharedData: SharedDataService, private searchService: SearchTagService,private toast: NgToastService) 
  {};

  ngOnInit() {
    this.auth.GetAllItems().subscribe(
      (res: any) => {
        this.items = res;
      }
    );

    this.sharedData.searchResult$.subscribe((res: any) => {
      if (res) {
        this.items = res;
      }
    });

    this.searchService.getSearchData().subscribe(data => {
      this.searchData = data;
  });
  }

  isHovered = false;

  onHover() {
    this.isHovered = true;
  }

  onHoverLeave() {
    this.isHovered = false;
  }


  showAll(){
    this.auth.GetAllItems().subscribe(
      (res: any) => {
        this.items = res;
        this.searchData.search = "";
        this.error = {
          success: true,
          error: 404,
          message: '',
          data: ''}
      }
    );
  }

  onHideDoneCheckboxChange() {
    const doneCheckbox = document.getElementById('done') as HTMLInputElement;
  
    if (doneCheckbox.checked) {
      this.hideDone = true;
    } else {
      this.hideDone = false;
    }
  }

  onHideDeletedCheckboxChange() {
    const doneCheckbox = document.getElementById('deleted') as HTMLInputElement;
  
    if (doneCheckbox.checked) {
      this.hideDeleted = true;
    } else {
      this.hideDeleted = false;
    }
  }

  onHideNotDoneCheckboxChange() {
    const doneCheckbox = document.getElementById('hide') as HTMLInputElement;
  
    if (doneCheckbox.checked) {
      this.hideNotDone = true;
    } else {
      this.hideNotDone = false;
    }
  }

  onHideNotDoneYetCheckboxChange() {
    const doneCheckbox = document.getElementById('notDoneYet') as HTMLInputElement;
  
    if (doneCheckbox.checked) {
      this.hideNotDoneYet = true;
    } else {
      this.hideNotDoneYet = false;
    }
  }

  onDoneCheckboxChange() {
    const doneCheckbox = document.getElementById('done') as HTMLInputElement;
  
    if (doneCheckbox.checked) {
      this.showAllDone();
    } else {
      this.showAll();
    }
  }

  showAllDone(){
    this.auth.GetAllDoneItems().subscribe((res: any)=>{
      if(res.data!=404)
      {
        this.items = res;
        this.error = {
          success: true,
          error: 200,
          message: '',
          data: '200'};
        this.toast.success({detail:"USPEH", summary:res.message, duration: 5000});
      }else
      {
        this.error = res;
        this.toast.error({detail:res.error, summary:res.message, duration: 5000});
      }
    })

    const doneCheckbox = document.getElementById('done') as HTMLInputElement;
  }


  doneCurrent(current:any)
  {
    console.log(current);
      this.auth.DoneItem(current)
      .subscribe({
        next:(
          res=>{
            this.showAll();
          }
        )
      });
  }

  saveTag(current:string)
  {
    this.savedTag = current;
  }

  notDoneCurrent(Ncurrent:any)
  {
      this.auth.NotDoneItem(Ncurrent)
      .subscribe({
        next:(
          res=>{
            this.showAll();
          }
        )
      })
  }

  modelOpenCreate() 
  {
    this.showModalCreate = true;
  }

  modelCloseCreate() 
  {
    this.showAll();
    this.showModalCreate = false;
  }

  modelOpenDelete() 
  {
    this.showModalDelete = true;
  }

  modelCloseDelete() 
  {
    this.showAll();
    this.showModalDelete = false;
  }

  modelOpenEdit() 
  {
    this.showModalEdit = true;
  }

  modelCloseEdit() 
  {
    this.showAll();
    this.showModalEdit = false;
  }

  modelOpenTags() 
  {
    this.showModalTags = true;
  }

  modelCloseTags() 
  {
    this.showModalTags = false;
  }
  }
