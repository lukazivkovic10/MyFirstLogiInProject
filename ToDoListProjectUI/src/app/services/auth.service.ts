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

  SearchItem(ItemTag:string)
  {
    return this.http.get(`${this.baseUrl}IskanjeLista`+ItemTag.search);
  }

  CreateItem(createObj:any)
  {
    return this.http.post(`${this.baseUrl}Ustvarjanje`,createObj);
  }

  UpdateItem(updateObj:any)
  {
    return this.http.put(`${this.baseUrl}Update`,updateObj);
  }

  DeleteItem(deleteObj:any)
  {
    return this.http.delete(`${this.baseUrl}SoftDelete`+deleteObj.ItemName);
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
