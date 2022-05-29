import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

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
      console.log(this.categories);
    },
    (err) => {
      console.log('Unable to get categories');
    }
  );
 }
}
