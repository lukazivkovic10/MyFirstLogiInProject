import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl:string = "https://localhost:7023/api/User/"
  constructor(private http : HttpClient, private router: Router) { }

  signUp(userObj:any)
  {
    return this.http.post<any>(`${this.baseUrl}Registracija`,userObj);
  }

  login(loginObj:any)
  {
    return this.http.post<any>(`${this.baseUrl}authenticate`,loginObj);
  }

  signOut(){
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }
  user:any;
  getAll()
  {
    return this.http.get(`${this.baseUrl}userList`);
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
}
