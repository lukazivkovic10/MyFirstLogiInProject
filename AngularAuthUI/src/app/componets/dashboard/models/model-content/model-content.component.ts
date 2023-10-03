import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { FileUploader } from 'ng2-file-upload';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ListService } from 'src/app/services/list.service';
import { TagsService } from 'src/app/services/tags.service';

interface Tag
{
  tagid: number;
  tagName: string;
};

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.css']
})
export class ModelContentComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  createForm!: FormGroup;
  public errors:any = [];
  public tags: { success: boolean; error: number; message: string; data: Tag[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };
  @Output() close = new EventEmitter<void>();
  http: any;
  constructor(private UploadS: FileUploadService,private list: ListService,private fb: FormBuilder, private router: Router, private toast: NgToastService, private tagService: TagsService){ };

  public ds: Date = new Date();
  ngOnInit() {
    this.createForm = this.fb.group({
      Tag: ['',Validators.required],
      ItemName: ['',Validators.required],
      ItemDesc: [''],
      ItemStatus: ['1'],
      Active: ['',Validators.required],
      CreatedDate: [this.ds],
      CompleteDate: ['',Validators.required],
      FolderPath: [''],
      ItemRepeating: [''],
      ReapeatWeekly: [[] as number[]],
    });
    this.tagService.GetTags().subscribe(
      (res:any)=>{
        this.tags = res;
      }
    )
  }

  selectedFiles: File[] = [];

  selectFiles() {
    // Trigger the click event
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    if (files.length > 0) {
        // Log the selected files
        console.log(files);

        // Add files to the uploadedFiles array
        for (let i = 0; i < files.length; i++) {
            this.uploadedFiles.push(files[i]);
        }
    } else {
        console.warn('No files selected.');
    }
}

  formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1048576) {
      return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1073741824) {
      return (size / 1048576).toFixed(2) + ' MB';
    } else {
      return (size / 1073741824).toFixed(2) + ' GB';
    }
  }

  getFileIconClass(fileType: string): string {
    // Create an icon mapping based on file extensions or MIME types
    const iconMap: { [key: string]: string } = {
      'image/jpeg': 'fas fa-file-image',
      'image/png': 'fas fa-file-image',
      'application/pdf': 'fas fa-file-pdf',
      'application/zip': 'fas fa-file-archive',
      'application/7zip': 'fas fa-file-archive',
      'application/pptx': 'fas fa-file-powerpoint',
      'application/pptm': 'fas fa-file-powerpoint',
      'application/ppt': 'fas fa-file-powerpoint',
      'application/xlsx': 'fas fa-file-excel',
      'application/xlsm': 'fas fa-file-excel',
      'application/xlsb': 'fas fa-file-excel',
      'application/xltx': 'fas fa-file-excel',
      'application/doc': 'fas fa-file-word',
      'text/plain': 'fas fa-file-lines',
      'video/mp4': 'fas fa-file-video',
      'audio/mpeg': 'fas fa-file-audio',
      'audio/mp3': 'fas fa-file-audio',
    };

    // Default je ikona
    const defaultIconClass = 'fas fa-file';

    // Ikona je based na fileType npr.png, jpg...
    return iconMap[fileType] || defaultIconClass;
  }

  modelCloseCreate() 
  {
    this.close.emit();
    this.createForm.reset();
  }

  onCreate()
  {
    if(this.createForm.valid)
    {
      this.onUpload();
      this.list.CreateItem(this.createForm.value)
      .subscribe({
        next:(
          res=>{
            this.errors = res;
            this.createForm.reset();
            this.modelCloseCreate();
            this.toast.success({ detail: "Uspešno ustavrjeno opravilo.", duration: 2500 });
          }
        ),
        error: (err) => {
          this.toast.error({ detail: "NAPAKA", duration: 2500 });
        }
      })
    }else
    {
      this.toast.warning({ detail: "OPOZORILO", summary: "Manjkajo zahtevana polja.", duration: 2500 });
    }
  }

  uploadedFiles: File[] = []; // Maintain a list of uploaded files
  message: string = '';

  todoTagName() {
    const tagValue = this.createForm.get('Tag')?.value;
    const itemNameValue = this.createForm.get('ItemName')?.value;
    const todoTagNameString = tagValue + '_' + itemNameValue;
    
    return(todoTagNameString);
  }

  onUpload() {
    const todoTagName = this.todoTagName();
    const formData = new FormData();
    const tagValue = this.createForm.get('Tag')?.value
    const itemNameValue = this.createForm.get('ItemName')?.value;

    if (this.uploadedFiles.length === 0) {
      console.error('No files selected for upload.');
      return; // Abort the upload if no files are selected
    }

    // Append each uploaded file to the formData object
    this.uploadedFiles.forEach((file) => {
        formData.append('files', file); // Use 'files' as the key to match the server-side code
    });

    // Append the todoTagName to formData
    formData.append('todoTagName', todoTagName);
    formData.append('tag', tagValue);
    formData.append('itemName', itemNameValue);

    console.log(formData);

    // Make an HTTP POST request to upload the files to the server
    this.UploadS.Upload(formData).subscribe(
        (response) => {
            this.message = 'Files uploaded successfully';
            this.uploadedFiles = []; // Clear the list after a successful upload
        }
    );
}

