import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { PasswordService } from 'src/app/services/password.service';
import { JwtDecodeService } from 'src/app/services/jwt-decode.service';
import ValidateForm from 'src/app/helper/validateform';
import { TokenServiceService } from 'src/app/services/token-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye";
  loginForm!: FormGroup;
  constructor(private tokenService: TokenServiceService,private fb: FormBuilder, private auth: AuthService, private route: Router, private toast: NgToastService, private passwordService: PasswordService, private jwtDecode: JwtDecodeService) {}

  ngOnInit(): void
  {
    this.loginForm = this.fb.group({
      email: ['',Validators.compose([Validators.required,Validators.email])],
      password: ['',Validators.required]
    });
  }

  hideShowPassword()
  {
    this.isText = !this.isText;//Ker je isText Boolean naredi to true or false
    this.isText ? this.eyeIcon = "fa-eye-slash" : this.eyeIcon = "fa-eye"; //Če je true naredi icon v eye-slash drugace pa icon v fa-eye
    this.isText ? this.type = "text" : this.type = "password"; //to pa če je true spremeni type v text drugače pa v password
  };

  encryptedPassword: string = '';

  onLogin() {
    if (this.loginForm.valid) {
      const passwordValue = this.loginForm.value.password;
  
      // Perform custom password validation here (if needed)
  
      // Encrypt the password
      const encryptedPassword = this.passwordService.encrypt(passwordValue);
  
      // Update the form value with the encrypted password
      this.loginForm.patchValue({
        password: encryptedPassword
      });
  
      // Proceed with the login
      this.auth.login(this.loginForm.value)
      .subscribe(
        (res: any) => {
          // Handle the response here
          if (res && res.token) {
            this.tokenService.setToken(res.token); // Set the JWT token in the ListService
            this.auth.startTokenCheck(); // Start the token check timer for auto logout when token expires
    
            this.toast.success({ detail: "DOBRODOŠLI V PROGRAM", summary: res.message, duration: 5000 });
    
            const tokenPayload = this.jwtDecode.decodeToken(res.token);
            const userEmail = tokenPayload.email;
    
            this.route.navigate(['/dashboard', userEmail, 'profile']);
          } else {
            this.toast.error({ detail: "NAPAKA", summary: "Token not found in response", duration: 5000 });
          }
        },
        (err: any) => {
          this.toast.error({ detail: "NAPAKA", summary: err?.error.message, duration: 5000 });
        }
      );
      
      // Revert the form value to the original password
      this.loginForm.patchValue({
        password: passwordValue
      });
    } else {
      ValidateForm.validateAllFormFields(this.loginForm);
    }
  }
}
