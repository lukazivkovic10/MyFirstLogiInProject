import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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
  constructor(private fb: FormBuilder, private auth: AuthService, private route: Router) {};

  ngOnInit(): void
  {
    this.loginForm = this.fb.group({
      Firstname: [''],
      Lastname: [''],
      email: ['',Validators.required],
      password: ['',Validators.required]
    })
  }

  hideShowPassword()
  {
    this.isText = !this.isText;//Ker je isText Boolean naredi to true or false
    this.isText ? this.eyeIcon = "fa-eye-slash" : this.eyeIcon = "fa-eye"; //Če je true naredi icon v eye-slash drugace pa icon v fa-eye
    this.isText ? this.type = "text" : this.type = "password"; //to pa če je true spremeni type v text drugače pa v password
  };

  onLogin()
  {
    console.log(this.loginForm.value)
    //Pošlje v Db
    this.auth.login(this.loginForm.value)
    .subscribe({
      next:(res=>{
        alert(res.message)
        this.loginForm.reset();
        this.route.navigate(['dashboard']);
      }),
      error:(err)=>{
        alert(err?.error.message)
      }
    })
  }
}
