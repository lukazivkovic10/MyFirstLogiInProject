import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ListService } from 'src/app/services/list.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssignUserService } from 'src/app/services/assign-user.service';
import { NotificationService } from 'src/app/services/notification.service';
import { NgToastService } from 'ng-angular-popup';
import { NavigationExtras, Router } from '@angular/router';
import { JwtDecodeService } from 'src/app/services/jwt-decode.service';
import { ViewsService } from 'src/app/services/CardServices/views.service';

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
  timeTakenSeconds: number;
  TimeTaken: string;
  ItemRepeating: string;
  createdBy: string;
  lastEditBy: string;
  completedBy: string;
  viewCount: number;
}

interface User
{
  firstName: string;
  lastName: string;
  email: string;
}

interface UserAsign
{
  tag:string;
  itemName:string;
  userMail:string;
}

interface File
{
  id: number;
  tag: string;
  itemName: string;
  fileSize: number;
  filePath: string;
  fileName: string;
}

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.css']
})

export class TodoCardComponent {
@Input() item_ItemName: string = '';
@Input() item_Tag: string = '';
@Input() item_ItemDesc: string = '';
@Input() item_ItemStatus: number = 1;
@Input() item_Active: number = 1;
@Input() item_completeDate: Date = new Date();
@Input() item_dateOfCompletion: Date = new Date();
@Input() item!: Item;
private loggedInUserEmail: string = this.jwtService.userEmail();;

isCardHidden(cardStatus: string): boolean {
  // Define the class names you want to hide
  const classNamesToHide = ['done', 'notdone', 'deleted', 'expired'];

  // Check if the card's status is in the list of class names to hide
  return classNamesToHide.includes(cardStatus);
}

getCardStatus(item_ItemStatus: number, item_Active: number)
{
  if (item_ItemStatus === 0) {
    return 'deleted';
  } else if (item_ItemStatus === 1 && item_Active === 1) {
    return 'notdone';
  } else if (item_ItemStatus === 2 && item_Active !== 0) {
    return 'expired';
  } else if (item_ItemStatus === 2 && item_Active === 0) {
    return 'done';
  }else if (item_ItemStatus === 1 && item_Active === 0) {
    return 'done';
  }
  else{
    return '';
  }
}

textColor(item_ItemStatus: number, item_Active: number)
{
  if (item_ItemStatus === 0) {
    return 'deleted_text';
  } else if (item_ItemStatus === 1 && item_Active === 1) {
    return 'notdone_text';
  } else if (item_ItemStatus === 2 && item_Active !== 0) {
    return 'expired_text';
  } else if (item_ItemStatus === 2 && item_Active === 0) {
    return 'done_text';
  } else if ( item_ItemStatus === 1 && item_Active === 0) {
    return 'done_text';
  }
  else{
    return '';
  }
}

getTimerIcon(item_ItemStatus: number, item_Active: number)
{
  if (item_ItemStatus === 0) {
    return 'fa-solid fa-trash';
  } else if (item_ItemStatus === 1 && item_Active === 1) {
    return 'fa-solid fa-hourglass-half';
  } else if (item_ItemStatus === 2 && item_Active !== 0) {
    return 'fa-solid fa-hourglass';
  } else if (item_ItemStatus === 2 && item_Active === 0) {
    return 'fa-solid fa-hourglass-end';
  } else if (item_ItemStatus === 1 && item_Active === 0) {
    return 'fa-solid fa-hourglass-end';
  }
  else{
    return '';
  }
}

tagColor(item_ItemStatus: number, item_Active: number)
{
  if (item_ItemStatus === 0) {
    return 'tag is-rounded is-dark is-medium';
  } else if (item_ItemStatus === 1 && item_Active === 1) {
    return 'tag is-rounded has-background-link-dark is-medium has-text-white-bis';
  } else if (item_ItemStatus === 2 && item_Active !== 0) {
    return 'tag is-rounded is-whites is-medium has-background-danger-dark has-text-white-bis';
  } else if (item_ItemStatus === 2 && item_Active === 0) {
    return 'tag is-rounded is-whites is-medium has-background-success-dark has-text-white-bis';
  }else if (item_ItemStatus===1 && item_Active===0) {
    return 'tag is-rounded is-whites is-medium has-background-success-dark has-text-white-bis';
  }
  else{
    return '';
  }
}

//Hide Cards
@Input() hideDoneCards!: boolean;
@Input() hideNotDoneCards!: boolean;
@Input() hideExpiredCards!: boolean;
@Input() hideDeletedCards!: boolean;

shouldShowCard(item_ItemStatus: number, item_Active: number): boolean {
  if (this.hideDeletedCards === true && item_ItemStatus === 0) {
    return false;
  } else if (this.hideExpiredCards === true && item_ItemStatus === 2 && item_Active !== 0) {
    return false;
  }else if (this.hideDoneCards === true && item_ItemStatus === 2 && item_Active === 0) {
    return false;
  }else if (this.hideNotDoneCards === true && item_ItemStatus === 1 && item_Active === 1 ) {
    return false;
  }else if(this.hideNotDoneCards === true && item_ItemStatus === 1 && item_Active === 0){
    return false;
  }
  
  // If none of the conditions are met, show the card
  return true;
}

views: number = 0;

//Assign User
addUserForm!: FormGroup;

//Constructor & ngOnInit

constructor(
  private viewsService: ViewsService,
  private jwtService: JwtDecodeService,
  private router: Router,
  private toast: NgToastService, 
  private list: ListService,
  private fb: FormBuilder, 
  private UserAsign: AssignUserService, 
  private NotiService: NotificationService,
  private viewService: ViewsService
  ){}

ngOnInit()
{
  //Assign User
  this.addUserForm = this.fb.group({
    UserMail: ['',Validators.required]
  });
  this.UserAsign.showUsers().subscribe
    ((res: any)=>
    {
      this.users = res;
    });
  this.UserAsign.showAssignedUsers().subscribe(
    (res: any) => {
      if (res.success) {
        this.assignedUsers = res.data;
      } else {
        // Handle the error case where 'res.success' is false
        console.error(`API Error: ${res.message}`);
      }
    }
  );
}

verification() {
  if (this.item.createdBy === this.jwtService.userEmail()) {
    return true;
  } else {
    return false;
  }
}

isActiveModal: boolean = false;

showCardModal(id: number) {
  this.isActiveModal = !this.isActiveModal;
  this.registerView(id, this.loggedInUserEmail);
  this.loadViews(this.item.id);
}

loadViews(todoId: number) {
  this.viewsService.getViews(todoId).subscribe(
    (data: any) => {
      this.views = data.data;
    },
    (error: any) => {
      console.error('Error loading views:', error);
    }
  );
}

closeCardModal() {
  this.isActiveModal = !this.isActiveModal;
}

//Assign User

public users: { success: boolean; error: number; message: string; data: User[] } = {
  success: false,
  error: 0,
  message: '',
  data: []
};

public assignedUsers: { success: boolean; error: number; message: string; data: UserAsign[] } = {
  success: false,
  error: 0,
  message: '',
  data: []
};

asignUserToItem(itemTag: string, itemName: string, userEmail: string) {
  const userObj = {
    Tag: itemTag,
    Email: userEmail,
    ItemName: itemName
  };

  this.UserAsign.AsignUser(userObj).subscribe(
    (res: any) => {
      this.refreshData.emit();
      this.toast.success({ detail: "Uspešno dodeljeno opravilo " + userObj.ItemName  + " osebi " + userObj.Email, duration: 2500 });
    }
  );
}

//Notifications
createNotification(notificationData: object): void {
  this.NotiService.requestNotificationPermission();
  this.NotiService.CreateNoti(notificationData).subscribe();
}

//Funkcije za todo
@Output() refreshData: EventEmitter<void> = new EventEmitter<void>();
doneCurrent(current:any)
  {
    current.CompletedBy = this.jwtService.userEmail();
      this.list.DoneItem(current)
      .subscribe({
        next:(
          res=>{
            this.refreshData.emit();
          }
        )
      });
  }

