import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { PATH } from "../constants";
import { SERVER_PATHS } from "../constants";
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userDetails = [];
  constructor(private http: HttpClient) { }
  // SignIn
  login(data): Observable<any> {
    let API_URL = `${SERVER_PATHS.DEV}${PATH.SIGN_IN}`;
    return this.http.post(API_URL, data)
      .pipe(
        catchError(this.error)
      )
  }

  // Handle Errors 
  error(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // console.log(errorMessage);
    return throwError(error.error?error.error:errorMessage);
  }
}
