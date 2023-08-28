import { group } from '@angular/animations';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helper/validateform';
import { AuthService } from 'src/app/services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { PasswordService } from 'src/app/services/password.service';

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
      password: ['',Validators.compose([Validators.required,Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)])],
      token: ['']
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
    const encryptedPassword = this.passwordService.encrypt(this.signUpForm.value.password);
    
    this.signUpForm.patchValue({
      password: encryptedPassword
    });
    if(this.signUpForm.valid)
    {
    //Pošlje v Db
    this.auth.signUp(this.signUpForm.value)
    .subscribe({
      next:(res=>{
        alert(res.message);
        this.signUpForm.reset();
        this.toast.success({detail:"USPEH", summary:res.message, duration: 5000});
        this.router.navigate(['login']);
      }),
      error:(err=>{
        this.toast.error({detail:"NAPAKA", summary:err?.error.message, duration: 7000});
      })
    })
    console.log(this.signUpForm.value)
    }else{
      ValidateForm.validateAllFormFields(this.signUpForm);
    }

  }
}
