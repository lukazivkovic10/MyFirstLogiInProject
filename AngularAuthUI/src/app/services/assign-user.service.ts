import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from "@angular/common/http";
import { TokenServiceService } from './token-service.service';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AssignUserService {
  private baseUrl:string = environment.apiUrl;
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }

  private addTokenToRequest(url: string, params: HttpParams = new HttpParams()) {
    const headers = this.tokenService.getRequestHeaders();
    return this.http.get(url, { params, headers });
  }
  
  AsignUser(userObj: any) {

    return this.http.post<any>(`${this.baseUrl}DodeliUporabniku`,userObj, { headers: this.tokenService.getRequestHeaders() });
  }

  showUsers()
  {
    return this.addTokenToRequest(`${this.baseUrl}MozniUporabniki`);
  }

  showAssignedUsers()
  {

    return this.http.get<any>(`${this.baseUrl}DodeljeniUporabniki`, { headers: this.tokenService.getRequestHeaders() });
  }
}
