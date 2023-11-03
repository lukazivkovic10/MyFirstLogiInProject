import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ViewsService } from 'src/app/services/CardServices/views.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { JwtDecodeService } from 'src/app/services/jwt-decode.service';

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
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.css']
})
export class CardModalComponent {
  @Input() item_ItemName: string = '';
  @Input() item_Tag: string = '';
  @Input() item_ItemDesc: string = '';
  @Input() item_ItemStatus: number = 1;
  @Input() item_Active: number = 1;
  @Input() item_completeDate: Date = new Date();
  @Input() item_dateOfCompletion: Date = new Date();
  @Input() item!: Item;
  @Input() isActiveModal: boolean = false;
  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter();
  @Input() Status_border: string = '';

  @Input() views: number = 0;

  public files: { success: boolean; error: number; message: string; data: File[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(
    private router: Router,
    private fileS: FileUploadService,
    private jwtService: JwtDecodeService
    ){}

ngOnInit()
{
  //Get files
  this.fileS.GetAllFiles().subscribe(
    (res: any) => {
      this.files = res;
    }
  );
}

closeModal()
{
  this.valueChanged.emit(false);
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

 //navigate to users profile page
 navigateToUserDashboard(email: string): void {
  const navigationExtras: NavigationExtras = {
    replaceUrl: true // This will replace the current URL in the browser's history
  };

  this.router.navigate(['/dashboard', email, 'profile'], navigationExtras).then(() => {
    location.reload();
  });
}
verification() {
  if (this.item.createdBy === this.jwtService.userEmail()) {
    return true;
  } else {
    return false;
  }
}
}
