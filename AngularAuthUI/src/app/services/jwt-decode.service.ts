import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtDecodeService {
  decodeToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  userEmail(): string {
    const jwtToken = localStorage.getItem('token');

    if (jwtToken) {
      // Decode the JWT token to extract user information
      const decodedToken = this.decodeToken(jwtToken);

      // Extract the email (assuming email is stored in the 'email' claim of the JWT)
      const userEmail = decodedToken?.email;

      return userEmail || '';
    } else {
      console.error('JWT token not found in local storage.');
      return '';
    }
  }
}
