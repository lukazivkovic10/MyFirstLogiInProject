import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { ListService } from 'src/app/services/list.service';
import { SearchTagService } from 'src/app/services/search-tag.service';
import { SharedDataService } from 'src/app/services/shared-data-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SignalRService } from 'src/app/services/signal-r.service';
import { GraphService } from 'src/app/services/graph.service';
import { ChangeDetectorRef } from '@angular/core';

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

  public tasks: { success: boolean; error: number; message: string; data: any } = {
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

  ngOnInit() {
    this.getTotalItems();
    this.loadItems();
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

  currentPage = 1;
  pageSize = 10;
  public totalItems: number = 0;
  totalPages:number = 1;
  isLoading = false;

  public savedTag: string = "";

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private auth: ListService, private sharedData: SharedDataService, 
    private searchService: SearchTagService,private toast: NgToastService, 
    private notificationService: NotificationService, private signalRService: SignalRService,
    private gServ: GraphService, private cdr: ChangeDetectorRef)
  {
  };

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

  getTotalItems(): void {
    this.gServ.NumberOfAllTasks().subscribe((res: any) => {
      console.log(res); // Log response for debugging
      this.tasks = res;
      this.totalItems = this.tasks.data.Vse;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      console.log(this.totalItems); // Log totalItems for debugging
    });
  }


  loadItems(): void {
    this.isLoading = true;
    this.auth.GetAllItems(this.currentPage, this.pageSize).subscribe(
      (res: any) => {
        if (res) {
          // Check if data is an array
          this.items = res;
        }
        this.isLoading = false;
        this.searchData.search = '';
        this.cdr.detectChanges();
      },
      (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    );
  }

  onPageChange(event: any): void {
    this.currentPage = event;
    this.loadItems(); // Call loadItems() with the new page number
  }

  showAll()
  {
    this.auth.GetAllItems(this.currentPage, this.pageSize).subscribe(
      (res:any)=>{
        if(res){
          this.items = res;
        }
      }
    )
  }

  onScroll(): void {
    const container = this.scrollContainer.nativeElement;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      this.currentPage++;
      this.loadItems();
    }
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
