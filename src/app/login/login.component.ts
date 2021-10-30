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
  errorMessage:string="";
  userName: string;
  hasError: boolean
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.hasError = false;
  }
  signIn() {
    this.authService.login(this.user).subscribe((res) => {
      this.hasError = false;
      sessionStorage.setItem('amulyaToken',res.payload['token']);
      localStorage.setItem('userName', res.payload['username']);
      this.router.navigate(['dashboard']);
    },err=>{
      this.hasError = true;
      this.errorMessage=err.error;
    });
  }

  getUserName() {
    return this.userName;
  }
}
