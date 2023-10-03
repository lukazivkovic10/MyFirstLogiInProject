import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private baseUrl:string = "https://localhost:7023/api/List/"
  constructor(private http : HttpClient, private router: Router) { }

  DeleteItem(deleteObj:any)
  {
    return this.http.delete(`${this.baseUrl}SoftDelete`+deleteObj.ItemName);
  }

  GetAllItems(page: number, pageSize: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    return this.http.get(`${this.baseUrl}IskanjeListaVseh`, { params });
  }

  GetAllDoneItems()
  {
    return this.http.get(`${this.baseUrl}PrikazOpravljenih`);
  }

  SearchItem(ItemTag:string)
  {
    return this.http.get(`${this.baseUrl}IskanjeLista/`+ItemTag.search);
  }

  CreateItem(createObj:any)
  {
    return this.http.post(`${this.baseUrl}Ustvarjanje`, createObj);
  }

  UpdateItem(updateObj:any)
  {
    return this.http.put(`${this.baseUrl}Update`,updateObj);
  }
  
  UpdateItemDate(updateObj:any)
  {
    return this.http.put(`${this.baseUrl}UpdateDate`,updateObj);
  }

  UpdateItemStatus(updateObj:any)
  {
    return this.http.put(`${this.baseUrl}UpdateStatus`,updateObj);
  }
  DoneItem(doneObj:any)
  {
    return this.http.put(`${this.baseUrl}Opravljeno`,doneObj);
  }

  NotDoneItem(NdoneObj:any)
  {
    return this.http.put(`${this.baseUrl}NiOpravljeno`,NdoneObj);
  }
}