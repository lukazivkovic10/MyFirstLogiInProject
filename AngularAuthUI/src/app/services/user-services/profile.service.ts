import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl:string = "https://localhost:7023/api/userProfile/"
  constructor(private http : HttpClient, private router: Router) { }
  getUserItems(email: any) {
    const url = `https://localhost:7023/api/userProfile/user?email=`+email;
    console.log(url);

    return this.http.get(url);
  }
}

