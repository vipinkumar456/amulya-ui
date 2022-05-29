import { Component, OnInit } from '@angular/core';
import { PATH } from '../constants';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-ecom-sidenav',
  templateUrl: './ecom-sidenav.component.html',
  styleUrls: ['./ecom-sidenav.component.css']
})
export class EcomSidenavComponent implements OnInit {

 
  showList: boolean;
  showShopping:boolean=false;
  categories = [];
  constructor(
    private prodService: ProductsService,
  ) { }

  ngOnInit(): void {
    this.showList = false;
    let userValidate=JSON.parse(window.localStorage.getItem('roles'));
    for(var i=0;i<userValidate.length;i++){
      if(userValidate[i]=='DISTRIBUTOR'){
        this.showShopping=true;
        this.getCategory();
      }
      else
      {
        this.showShopping=false;
      }
    }
  }
  showSubNav() {
    this.showList = !this.showList;
  }
  getCategory(){
  let sub3 = this.prodService.getData(`${PATH.CATEGORIES}`).subscribe(
    (res) => {
      
      this.categories = res['productCategories'];
      },
    (err) => {
    }
  );
 }

}
