import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenServiceService } from './token-service.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl:string = environment.apiUrl+'FileUpload/';
  constructor(private http : HttpClient, private router: Router, private tokenService: TokenServiceService) { }

  GetAllFiles()
  {
    return this.http.get<any>(`${this.baseUrl}GetAllFiles`, { headers: this.tokenService.getRequestHeaders() });
  }

  Upload(formData: FormData)
  {
    return this.http.post<any>(`${this.baseUrl}Upload`, formData, { headers: this.tokenService.getRequestHeaders() });
  }

  DownloadFile(id: number) {
    return this.http.get(`${this.baseUrl}DownloadFile/${id}`, {
      responseType: 'blob', // Set the response type to 'blob' for binary data
      headers: this.tokenService.getRequestHeaders()
    });
  }

}
