import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  user: any = { username: '', password: '' };
  passwordType: string = 'password';
  errorMessage: string = "";
  userName: string;
  hasError: boolean
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.hasError = false;
    if (sessionStorage.getItem('amulyaToken')) {
      if  (localStorage.getItem('roles') == "DISTRIBUTOR") {
        this.router.navigate(['shopping']);
      }
      else {this.router.navigate(['dashboard']);}
    }
    else {
      this.router.navigate(['login']);
    }
    
  }
  signIn() {
    this.authService.login(this.user).subscribe((res) => {
      console.log("token", res);
      this.hasError = false;
      sessionStorage.setItem('amulyaToken', res.payload['token']);
      localStorage.setItem('userName', res.payload['username']);
      localStorage.setItem('roles', JSON.stringify(res.payload['roles']));
      let userValidate = res.payload['roles'];
      console.log("userValidate", userValidate.length);
      for (var i = 0; i < userValidate.length; i++) {
        if (userValidate[i] == 'DISTRIBUTOR') {
          this.router.navigate(['shopping']);
        }
        else {
          this.router.navigate(['dashboard']);
        }
      }

    }, err => {
      this.hasError = true;
      this.errorMessage = err.error;
    });
  }

  getUserName() {
    return this.userName;
  }
}
