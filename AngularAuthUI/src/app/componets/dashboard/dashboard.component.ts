import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private auth: AuthService){
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
  }
