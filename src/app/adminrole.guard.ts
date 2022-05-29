import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree ,Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminroleGuard implements CanActivate {
  constructor(private router: Router) { }
  canActivate(){
    let userValidate = JSON.parse(window.localStorage.getItem('roles'));
    for (var i = 0; i < userValidate.length; i++) {
      if (userValidate[i] == 'DISTRIBUTOR') {
        let url=window.location.href;
        if(window.location.href.indexOf("shopping") > -1){
          return true;
        }
        else if(url.endsWith('/login')){
          return true;
        }
        else
        {
          this.router.navigate(['unauthorized']);
        }
      } 
      else {
        this.router.navigate(['dashboard']);
        // this.router.navigate(['unauthorized']);
        
      }
    }  
  }
  
}
