import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
@Component({
  selector: 'app-continue-shopping',
  templateUrl: './continue-shopping.component.html',
  styleUrls: ['./continue-shopping.component.css']
})
export class ContinueShoppingComponent implements OnInit {
  userName: any;
  cartProduct: any;
  cartTotalPrice: number = 0;
  cartProductLength: number = 0;
  price:number=0;
  constructor(private prodService: ProductsService,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.userName = window.localStorage.getItem('userName');
    this.getCart();

  }
  getCart() {
    let sub = this.prodService
      .getData(`${PATH.GET_CART}/${this.userName}`)
      .subscribe((res) => {
        this.cartProduct = res;
        for(var i=0;i<this.cartProduct.length;i++)
        { 
          if(this.cartProduct[i]['productImage']){
            this.getCartImages(i);
          }
          if(!this.cartProduct[i]['productImage']){
           this.cartProduct[i].productImage='../../assets/gray.png';
          }
         }
        this.calculateTotal();
        this.cartProductLength = this.cartProduct.length;
       
      });
  }

  getCartImages(count){
    let fileName=this.cartProduct[count]['productImage']
    let sub = this.prodService
    .downloadFile(fileName)
    .subscribe((res) => {
     this.cartProduct[count].productImage=res['payload']
    });
  }

  removeFromCart(itm) {
    let url = PATH.REMOVE_FROM_CART;
    let payload = { mrp: itm.mrp, productCode: itm.productCode, productImage: itm.productImage, productName: itm.productName, quantity: itm.quantity, userName: this.userName };
    this.prodService.postData(payload, url).subscribe(
      (res) => {
        this.cartProduct.splice(this.cartProduct.findIndex(a => a.id === itm.id), 1)
        this.cartProductLength = this.cartProduct.length;
        
        this.calculateTotal();
      },
      (err) => {
        }
    );
  }

  calculateTotal() {
    this.cartTotalPrice = 0;
    if (this.cartProduct.length == 0) {
      this.cartTotalPrice = 0;
    }
    else {
      for (var i = 0; i < this.cartProduct.length; i++) {
        this.cartTotalPrice = this.cartTotalPrice + this.cartProduct[i].mrp;
      }
    }


  }

}
