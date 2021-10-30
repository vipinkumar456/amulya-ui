import { importType } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit {

  closeResult = '';
  product:any;
  cartProduct: Array<any> = [];
  quantity:number;
  cartTotalPrice:number=0;
  isFound:boolean=false;
  
  currentPage = 1;
  itemsPerPage = 12;
  pageSize: number;
  items: Array<any> = [];
  constructor(private modalService: NgbModal) {
  
  }

  
  ngOnInit(): void {
    this.quantity=1;
    this.getProductData();
    

  }
  onPageChange(pageNum: number): void {

    this.pageSize = this.itemsPerPage*(pageNum - 1);
    
    }

  getProductData(){
    this.product=[
      {id:1,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:2,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/menshirt.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:3,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/clothes.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:4,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:5,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:6,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/menshirt.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:7,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/clothes.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:8,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:9,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:10,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/menshirt.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:11,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/clothes.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:12,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:13,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:14,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/menshirt.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:15,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/clothes.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:16,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:17,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:18,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/menshirt.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:19,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/clothes.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:20,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:21,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:22,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/menshirt.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:23,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/clothes.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:24,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:25,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'}
    ]
  }

  
  open(itm){  
    console.log(this.cartProduct);
    this.isFound=false;
    if(this.cartProduct.length==0){
      this.cartProduct.push(itm);
    this.cartTotalPrice=this.cartTotalPrice+itm.price;
    }
    else{
      for(var i=0;i<this.cartProduct.length;i++){
        if(this.cartProduct[i]['id']==itm.id){
          this.isFound=true;
        }
      }
      if(!this.isFound){
        this.cartProduct.push(itm);
        this.cartTotalPrice=this.cartTotalPrice+itm.price;
      }
    }
    let addedCartItem = this.product.filter(element => this.cartProduct.includes(element));
    addedCartItem.forEach(elm => {
      elm.cartStatus='GO To Cart';
    })
   
    // this.modalService.open(content);
    var locModal = document.getElementById('cartModal');
    locModal.style.display = "block"
    locModal.className="cartModal"; 
   }

   closeModal(){
    var locModal = document.getElementById('cartModal');
    locModal.style.display = "none"
    locModal.className="cartModal"; 
   }

  // i=1;
  plus(col){
    // if(this.i!=5){
    //   this.i++;
    //   this.quantity=this.i;
    // }
     console.log(col)
    for(var i=0;i<this.product.length;i++){
      if(col.id==this.product[i]['id']){
        if(col.qty<5){
          col.qty=col.qty+1;
          this.product[i]['qty']=col.qty;
          this.cartTotalPrice=this.cartTotalPrice+col.price;
          }
        }
    }
   }

  minus(col){
    // if(this.i>1){
    //   this.i--;
    //   this.quantity=this.i;
    // }
    for(var i=0;i<this.product.length;i++){
      if(col.id==this.product[i]['id']){
        if(col.qty>1){
          col.qty=col.qty-1;
          this.cartTotalPrice=this.cartTotalPrice-col.price;
          this.product[i]['qty']=col.qty;
        }
      }
    }
  }

}
