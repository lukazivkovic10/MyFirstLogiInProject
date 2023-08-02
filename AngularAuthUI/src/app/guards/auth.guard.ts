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
    return true;
  }else
  toast.error({detail:"NAPAKA", summary:"Prosim prijavite se prvo", duration: 5000});
  router.navigate(['login']);
  return false;
};
