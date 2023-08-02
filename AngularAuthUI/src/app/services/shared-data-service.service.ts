import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private searchResultSubject = new BehaviorSubject<any>(null);
  public searchResult$ = this.searchResultSubject.asObservable();

  updateSearchResult(result: any) {
    this.searchResultSubject.next(result);
  }
}