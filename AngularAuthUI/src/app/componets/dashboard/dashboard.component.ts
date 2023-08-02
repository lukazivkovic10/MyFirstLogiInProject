import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SharedDataService } from 'src/app/services/shared-data-service.service';

interface Item
{
  id: number;
  tag: string;
  itemName: string;
  itemDesc: string;
  itemStatus: number;
  active: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit{
  public items: { success: boolean; error: number; message: string; data: Item[] } = {
    success: false,
    error: 0,
    message: '',
    data: []
  };
  public clickedDone: boolean = false;

  constructor(private auth: AuthService, private sharedData: SharedDataService) 
  {};

  ngOnInit() {
    this.auth.GetAllItems().subscribe(
      (res: any) => {
        this.items = res;
        console.log(res)
      }
    );

    this.sharedData.searchResult$.subscribe((res: any) => {
      if (res) {
        this.items = res;
      }
    });
  }

  showAll(){
    this.auth.GetAllItems().subscribe(
      (res: any) => {
        this.items = res;
        this.clickedDone = false;
      }
    );
  }

  showAllDone(){
    this.auth.GetAllDoneItems().subscribe((res: any)=>{
      this.items = res;
      this.clickedDone = true;
    })
  }

  doneCurrent(current:any)
  {
      console.log(current)
      this.auth.DoneItem(current)
      .subscribe({
        next:(
          res=>{
            window.location.reload();
          }
        )
      })
  }

  notDoneCurrent(Ncurrent:any)
  {
      console.log(Ncurrent)
      this.auth.NotDoneItem(Ncurrent)
      .subscribe({
        next:(
          res=>{
            window.location.reload();
          }
        )
      })
  }
  }
