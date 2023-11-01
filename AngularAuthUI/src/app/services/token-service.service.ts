import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenServiceService {
  private jwtToken: string | null = null;

  setToken(token: string) {
    this.jwtToken = token;
    localStorage.setItem('token', token); // Save the token to localStorage
  }

  getToken(): string | null {
    if (!this.jwtToken) {
      this.jwtToken = localStorage.getItem('token'); // Retrieve the token from localStorage
    }
    return this.jwtToken;
  }

  getRequestHeaders(): HttpHeaders {
    this.getToken();
    if (this.jwtToken) {
      return new HttpHeaders({
        'Authorization': `Bearer ${this.jwtToken}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
}
