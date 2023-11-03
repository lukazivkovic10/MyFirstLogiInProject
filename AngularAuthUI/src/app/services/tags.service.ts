import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenServiceService } from './token-service.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagsService {

  private baseUrl:string = environment.apiUrl;
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }

  GetTags()
  {
    return this.http.get(`${this.baseUrl}VseTags`, { headers: this.tokenService.getRequestHeaders() });
  }

  CreateTags(createObj: any)
  {
    return this.http.post(`${this.baseUrl}UstvarjanjeTag`, createObj, { headers: this.tokenService.getRequestHeaders() });
  }
  
  DeleteTag(DeleteTagObj: any)
  {
    return this.http.put(`${this.baseUrl}IzbrisTag`,DeleteTagObj, { headers: this.tokenService.getRequestHeaders() });
  }
}
