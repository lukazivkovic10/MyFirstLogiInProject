import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { TokenServiceService } from './token-service.service';
import { TokenValidationService } from './token-validation.service';
import { environment } from 'src/environments/environment';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl:string = environment.apiUrl+'User/';
  private tokenCheckInterval: any; // Timer reference
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService, private tokenValidationService: TokenValidationService, private toast: NgToastService) { }

  startTokenCheck() {
    // Check token validity every X seconds
    const checkIntervalSeconds = 900; // Example: Check every 5 minutes
    this.tokenCheckInterval = setInterval(() => {
      const token = this.tokenService.getToken();
      if (token && !this.tokenValidationService.isTokenValid(token)) {
        this.signOut();
      }
    }, checkIntervalSeconds * 1000); // Convert to milliseconds
  }

  stopTokenCheck() {
    clearInterval(this.tokenCheckInterval);
  }

  signUp(userObj:any)
  {
    return this.http.post<any>(`${this.baseUrl}Registracija`,userObj);
  }

  login(loginObj: any): Observable<any> {
    // Return the Observable directly without calling subscribe here
    return this.http.post<any>(`${this.baseUrl}authenticate`, loginObj);
  }

  signOut(){
    localStorage.removeItem('token');
    this.router.navigate(['login']);
    this.showToast('Odjava', 'Uspešno ste se odjavili.');
  }
  user:any;
  getAll()
  {
    return this.http.get(`${this.baseUrl}userList`, { headers: this.tokenService.getRequestHeaders() });
  }

  storeToken(tokenValue: string){
    localStorage.setItem('token', tokenValue)
  }

  getToken(){
    return localStorage.getItem('token')
  }

  isLoggedIn():boolean{
    return !!localStorage.getItem('token')
  }

  private showToast(detail: string, message: string) {
    this.toast.success({detail: 'ODJAVA', summary: message, duration: 3500 });
  }
}
