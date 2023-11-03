import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenServiceService } from './token-service.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private baseUrl:string = environment.apiUrl;
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }

  private addTokenToRequest(url: string, params: HttpParams = new HttpParams()) {
    const headers = this.tokenService.getRequestHeaders();
    return this.http.get(url, { params, headers });
  }

  DeleteItem(deleteObj:any)
  {
    return this.http.delete(`${this.baseUrl}SoftDelete`+deleteObj.ItemName, { headers: this.tokenService.getRequestHeaders() });
  }

  GetAllItems(page: number, pageSize: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.addTokenToRequest(`${this.baseUrl}IskanjeListaVseh`, params);
  }

  GetAllDoneItems()
  {
    return this.addTokenToRequest(`${this.baseUrl}PrikazOpravljenih`);
  }

  SearchItem(ItemTag:string)
  {
    return this.addTokenToRequest(`${this.baseUrl}IskanjeLista/`+ItemTag.search);
  }

  CreateItem(createObj:any)
  {
    return this.http.post(`${this.baseUrl}Ustvarjanje`, createObj, { headers: this.tokenService.getRequestHeaders() });
  }

  UpdateItem(updateObj:any)
  {
    return this.http.put(`${this.baseUrl}Update`,updateObj, { headers: this.tokenService.getRequestHeaders() });
  }
  DoneItem(doneObj:any)
  {
    return this.http.put(`${this.baseUrl}Opravljeno`,doneObj, { headers: this.tokenService.getRequestHeaders() });
  }

  NotDoneItem(NdoneObj:any)
  {
    return this.http.put(`${this.baseUrl}NiOpravljeno`,NdoneObj, { headers: this.tokenService.getRequestHeaders() });
  }

  getItemById(id: number) {
    return this.http.get(`${this.baseUrl}opravilo/` + id, { headers: this.tokenService.getRequestHeaders() });
  };
}