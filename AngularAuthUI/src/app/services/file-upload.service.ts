import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl:string = "https://localhost:7023/api/FileUpload/"
  constructor(private http : HttpClient, private router: Router) { }

  GetAllFiles()
  {
    return this.http.get<any>(`${this.baseUrl}GetAllFiles`);
  }

  Upload(formData: FormData)
  {
    return this.http.post<any>(`${this.baseUrl}Upload`, formData);
  }

  DownloadFile(id: number) {
    return this.http.get(`${this.baseUrl}DownloadFile/${id}`, {
      responseType: 'blob' // Set the response type to 'blob' for binary data
    });
  }

}