  notDoneCurrent(Ncurrent:any)
  {
    Ncurrent.CompletedBy = this.jwtService.userEmail();
      this.list.NotDoneItem(Ncurrent)
      .subscribe({
        next:(
          res=>{
            this.refreshData.emit();
          }
        )
      })
  }

  //View
  registerView(id: number, userMail: string) {
    const viewObj = {
      TodoItemID: id,
      UserEmail: userMail
    };
    this.viewService.registerView(viewObj).subscribe();
  }

  //toggle Submenu
  isActive = false;

  toggleSubmenu() {
    this.isActive = !this.isActive;
  }

  //toggle assigned users menu
  isActiveUser = false;

  toggleUserMenu() {
    this.isActiveUser = !this.isActiveUser;
  }

  //Card actions menu
  showActions: boolean = false;
  @ViewChild('cardbox') cardbox!: ElementRef;

  OpenActions() {
    this.showActions = !this.showActions;
    if (this.cardbox) {
      if (this.showActions) {
        this.cardbox.nativeElement.style.width = 'calc(100% - 175px)';
      } else {
        this.cardbox.nativeElement.style.width = '100%';
      }
    }
  }

  navigateToAnalytics()
  {
    this.router.navigate(['/analytics', this.item.id]);
  }

  //navigate to users profile page
  navigateToUserDashboard(email: string): void {
    const navigationExtras: NavigationExtras = {
      replaceUrl: true // This will replace the current URL in the browser's history
    };
  
    this.router.navigate(['/dashboard', email], navigationExtras).then(() => {
      location.reload();
    });
  }

  //Show edit modal
  showModalEdit: boolean = false;

  modelOpenEdit() 
  {
    this.showModalEdit = true;
  }

  modelCloseEdit() 
  {
    this.refreshData.emit();
    this.showModalEdit = false;
  }

  //Show delete modal
  showModalDelete: boolean = false;
  modelOpenDelete() 
  {
    this.showModalDelete = true;
  }

  modelCloseDelete() 
  {
    this.refreshData.emit();
    this.showModalDelete = false;
  }

  //Show analytics modal
  isAnalyticsModal: boolean = false;

  showAnalyticsModal(id: number) {
    this.isAnalyticsModal = !this.isAnalyticsModal;
    this.loadViews(this.item.id);
  }
  
  closeAnalyticsModal() {
    this.isAnalyticsModal = !this.isAnalyticsModal;
  }
}
