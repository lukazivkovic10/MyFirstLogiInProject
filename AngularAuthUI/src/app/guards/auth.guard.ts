import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { NgToastComponent, NgToastService } from 'ng-angular-popup';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const toast = inject(NgToastService)

  if(auth.isLoggedIn())
  {
    toast.error({detail:"NAPAKA", summary:"Ste že prijavljeni!", duration: 5000});
    router.navigate(['home']);
    return true;
  }else
  return false;
};
