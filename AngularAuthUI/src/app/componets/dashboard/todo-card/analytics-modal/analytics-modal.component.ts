import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/AnalyticsServices/analytics.service';
import { ListService } from 'src/app/services/list.service';
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

interface User {
  email: string;
  viewedAt: Date;
}

@Component({
  selector: 'app-analytics-modal',
  templateUrl: './analytics-modal.component.html',
  styleUrls: ['./analytics-modal.component.css']
})
export class AnalyticsModalComponent {
  public items: { success: boolean; error: number; message: string; data: Item[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  public users: { success: boolean; error: number; message: string; data: User[]  } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };


  @Input() receivedData: number = 0;


  constructor(
    private router: Router,
    private List: ListService,
    private route: ActivatedRoute,
    private Analytics: AnalyticsService
    ){}
  
  ngOnInit()
  {
    const customData = this.route.snapshot.paramMap.get('id');
    this.receivedData = customData !== null ? +customData : 0;
    this.getDataById(this.receivedData);
    this.Analytics.getUsersData(this.receivedData)
    .subscribe((response: any) => {
      this.users = response;
    });
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

  getDataById(id: number): void {
    this.List.getItemById(id).subscribe((data : any)=> {
      this.items = data;
    });
  }

  convertSecondsToDHMS(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    
    return `${days} dneh, ${hours} urah, ${minutes} minutah, ${seconds} sekundah`;
  }

}
