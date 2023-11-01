import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from "@angular/common/http";
import { TokenServiceService } from '../token-service.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl:string = "https://localhost:7023/api/userProfile/"
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }
  private addTokenToRequest(url: string, params: HttpParams = new HttpParams()) {
    const headers = this.tokenService.getRequestHeaders();
    return this.http.get(url, { params, headers });
  }
  getUserItems(email: any) {
    const url = `https://localhost:7023/api/userProfile/userAssigned?email=`+email;
    return this.addTokenToRequest(url);
  }
  getUserCreatedItems(email: any) {
    const url = `https://localhost:7023/api/userProfile/userCreated?email=`+email;
    return this.addTokenToRequest(url);
  }
}

