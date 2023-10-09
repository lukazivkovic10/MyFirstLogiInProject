import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ListService } from 'src/app/services/list.service';
import { DashboardComponent } from '../dashboard.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssignUserService } from 'src/app/services/assign-user.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ProfileService } from 'src/app/services/user-services/profile.service';

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
  }
  
  // If none of the conditions are met, show the card
  return true;
}

//Assign User
addUserForm!: FormGroup;

//Constructor & ngOnInit

constructor(private changeDetectorRef: ChangeDetectorRef, private list: ListService,private fileS: FileUploadService, private fb: FormBuilder, private UserAsign: AssignUserService, private NotiService: NotificationService){}

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
  this.UserAsign.showAssignedUsers().subscribe((res: any) => {
    this.assignedUsers = res;
  });
  this.fileS.GetAllFiles().subscribe(
    (res: any) => {
      this.files = res;
    }
  );
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

public files: { success: boolean; error: number; message: string; data: File[] } = {
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

  this.UserAsign.AsignUser(userObj).subscribe();
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
      this.list.NotDoneItem(Ncurrent)
      .subscribe({
        next:(
          res=>{
            this.refreshData.emit();
          }
        )
      })
  }

  //File download functions
  shouldShowPriloge(): boolean {
    return this.files.data.length > 0 && this.files.data.some(file => file.tag === this.item.tag && file.itemName === this.item.itemName);
  }

  downloadFile(id: number, fileName: string) {
    this.fileS.DownloadFile(id).subscribe(
      (blobData: Blob) => {
        const blob = new Blob([blobData], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    );
  }

  getFileIconClass(fileName: string| undefined): string {
    if (!fileName) {
      return 'fas fa-file';
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

    const iconMap: { [key: string]: string } = {
      'jpg': 'fas fa-file-image',
      'jpeg': 'fas fa-file-image',
      'png': 'fas fa-file-image',
      'pdf': 'fas fa-file-pdf',
      'zip': 'fas fa-file-archive',
      '7zip': 'fas fa-file-archive',
      'pptx': 'fas fa-file-powerpoint',
      'pptm': 'fas fa-file-powerpoint',
      'ppt': 'fas fa-file-powerpoint',
      'xlsx': 'fas fa-file-excel',
      'xlsm': 'fas fa-file-excel',
      'xlsb': 'fas fa-file-excel',
      'xltx': 'fas fa-file-excel',
      'doc': 'fas fa-file-word',
      'txt': 'fas fa-file-lines',
      'mpeg': 'fas fa-file-video',
      'mp3': 'fas fa-file-audio',
    };

  if (iconMap.hasOwnProperty(fileExtension)) {
    return iconMap[fileExtension];
  } else {
    return 'fas fa-file';
  }
  }

  isActive = false;

  toggleSubmenu() {
    this.isActive = !this.isActive;
  }

  isActiveUser = false;

  toggleUserMenu() {
    this.isActiveUser = !this.isActiveUser;
  }

  isActiveSettings = false;
  toggleSettingsMenu() {
    this.isActiveSettings = !this.isActiveSettings;
  }
}
