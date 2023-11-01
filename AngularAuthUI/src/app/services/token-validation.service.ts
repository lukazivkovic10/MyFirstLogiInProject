import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {

  constructor() { }

  isTokenValid(token: string): boolean {
    try {
      const decodedToken = jwt_decode(token) as { exp: number };

      if (decodedToken && decodedToken.exp) {
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        return decodedToken.exp > currentTime;
      } else {
        // 'exp' is not present in the token; consider it as invalid
        return false;
      }
    } catch (error) {
      // Handle token decoding errors (e.g., invalid token format)
      return false;
    }
  }
}
