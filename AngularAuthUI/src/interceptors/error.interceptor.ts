import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError  } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: NgToastService, private router: Router) {}

  helper = new JwtHelperService();

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token'); // Get the JWT token from local storage

    if (token) {
      // Check the token expiration here and log the user out if it's expired
      const tokenExpired = this.helper.isTokenExpired(token);
      if (tokenExpired) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        this.showInfoToast();
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
          this.showInfoToast();
        }
        return throwError(error);
      })
    );
  }

  private showInfoToast() {
    this.toast.info({detail: 'ODJAVA', summary: 'Seja je potekla in ste bili odjavljeni. Prosimo da se znova prijavite.', duration: 3500 });
  }
}
