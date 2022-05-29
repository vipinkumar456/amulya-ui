import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private _location: Location) { }

  canActivate() {
    let userValidate = JSON.parse(window.localStorage.getItem('roles'));
    for (var i = 0; i < userValidate.length; i++) {
      if (userValidate[i] == 'DISTRIBUTOR') {
        this.router.navigate(['shopping']);
      
      } 
      else {
    // return    this.router.navigate(['unauthorized']);
        return true;
        
      }
    }

  }

}
