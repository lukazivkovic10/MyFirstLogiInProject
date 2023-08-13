import { Injectable } from '@angular/core';
//import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  constructor() { }

  //async hashPassword(password: string): Promise<string> {
  //  const saltRounds = 12;
  //  const salt = await bcrypt.genSalt(saltRounds);
  //  const hashedPassword = await bcrypt.hash(password, salt);
  //
  //}

  //async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  //  return await bcrypt.compare(password, hashedPassword);
  //}
}
