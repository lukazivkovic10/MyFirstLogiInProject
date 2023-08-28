import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  constructor() { }

  private readonly encryptionKey = 'EncryptionKey';

  encrypt(password: string): string {
    const encryptedPassword = btoa(encodeURIComponent(password + this.encryptionKey));
    return encryptedPassword;
  }
}
