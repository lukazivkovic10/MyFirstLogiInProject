import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenServiceService } from '../token-service.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl:string = environment.apiUrl;
  constructor(private http : HttpClient, private tokenService: TokenServiceService) { }

  private addTokenToRequest(url: string, params: HttpParams = new HttpParams()) {
    const headers = this.tokenService.getRequestHeaders();
    return this.http.get(url, { params, headers });
  }

  getViewData(id: number)
  {
    return this.addTokenToRequest(`${this.baseUrl}ViewsData/${id}`);
  }
  
  getUsersData(id: number)
  {
    return this.http.get<any>(`${this.baseUrl}ViewsData/UserList/${id}`, { headers: this.tokenService.getRequestHeaders() });
  }
}
