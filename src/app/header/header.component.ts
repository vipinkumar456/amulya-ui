import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}
  searchForm: FormGroup;
  userName: any;
  hideSearch:boolean=false;
  shoppingHead:boolean=false;
  ngOnInit(): void {
    let url=window.location.href;
   
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if(event.url==="/category"|| event.url==="/list"){
          this.hideSearch=true;
          // this.shoppingHead=false;
        }
           
     
    }
    });
    let userValidate=JSON.parse(window.localStorage.getItem('roles'));
    for(var i=0;i<userValidate.length;i++){
      if(userValidate[i]=='DISTRIBUTOR'){
        this.shoppingHead=true;
      }
      else
      {
        this.shoppingHead=false;
      }
    }   
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.userName = localStorage.getItem('userName');
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['login']);
  }
}
