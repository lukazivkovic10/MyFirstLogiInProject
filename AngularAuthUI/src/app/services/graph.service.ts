import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private baseUrl:string = "https://localhost:7023/api/Graph/"
  constructor(private http : HttpClient, private router: Router) { }

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
