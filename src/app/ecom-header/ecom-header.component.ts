import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PATH } from '../constants';
import { AuthService } from '../services/auth.service';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-ecom-header',
  templateUrl: './ecom-header.component.html',
  styleUrls: ['./ecom-header.component.css']
})
export class EcomHeaderComponent implements OnInit {

  constructor(
    private cartServices: ProductsService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    
  ) {

  }
 
  searchForm: FormGroup;
  userName: any;
  hideSearch:boolean=false;
  shoppingHead:boolean=false;
  public totalItem:number =0;
 
  ngOnInit(): void {
    this.cartServices.getProductLength().subscribe
    (res=>{
      this.totalItem = res.length;
    })
  
    // this.cartProductLength = JSON.parse(localStorage.getItem('cutData')); 
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
function payload(arg0: string, payload: any) {
  throw new Error('Function not implemented.');
}

function getCart() {
  throw new Error('Function not implemented.');
}

