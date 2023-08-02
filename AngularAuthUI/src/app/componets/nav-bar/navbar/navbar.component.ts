import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private auth: AuthService){}
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
}
