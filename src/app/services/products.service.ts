import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, subscribeOn, map } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { PATH } from '../constants';
import { SERVER_PATHS } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}
  // Create
  postData(data, task): Observable<any> {
    let API_URL = `${SERVER_PATHS.DEV}${task}`;
    return this.http.post(API_URL, data).pipe(catchError(this.error));
  }

  // Read
  getData(path) {
    return this.http.get(decodeURI(`${SERVER_PATHS.DEV}${path}`));
  }
  // Read
  getDataWithParams(path, data?): Observable<any> {
    let httpParams = new HttpParams();
    if (data) {
      Object.keys(data).forEach(function (key) {
        // data[key]=data[key].replace("+","%2B")
        httpParams = httpParams.append(key, data[key]);
      });
    }
    console.log(httpParams);
    return this.http.get(encodeURI(`${SERVER_PATHS.DEV}${path}`), {
      params: httpParams,
    });
  }

  // Update
  updateData(url, data): Observable<any> {
    let API_URL = `${SERVER_PATHS.DEV}${url}`;
    return this.http
      .put(API_URL, data, { headers: this.headers })
      .pipe(catchError(this.error));
  }

  // Update
  patchData(url, data): Observable<any> {
    let API_URL = `${SERVER_PATHS.DEV}${url}`;
    return this.http
      .patch(API_URL, data, { headers: this.headers })
      .pipe(catchError(this.error));
  }

  markInactive(url): Observable<any> {
    let API_URL = `${SERVER_PATHS.DEV}${url}`;
    return this.http
      .put(API_URL, {}, { headers: this.headers })
      .pipe(catchError(this.error));
  }

  // Delete
  deleteData(id): Observable<any> {
    var API_URL = `${SERVER_PATHS.DEV}/delete-task/${id}`;
    return this.http.delete(API_URL).pipe(catchError(this.error));
  }
  uploadFile(data, url?) {
    let API_URL = 'https://amulya-api.el.r.appspot.com/api/v1/files/upload';
    return this.http.post(API_URL, data).pipe(catchError(this.error));
  }
  downloadFile(filename) {
    let API_URL =
      'https://amulya-api.el.r.appspot.com/api/v1/files/get?objectName=' +
      filename;
    return this.http.get(API_URL).pipe(catchError(this.error));
  }
  // Handle Errors
  error(error: HttpErrorResponse) {
    if (typeof error == 'string') {
      return throwError(error)
    } else {
      let errorMessage = {};
      if (error.error instanceof ErrorEvent) {
        errorMessage = error.message;
      } else {
        errorMessage = { code: error.status, message: error.message };
      }
      // console.log(errorMessage);
      return throwError(errorMessage);
    }
  }
}
