import { Component, OnInit } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { ListService } from 'src/app/services/list.service';
import { SearchTagService } from 'src/app/services/search-tag.service';
import { SharedDataService } from 'src/app/services/shared-data-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SignalRService } from 'src/app/services/signal-r.service';

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
  ItemRepeating: string;
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

  constructor(private auth: ListService, private sharedData: SharedDataService, 
    private searchService: SearchTagService,private toast: NgToastService, 
    private notificationService: NotificationService, private signalRService: SignalRService,)
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
  // Initialize SignalR and subscribe to notifications
  this.signalRService.addNotificationListener((message: string) => {
    // Call the showNotification function when a new notification is received
    this.notificationService.showNotification(
      'Opravila',
      {
        body: message,
        icon: '../assets/check-to-slot-solid.svg' // URL to an icon image
      }
    );
    this.notificationService.notificationClick.subscribe(() => {
      // Open the specified URL when the notification is clicked
      window.open('http://localhost:4200/dashboard', '_blank');
    });
  });
  }

  sendNotification(): void {
    // Example: Send a notification from this component
    setTimeout(() => {
      this.notificationService.showNotification(
        'Opravila',
        {
          body: 'Rok za TestFileD bo potekel čez 24ur.',
          icon: '../assets/check-to-slot-solid.svg' // URL to an icon image
        }
      );
    }, 0); // 5 seconds (5,000 milliseconds)
  
    // Subscribe to the custom notificationClick event
    this.notificationService.notificationClick.subscribe(() => {
      // Open the specified URL when the notification is clicked
      window.open('http://localhost:4200/dashboard', '_blank');
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

hideDoneCards = false;
hideNotDoneCards = false;
hideDeletedCards = false;
hideExpiredCards = false;

// Functions to toggle card visibility
toggleHideDone() {
  this.hideDoneCards = !this.hideDoneCards;
}

toggleHideNotDone() {
  this.hideNotDoneCards = !this.hideNotDoneCards;
}

toggleHideDeleted() {
  this.hideDeletedCards = !this.hideDeletedCards;
}

toggleHideExpired() {
  this.hideExpiredCards = !this.hideExpiredCards;
}

  saveTag(current:string)
  {
    this.savedTag = current;
  }

  //Odpiranje modals

  showModalCreate: boolean = false;
  showModalEdit: boolean = false;
  showModalDelete: boolean = false;
  showModalTags: boolean = false;

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
