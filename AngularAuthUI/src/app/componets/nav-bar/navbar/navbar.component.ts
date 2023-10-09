import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    this.router.navigate(['/dashboard', this.searchUserText.value]);
  }

  navigateToCurrentLoggedInUserDashboard(): void {
    this.router.navigate(['/dashboard', this.userMail]);
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
