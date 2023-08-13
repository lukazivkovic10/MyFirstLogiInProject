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

  DeleteItem(deleteObj:any)
  {
    return this.http.delete(`${this.baseUrl}SoftDelete`+deleteObj.ItemName);
  }

  GetAllItems()
  {
    return this.http.get(`${this.baseUrl}IskanjeListaVseh`);
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

  GetTags()
  {
    return this.http.get(`${this.baseUrl}VseTags`);
  }

  CreateTags(createObj: any)
  {
    return this.http.post(`${this.baseUrl}UstvarjanjeTag`, createObj);
  }
  
  DeleteTag(DeleteTagObj: any)
  {
    return this.http.put(`${this.baseUrl}IzbrisTag`,DeleteTagObj);
  }
}
