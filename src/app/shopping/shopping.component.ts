import { importType } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { windowToggle } from 'rxjs/operators';
import { REPLServer } from 'repl';
import { ActivatedRoute } from '@angular/router';
import { getMatScrollStrategyAlreadyAttachedError } from '@angular/cdk/overlay/scroll/scroll-strategy';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit {

  closeResult = '';
  product:any;
  productlist: Array<any> = [];
  allProductList: Array<any> = [];
  cartProduct: any;
  quantity:number;
  cartTotalPrice:number=0;
  isFound:boolean=false;
  productImage:any;
  currentPage = 1;
  itemsPerPage = 12;
  pageSize: number;
  totalElements='';
  noOfElements='';
  items: Array<any> = [];
  userName:any;
  collectionSize = 0;
  arrowCount:number=1;
  showArrow:boolean=true;
  categoryId=null;
  allproductListData=''; 
  allProducts: Array<any> = [];
  cartProductLength:number=0;
  categoryName='All Products';
  
  filterData = {
    fromBV: "",
    itemCategoryId: '',
    itemName: '',
    itemNumber: '',
    toBV: "",
    status:"ACTIVE"
  };

  constructor(private modalService: NgbModal,
              private prodService: ProductsService,
              private route: ActivatedRoute,
    ) {
  }
  
  ngOnInit(): void {
    this.quantity=1;
    this.userName=window.localStorage.getItem('userName');

    // this.getProductData();
    this.route.params.subscribe((res) => {
      if (res.categoryId) {
        // if(res.categoryName=='addToCartCart'){
        //   this.getCart();
        // }
        // else{
          this.categoryId=res.categoryId;
          this.categoryName=res.categoryName;
         this.filterData.itemCategoryId = res.categoryId;
         this.getProductListByCategory(res.categoryId,this.currentPage);
        // }
  
      }
      
      else {
        this.getProductList(this.currentPage);
      }
    });
    this.getCartData();
   
 
    
  }

    updatePageSize(){
      this.categoryId ? this.getProductListByCategory(this.categoryId,this.currentPage) :  this.getProductList(this.currentPage);
    }
    refreshPages(){
      this.categoryId ? this.getProductListByCategory(this.categoryId,this.currentPage) :    this.getProductList(this.currentPage);
    }

  getProductData(){
    this.product=[
      {id:1,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/Mask.PNG',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
      {id:2,title:'Zaravin Syrup-100ml with measuring cup',price:200,productImg:'../../assets/shopping/shoes.png',cartImg:'../../assets/add-to-cart.png',qty:1,cartStatus:'Add To Cart'},
    ]
  }

  arrowClick(itm){
    if(itm=='left')
    {
      if(this.arrowCount==0){
      }else
      {
        this.arrowCount=this.arrowCount-1;
      }  
    }
    if(itm=='right'){
      this.arrowCount=this.arrowCount+1;
    }
    this.categoryId ? this.getProductListByCategory(this.categoryId,this.arrowCount) :  this.getProductList(this.arrowCount);
  }

  getProductList(currentPage) {
    let sub = this.prodService
      .getData(`${PATH.PRODUCTS_ACTIVE}?page=${currentPage}&size=${this.itemsPerPage}&sort=${'createdDate'},${'desc'}`)
      .subscribe((res) => {
        this.productlist=res['content'];
        this.collectionSize = res['totalElements'];
        window.localStorage.setItem('ProductData',res['totalElements']);
        this.getAllProductList(this.currentPage);
        
        this.totalElements=res['totalElements'];
        this.noOfElements=res['numberOfElements'];
          for(var i=0;i<this.productlist.length;i++)
          {
            this.productlist[i].cartImg='../../assets/add-to-cart.png';
            this.productlist[i].cartStatus='Add To Cart';
            // this.productlist[i].noofQty=1;
           
            if(this.productlist[i]['image']){
              this.getProductImage(i);
            }
            if(!this.productlist[i]['image']){
             this.productlist[i].Image='../../assets/gray.png';
            }
            }
      });
    }
    getAllProductList(currentPage) {
      let productdata=window.localStorage.getItem('ProductData');
      let sub = this.prodService
        .getData(`${PATH.PRODUCTS_ACTIVE}?page=${currentPage}&size=${productdata}&sort=${'createdDate'},${'desc'}`)
        .subscribe((res) => {
        this.allProducts=res['content'];
           
        });
      }
    
    getProductListByCategory(catId,currentPage) {
    let sub = this.prodService
    .getData(`${PATH.PRODUCTS_FILTER_ACTIVE}/${this.filterData.itemCategoryId}?page=${currentPage}&size=${this.itemsPerPage}&sort=${'createdDate'},${'desc'}`)
    .subscribe((res) => {
     this.productlist=res['content'];
     this.getAllProductList(this.currentPage);
     this.collectionSize = res['totalElements'];
     this.totalElements=res['totalElements'];
     this.noOfElements=res['numberOfElements'];
       for(var i=0;i<this.productlist.length;i++)
       {
         this.productlist[i].cartImg='../../assets/add-to-cart.png';
         this.productlist[i].cartStatus='Add To Cart';
        //  this.productlist[i].noofQty=1;
        
         if(this.productlist[i]['image']){
           this.getProductImage(i);
         }
         if(!this.productlist[i]['image']){
          this.productlist[i].Image='../../assets/gray.png';
         }
        }
   });
  }

    getProductImage(count){
     
      let fileName=this.productlist[count]['image']
      let sub = this.prodService
      .downloadFile(fileName)
      .subscribe((res) => {
      //  this.productlist[count].productImage=res['payload']
       this.productlist[count].Image=res['payload'];
      });
    }

    getCartImages(count){
      let fileName=this.cartProduct[count]['productImage']
      let sub = this.prodService
      .downloadFile(fileName)
      .subscribe((res) => {
       this.cartProduct[count].Image=res['payload']
      });
    }
  
  addToCart(itm){ 
    this.isFound=false;
    // let addedCartItem = this.productlist.filter(element => this.cartProduct.includes(element));
    // addedCartItem.forEach(elm => {
    //   elm.cartStatus='GO To Cart';
    // })
    // this.modalService.addToCart(content);
    var locModal = document.getElementById('cartModal');
    locModal.style.display = "block"
    locModal.className="cartModal"; 
    let url = PATH.ADD_TO_CART;
    let payload={id:'',mrp:itm.mrp,productCode:itm.itemNumber,productImage:itm.image ? itm.image : '',productName:itm.itemName,quantity:1,userName:this.userName};
   
    this.prodService.updateData(`${PATH.ADD_TO_CART}`, payload).subscribe(
      (res) => {
        this.cartProduct=res;
        this.getCart();
        this.cartProductLength=this.cartProduct.length; 
      
        this.calculateTotal();
      },
      (err) => {
        this.getCart();
      }
    );
   }

   removefromCart(itm){
    let url = PATH.REMOVE_FROM_CART;
    let payload={mrp:itm.mrp,productCode:itm.productCode,productImage:itm.productImage,productName:itm.productName,quantity:itm.quantity,userName:this.userName};
    
    this.prodService.postData(payload, url).subscribe(
      (res) => {
        this.cartProduct.splice(this.cartProduct.findIndex(a => a.id === itm.id) , 1)     
        this.cartProductLength=this.cartProduct.length;
        // localStorage.setItem('cutData',JSON.stringify(this.cartProductLength));   
        //  this.cartTotalPrice=this.cartTotalPrice-itm.mrp;
        this.calculateTotal();
      },
      (err) => {
      }
    );
   }

   closeModal(){
    var locModal = document.getElementById('cartModal');
    locModal.style.display = "none"
    locModal.className="cartModal"; 
   }

   getCart(){
    var locModal = document.getElementById('cartModal');
    locModal.style.display = "block"
    locModal.className="cartModal"; 
    let sub = 
    this.prodService
    .getData(`${PATH.GET_CART}/${this.userName}`)
    .subscribe((res) => {
     this.cartProduct=res;
     this.cartProductLength=this.cartProduct.length;
     for(var i=0;i<this.cartProduct.length;i++)
     { 
       if(this.cartProduct[i]['productImage']){
         this.getCartImages(i);
       }
       if(!this.cartProduct[i]['productImage']){
        this.cartProduct[i].Image='../../assets/gray.png';
       }
      }
    //  localStorage.setItem('cutData',JSON.stringify(this.cartProductLength));   
        
     this.calculateTotal();
    });
   }

   getCartData(){
    let sub = this.prodService
    .getData(`${PATH.GET_CART}/${this.userName}`)
    .subscribe((res) => {
     this.cartProductLength=res['length'];
    });
   }

   calculateTotal()
   {
     this.cartTotalPrice=0;
     if(this.cartProduct.length==0){
       this.cartTotalPrice=0;
     }
     else{
        for(var i=0;i<this.cartProduct.length;i++)
        {
          this.cartTotalPrice=this.cartTotalPrice+this.cartProduct[i].mrp;
        }
     }
    

   }

   updateCart(payload){
    this.prodService.updateData(`${PATH.ADD_TO_CART}`, payload).subscribe(
      (res) => {
       this.getCart();
      },
      (err) => {
       this.getCart();
      }
    );
   }

  plus(col){
    for(var i=0;i<this.allProducts.length;i++){
      if(col.productCode==this.allProducts[i]['itemNumber']){
        if(col.quantity<5){
          col.quantity=col.quantity+1;
          for(var i=0;i<this.allProducts.length;i++){
            if(col.productCode==this.allProducts[i]['itemNumber']){
              col.mrp=col.mrp+this.allProducts[i]['mrp'];
            }
          }
          let payload={id:col.id,mrp:col.mrp,productCode:col.productCode,productImage:col.productImage,productName:col.productName,quantity:col.quantity,userName:this.userName};
          this.updateCart(payload);
          this.calculateTotal();
          //  this.productlist[i]['noofQty']=col.noofQty;
          //  this.cartTotalPrice=this.cartTotalPrice+col.mrp;
          }
        }
    }
   }

  minus(col){
    for(var i=0;i<this.allProducts.length;i++){
      if(col.productCode==this.allProducts[i]['itemNumber']){
        if(col.quantity>1){
          for(var i=0;i<this.allProducts.length;i++){
            if(col.productCode==this.allProducts[i]['itemNumber']){
              col.mrp=col.mrp-this.allProducts[i]['mrp'];
            }
          }
          col.quantity=col.quantity-1;
  
          let payload={id:col.id,mrp:col.mrp,productCode:col.productCode,productImage:col.productImage,productName:col.productName,quantity:col.quantity,userName:this.userName};
          this.updateCart(payload);
          this.calculateTotal();
          //  this.cartTotalPrice=this.cartTotalPrice-col.mrp;
          //  this.productlist[i]['noofQty']=col.noofQty;
        }
      }
    }
  }

}
