import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private baseUrl:string = environment.apiUrl;
  constructor(private http : HttpClient, private router: Router) { }

  NumberOfAllTasks()
  {
    return this.http.get<any>(`${this.baseUrl}ŠtVsehOpravil`);
  }

  StackedData()
  {
    return this.http.get<any>(`${this.baseUrl}GraphOpravila`);
  }

  PercentageData()
  {
    return this.http.get<any>(`${this.baseUrl}Procenti`);
  }

  TimelineData()
  {
    return this.http.get<any>(`${this.baseUrl}Top10List`);
  }
}
