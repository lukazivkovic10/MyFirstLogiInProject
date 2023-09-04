import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TagsService {

  private baseUrl:string = "https://localhost:7023/api/Tag/"
  constructor(private http : HttpClient, private router: Router) { }

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
