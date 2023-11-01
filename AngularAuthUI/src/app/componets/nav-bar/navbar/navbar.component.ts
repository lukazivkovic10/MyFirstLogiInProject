import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth.service';
import { JwtDecodeService } from 'src/app/services/jwt-decode.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userMail: string = '';
  searchUserText = new FormControl('', [Validators.required, Validators.email]);
  constructor(private auth: AuthService,private router: Router,
     private JwtDecode: JwtDecodeService, private toast: NgToastService)
  {
    this.userMail= this.JwtDecode.userEmail();
    this.userMail;
  }

  showProfile():boolean{
    if(this.auth.isLoggedIn())
    {
      return true;
    }else
    return false; 
  }
  logout(){
    this.auth.signOut();
  }

  navigateToUserDashboard(): void {
    const searchTerm = this.searchUserText.value;

  if (searchTerm) {
    const navigationExtras: NavigationExtras = {
      replaceUrl: true // This will replace the current URL in the browser's history
    };

    const encodedSearch = encodeURIComponent(searchTerm);

    this.router.navigate(['/dashboard', encodedSearch, 'profile'], navigationExtras).then(() => {
      this.searchUserText.reset();
      location.reload();
    });
  }
  }

  navigateToUserSettings(): void {
    const encodedEmail = encodeURIComponent(this.userMail);
    this.router.navigate(['/dashboard', encodedEmail, 'profile-settings']);
  }

  navigateToCurrentLoggedInUserDashboard(): void {
    const encodedEmail = encodeURIComponent(this.userMail);
    this.router.navigate(['/dashboard', encodedEmail, 'profile']);
  }

  emailErrorMessage()
  {
    this.toast.error({ detail: "NAPAKA",summary:"Epoštni ni veljaven." , duration: 2500 });
  }

  isActive = false;

  showMenuBtn() {
    this.isActive = !this.isActive;
  }

  showMenu() {
    if (this.isActive == true) {
      return 'navbar-dropup isActive';
    } else {
      return 'navbar-dropup';
    }
  }
}
