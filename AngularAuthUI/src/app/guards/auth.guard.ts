import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const toast = inject(NgToastService)

  if(auth.isLoggedIn())
  {
    toast.warning({detail:"OPOZORILO", summary:"Ste že prijavljeni, če se želite znova prijaviti se prvo odjavite.", duration: 5000});
    router.navigate(['home']);
    return false;
  }else
  return true;
};
