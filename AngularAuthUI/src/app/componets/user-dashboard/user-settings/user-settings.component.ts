import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtDecodeService } from 'src/app/services/jwt-decode.service';
import { LoggedInUserService } from 'src/app/services/user-services/LoggedInUserServices/logged-in-user.service';

interface User
{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  userEmail: string = '';

  updateUserForm!: FormGroup;

  public loggedInUser: { success: boolean; error: number; message: string; data: User[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };

  constructor(private router: Router, private jwtDecode: JwtDecodeService, private userServices: LoggedInUserService, private fb: FormBuilder) 
  {
    this.userEmail= this.jwtDecode.userEmail();
    this.userDetails();
  }

  ngOnInit(): void 
  {
    this.updateUserForm = this.fb.group({
      firstName: [''],
      lastName: ['']
    });
  }

  isActiveEditProfile = false;
  toggleEditProfile() {
    this.isActiveEditProfile = !this.isActiveEditProfile;
  }

  navigateToCurrentLoggedInUserDashboard(): void {
    this.router.navigate(['/dashboard', this.userEmail, 'profile']);
  }

  userDetails() {
    this.userServices.getUserDetails(this.userEmail).subscribe((data: any) => {
      // Check if data is an object and transform it to an array
      if (typeof data === 'object' && !Array.isArray(data)) {
        this.loggedInUser.data = Object.values(data);
      } else {
        this.loggedInUser.data = data; // Keep it as is if it's already an array
      }
    });
  }
}
