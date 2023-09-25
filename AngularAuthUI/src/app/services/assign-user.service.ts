import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AssignUserService {
  private baseUrl:string = "https://localhost:7023/api/AsignUser/"
  constructor(private http : HttpClient, private router: Router) { }

  AsignUser(userObj: any) {

    return this.http.post<any>(`${this.baseUrl}DodeliUporabniku`,userObj);
  }

  showUsers()
  {
    return this.http.get<object>(`${this.baseUrl}MozniUporabniki`);
  }

  showAssignedUsers()
  {

    return this.http.get<any>(`${this.baseUrl}DodeljeniUporabniki`);
  }
}
