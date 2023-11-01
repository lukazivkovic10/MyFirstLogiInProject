import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenServiceService } from '../../token-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInUserService {
  private baseUrl:string = "https://localhost:7023/api/userProfile/"
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }
  private addTokenToRequest(url: string, params: HttpParams = new HttpParams()) {
    const headers = this.tokenService.getRequestHeaders();
    return this.http.get(url, { params, headers });
  }

  getUserDetails(email: string)
  {
    return this.addTokenToRequest(`${this.baseUrl}userDetails?email=${email}`);
  }
}
