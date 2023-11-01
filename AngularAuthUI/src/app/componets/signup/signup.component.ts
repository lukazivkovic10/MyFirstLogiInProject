import { group } from '@angular/animations';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helper/validateform';
import { AuthService } from 'src/app/services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { PasswordService } from 'src/app/services/password.service';
import { Message } from 'ng-angular-popup/lib/toast.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye";
  signUpForm!: FormGroup;
  errText:string = "";
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router,private toast: NgToastService, private passwordService: PasswordService) {};

  ngOnInit(): void
  {
    this.signUpForm = this.fb.group({
      Firstname: ['',Validators.required],
      Lastname: ['',Validators.required],
      email: ['',Validators.compose([Validators.required,Validators.email])],
      password: ['',Validators.compose([Validators.required,Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\.=~ˇ,*])(?=.{8,})/),Validators.minLength(8)])],
    })
  }

  hideShowPassword()
  {
    this.isText = !this.isText;//Ker je isText Boolean naredi to true or false
    this.isText ? this.eyeIcon = "fa-eye-slash" : this.eyeIcon = "fa-eye"; //Če je true naredi icon v eye-slash drugace pa icon v fa-eye
    this.isText ? this.type = "text" : this.type = "password"; //to pa če je true spremeni type v text drugače pa v password
  };

  onSignup() 
  {
    if (this.signUpForm.valid) {
      const passwordValue = this.signUpForm.value.password;
  
      // Perform custom password validation here (this is a simplified example)
      if (this.isPasswordValid(passwordValue)) {
        // Encrypt the password
        const encryptedPassword = this.passwordService.encrypt(passwordValue);
  
        // Update the form value with the encrypted password
        this.signUpForm.patchValue({
          password: encryptedPassword
        });
  
        // Proceed with signup
        this.auth.signUp(this.signUpForm.value)
          .subscribe({
            next: (res => {
              alert(res.message);
              this.signUpForm.reset();
              this.toast.success({ detail: "USPEH", summary: res.message, duration: 5000 });
              this.router.navigate(['login']);
            }),
            error: (err => {
              this.toast.error({ detail: "NAPAKA", summary: err?.error.message, duration: 7000 });
            })
          });
      } else {
        this.toast.error({detail: "NAPAKA", summary: "Geslo mora vsebovati vsaj 8 znakov, eno veliko črko, eno malo črko, eno številko in en poseben znak!", duration: 2500 });
      }

      this.signUpForm.patchValue({
        password: passwordValue // Revert the form value to the original password
      });

    } else {
      ValidateForm.validateAllFormFields(this.signUpForm);
    }
  }
  
  // Define your custom password validation function
  isPasswordValid(password: string): boolean 
  {
    // Regular expressions for validation
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#\$%\^&\.=~ˇ,*]/;
    const minLength = 8;
  
    // Check each condition
    const hasUppercase = uppercaseRegex.test(password);
    const hasLowercase = lowercaseRegex.test(password);
    const hasDigit = digitRegex.test(password);
    const hasSpecialChar = specialCharRegex.test(password);
    const isMinLength = password.length >= minLength;
  
    // Return true if all conditions are met
    return hasUppercase && hasLowercase && hasDigit && hasSpecialChar && isMinLength;
  }
}
