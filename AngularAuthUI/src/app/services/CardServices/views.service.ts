import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenServiceService } from '../token-service.service';
@Injectable({
  providedIn: 'root'
})
export class ViewsService {
  private baseUrl:string = "https://localhost:7023/api/Views/"
  constructor(private http : HttpClient, private tokenService: TokenServiceService) { }

  private addTokenToRequest(url: string, params: HttpParams = new HttpParams()) {
    const headers = this.tokenService.getRequestHeaders();
    return this.http.get(url, { params, headers });
  }

  registerView(details: any) {
    return this.http.post<any>(`${this.baseUrl}register-view`,details, { headers: this.tokenService.getRequestHeaders() });
  }
  
  getViews(id: number) 
  {
    return this.addTokenToRequest(`${this.baseUrl}get-views/${id}`);
  }
}
