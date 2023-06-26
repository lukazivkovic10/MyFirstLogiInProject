import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye";

  hideShowPassword()
  {
    this.isText = !this.isText;//Ker je isText Boolean naredi to true or false
    this.isText ? this.eyeIcon = "fa-eye-slash" : this.eyeIcon = "fa-eye"; //Če je true naredi icon v eye-slash drugace pa icon v fa-eye
    this.isText ? this.type = "text" : this.type = "password"; //to pa če je true spremeni type v text drugače pa v password
  };
}
