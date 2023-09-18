import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
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

  public getId(x:number = 0){
    if(this.users.user.id = x)
    {
    }
  };
}
