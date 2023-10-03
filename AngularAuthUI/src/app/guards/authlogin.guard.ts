import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';

export const authloginGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const toast = inject(NgToastService)

  if(auth.isLoggedIn())
  {
    return true;
  }else
  toast.warning({detail:"OPOZORILO", summary:"Prvo se morate prijaviti, če se nimate računa pa se prvo registrirajte.", duration: 5000});
  router.navigate(['home']);
  return false;
};
