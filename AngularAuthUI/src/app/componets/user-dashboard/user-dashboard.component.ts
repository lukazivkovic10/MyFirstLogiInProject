import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from 'src/app/services/user-services/profile.service';
import { map } from 'rxjs/operators';
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

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})

export class UserDashboardComponent {
  userEmail: string = '';
  @ViewChild('stringData', { static: true }) stringData!: TemplateRef<any>;
  private loggedInUserEmail: string = '';
  public items: { success: boolean; error: number; message: string; data: Item[] | string } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(private route: ActivatedRoute, private profileService: ProfileService, private jwtDecode: JwtDecodeService, private router: Router) {}

  ngOnInit(): void 
  {
    this.route.params.subscribe(params => {
      this.userEmail = params['email'];
    });
    this.onShowAssigned();
  }

  isItemsArray(data: Item[] | string): data is Item[] {
    return Array.isArray(data);
  }

  getLoggedInUserEmail() {
    this.loggedInUserEmail = this.jwtDecode.userEmail();
  }

  userCheck():boolean 
  {
    this.getLoggedInUserEmail();
    this.getUserEmail();
    this.userEmail = decodeURI(this.userEmail);
    if (this.userEmail === this.loggedInUserEmail) {
      return true;
    } else {
      return false;
    }
  }


  getUserEmail() {
    const userEmailParam = this.route.snapshot.paramMap.get('email');
    if (userEmailParam !== null) {
      this.userEmail = decodeURIComponent(userEmailParam);
    }
  }

  navigateToUserSettings(): void {
    this.router.navigate(['/dashboard', this.loggedInUserEmail, 'profile-settings']);
  }

  showAssigned: boolean = false;
  showCreated: boolean = false;

  onShowAssigned() {
    if(this.showCreated == true)
    {
      this.showCreated = false;
    };
    this.showAssigned = true;
    if(this.showAssigned === true)
    {
      this.profileService.getUserItems(this.userEmail).pipe(
        map((res: any) => res)
      ).subscribe(
        (res: any) => {
          this.items = res;
        },
        (error) => {
          console.error("Error fetching user items:", error);
        }
      ); 
    }else
    {
    }
  }

  onShowCreated() {
    if(this.showAssigned == true)
    {
      this.showAssigned = false;
    };
    this.showCreated = true;
    if(this.showCreated === true)
    {
      this.profileService.getUserCreatedItems(this.userEmail).pipe(
        map((res: any) => res)
      ).subscribe(
        (res: any) => {
          this.items = res;
        },
        (error) => {
          console.error("Error fetching user items:", error);
        }
      ); 
    }else
    {
    }
  }
}
