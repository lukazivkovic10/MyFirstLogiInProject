import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  constructor(private auth: AuthService, private router: Router){
  };
  public users:any = [];
  public fullName : string = "";
  ngOnInit()
  {
    this.auth.getAll()
    .subscribe(res=>{
      this.users = res;
    })
  }

  navigateToUserDashboard(email: string): void {
    const navigationExtras: NavigationExtras = {
      replaceUrl: true // This will replace the current URL in the browser's history
    };

    const encodedEmail = encodeURIComponent(email);
  
    this.router.navigate(['/dashboard', email, 'profile'], navigationExtras).then(() => {
      location.reload();
    });
  }

  public getId(x:number = 0){
    if(this.users.user.id = x)
    {
    }
  };
}
