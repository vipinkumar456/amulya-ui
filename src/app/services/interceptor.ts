import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
@Injectable()
export class AppInterceptor implements HttpInterceptor {

  constructor(private router: Router,private spinnerService:NgxSpinnerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq = req;
    const token = sessionStorage.getItem('amulyaToken');
    this.spinnerService.show()
    if (token != null) {
      authReq = req.clone({
        url: req.url,
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(authReq).pipe(catchError(err => {
      if (err.status === 401) {
        this.router.navigate(['/login']); sessionStorage.removeItem('amulyaToken')
      }
      const error = err.error.message || err.statusText; return throwError(error);
      
    }),finalize(() => this.spinnerService.hide()));
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }
];