isSwitchChecked = false;
@ViewChild('switchElement', { static: false }) switchElement!: ElementRef;

ngAfterViewInit() {
  // Initialize the switch based on the initial value of isSwitchChecked
  this.switchElement.nativeElement.checked = this.isSwitchChecked;
}

toggleContent() {
  // Toggle the content based on the switch state
  this.isSwitchChecked = !this.isSwitchChecked;
  this.switchElement.nativeElement.checked = this.isSwitchChecked;

  if (!this.isSwitchChecked) {
    this.createForm.patchValue({
      ItemRepeating: '',
      ReapeatWeekly: []
    });
  }
}

public showDaily: boolean = true;
public showMonthly: boolean = true;
public showYearly: boolean = true;
public showWeekly: boolean = true;
public showCustom: boolean = true;
public showWeeklyFieldset: boolean = true;

onRadioChange(option: string) {
  switch (option) {
    case 'daily':
      this.showDaily = false;
      this.showMonthly = true;
      this.showYearly = true;
      this.showWeekly = true;
      this.showWeeklyFieldset = true;
      break;
    case 'monthly':
      this.showDaily = true;
      this.showMonthly = false;
      this.showYearly = true;
      this.showWeekly = true;
      this.showWeeklyFieldset = true;
      break;
    case 'yearly':
      this.showDaily = true;
      this.showMonthly = true;
      this.showYearly = false;
      this.showWeekly = true;
      this.showWeeklyFieldset = true;
      break;
    case 'weekly':
      this.showDaily = true;
      this.showMonthly = true;
      this.showYearly = true;
      this.showWeekly = false;
      this.showCustom = true;
      this.showWeeklyFieldset = true;
      break;
    case 'custom':
      this.showDaily = true;
      this.showMonthly = true;
      this.showYearly = true;
      this.showWeekly = true;
      this.showCustom = false;
      this.showWeeklyFieldset = true;
      break;
    case 'showWeekly':
      this.showWeeklyFieldset = false;
    break;

    default:
      // Handle unexpected option
      break;
  }
}

showFieldset: boolean = false;

toggleFieldset() {
  this.showFieldset = !this.showFieldset;
}

  toggleDay(day: number) {
    const control = this.createForm.get('ReapeatWeekly');

    if (control) {
      const selectedDays = control.value as number[];

      if (selectedDays.includes(day)) {
        control.setValue(selectedDays.filter((d: number) => d !== day));
      } else {
        control.setValue([...selectedDays, day]);
      }
    }
  }

  isDaySelected(day: number): boolean {
    const control = this.createForm.get('ReapeatWeekly');
    const selectedDays = control?.value as number[];

    return !!selectedDays && selectedDays.includes(day);
  }
}
