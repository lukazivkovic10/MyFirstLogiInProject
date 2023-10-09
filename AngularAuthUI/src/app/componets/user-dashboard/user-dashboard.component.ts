import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from 'src/app/services/user-services/profile.service';
import { map } from 'rxjs/operators';

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
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})

export class UserDashboardComponent {
  userEmail: string = '';
  public items: { success: boolean; error: number; message: string; data: Item[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(private route: ActivatedRoute, private profileService: ProfileService) {}

  ngOnInit(): void 
  {
    this.route.params.subscribe(params => {
      this.userEmail = params['email'];
      this.getUserItems();
    });
  }

  getUserEmail() {
    const userEmailParam = this.route.snapshot.paramMap.get('email');
    if (userEmailParam !== null) {
      this.userEmail = userEmailParam;
    }
  }
  
  getUserItems() {
    this.profileService.getUserItems(this.userEmail).pipe(
      map((res: any) => res)
    ).subscribe(
      (res: any) => {
        this.items = res;
        console.log(this.items);
      }
    ); 
  }
}
