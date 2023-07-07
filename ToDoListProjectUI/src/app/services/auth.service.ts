import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private baseUrl:string = "https://localhost:7050/api/Items/"
  constructor(private http : HttpClient) { }

  item:any;
  GetAllItems()
  {
    return this.http.get(`${this.baseUrl}ItemsList`);
  }
}
