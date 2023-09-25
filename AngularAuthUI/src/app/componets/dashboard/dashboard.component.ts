import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { ListService } from 'src/app/services/list.service';
import { SearchTagService } from 'src/app/services/search-tag.service';
import { SharedDataService } from 'src/app/services/shared-data-service.service';
import { Router } from '@angular/router';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SignalRService } from 'src/app/services/signal-r.service';
import { AssignUserService } from 'src/app/services/assign-user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

interface File
{
  id: number;
  tag: string;
  itemName: string;
  fileSize: number;
  filePath: string;
  fileName: string;
}

interface UserAsign
{
  tag:string;
  itemName:string;
  userMail:string;
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
  addUserForm!: FormGroup;

  public savedTag: string = "";

  showModalCreate: boolean = false;
  showModalEdit: boolean = false;
  showModalDelete: boolean = false;
  showModalTags: boolean = false;

  public hideNotDone: boolean = false; 
  public hideNotDoneYet: boolean = false; 
  public hideDeleted: boolean = false;
  public hideDone: boolean = false; 

  constructor(private auth: ListService, private sharedData: SharedDataService, 
    private searchService: SearchTagService,private toast: NgToastService, 
    private router: Router, private fileS: FileUploadService, 
    private notificationService: NotificationService, private signalRService: SignalRService,
    private UserAsign: AssignUserService, private fb: FormBuilder)
  {};

  ngOnInit() {
    this.auth.GetAllItems().subscribe(
      (res: any) => {
        this.items = res;
      }
    );
    this.UserAsign.showUsers().subscribe
    ((res: any)=>
    {
      this.users = res;
    });
    this.UserAsign.showAssignedUsers().subscribe((res: any) => {
      console.log(res);
      this.assignedUsers = res;
    });
    this.fileS.GetAllFiles().subscribe(
      (res: any) => {
        this.files = res;
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
  this.addUserForm = this.fb.group({
    UserMail: ['',Validators.required]
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
    }, 5000); // 5 seconds (5,000 milliseconds)
  
    // Subscribe to the custom notificationClick event
    this.notificationService.notificationClick.subscribe(() => {
      // Open the specified URL when the notification is clicked
      window.open('http://localhost:4200/dashboard', '_blank');
    });
  }

  createNotification(notificationData: object): void {
    this.notificationService.requestNotificationPermission();
    this.notificationService.CreateNoti(notificationData).subscribe(
      (response) => {
        // Handle the response from the server if needed
        console.log('Notification created successfully:', response);
      },
      (error) => {
        // Handle any errors that occur during the HTTP request
        console.error('Error creating notification:', error);
      }
    );
  }

  asignUserToItem(itemTag: string, itemName: string, userEmail: string) {
    const userObj = {
      Tag: itemTag,
      Email: userEmail,
      ItemName: itemName
    };
  
    this.UserAsign.AsignUser(userObj).subscribe();
  }

  downloadFile(id: number, fileName: string) {
    this.fileS.DownloadFile(id).subscribe(
      (blobData: Blob) => {
        const blob = new Blob([blobData], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element and set the desired file name
        const a = document.createElement('a');
        a.href = url;

        // Specify the desired file name here
        a.download = fileName; // Replace with the desired file name

        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error) => {
        console.error('Error downloading file:', error);
      }
    );
  }

  getFileIconClass(fileName: string| undefined): string {
    // Extract the file extension from the file name
    if (!fileName) {
      // Return a default icon class for unknown file types
      return 'fas fa-file'; // You can replace this with your desired default icon class
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

    // Define your iconMap here (same as in your previous code)
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

    // Check if the extracted file extension exists in the iconMap
  if (iconMap.hasOwnProperty(fileExtension)) {
    // Return the corresponding icon class
    return iconMap[fileExtension];
  } else {
    // Return a default icon class for unknown file types
    return 'fas fa-file'; // You can replace this with your desired default icon class
  }
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
