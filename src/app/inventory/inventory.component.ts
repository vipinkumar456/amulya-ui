import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PATH } from '../constants';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  productList: Array<any> = [];
  warehouses: Array<any> = [];
  productsPage: number = 1;
  totalPages: number = 10;
  productListCopy: any = [];
  filter: any = { product: '', location: '' };

  page = 0;
  pageSize = 10;
  collectionSize = 0;
  inventoryList: Array<any> = [];
  headers = [
    {
      title: 'AMULYA CODE',
      name: 'itemNumber',
      isAsc: true,
      showSort:true
    },
    {
      title: 'PRODUCT',
      name: 'itemName',
      isAsc: true,
      showSort:true
    },
    {
      title: 'QTY AVAILABLE',
      name: 'availableQuantity',
      isAsc: true,
      showSort:true
    },
  ];
  firstLevelHeader: Array<any> = [
    { name: 'wareHouse', title: 'Branch Name' },
    { name: 'availableQuantity', title: 'QTY Available(in Box)' },
  ];
  subHeaders: Array<any> = [
    { name: 'lotNumber', title: 'Batch Number' },
    { name: 'expiryDate', title: 'Exp Date' },
    { name: 'totalInStock', title: 'Total In' },
    { name: 'totalOutStock', title: 'Total Out' },
    { name: 'availableQuantity', title: 'Avail Qty' },
  ];
  @ViewChild('viewBtn') viewBtn: ElementRef<HTMLElement>;
  subscriptions: Subscription;
  constructor(private prodService: ProductsService) {
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.getProducts(500);
    this.getLocations();
    this.viewOnHand()
  }
  getLocations() {
    this.prodService.getData(PATH.WAREHOUSE).subscribe(
      (res: any) => {
        this.warehouses = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getProducts(size) {
    let subscription = this.prodService
      .getData(PATH.PRODUCTS_ACTIVE + '?page=' + this.productsPage + '&size=' + size)
      .subscribe(
        (res) => {
          // console.log(res['content']);
          res['content'].map((i) => { i.fullName = i.itemNumber + ' - ' + i.itemName; return i; });
          this.productList = res['content'];
          this.totalPages = res['totalPages'];
          this.productListCopy.push(...res['content']);
          // console.log(this.productList);
          this.subscriptions.add(subscription);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  updatePageSize() {
    
  }

  customSearchFn(term: string, item: any) {
    term = term.toLocaleLowerCase();
    return (
      item.itemNumber.toLocaleLowerCase().indexOf(term) > -1 ||
      item.itemName.toLocaleLowerCase().indexOf(term) > -1 ||
      (item.itemNumber + ' - ' + item.itemName).toLocaleLowerCase().indexOf(term) > -1
    );
  }
  onScroll() {
    this.productsPage = this.productsPage + 1;
    if (this.productsPage <= this.totalPages) {
      this.getProducts(50);
    }
  }
  getByWarehouse() {
    this.prodService
      .getData(
        `${PATH.ONHAND_PARAMETERS}?&page=${this.page}&size=${this.pageSize}&wareHouse=${this.filter.location}`
      )
      .subscribe(
        (res: any) => {
          this.inventoryList = res['content'];
          this.totalPages = res['totalPages'];
        },
        (err) => {
          console.log(err);
        }
      );
  }
  viewOnHand() {
    let dt = this.filter;
    let url = dt.location && dt.product
      ? `${PATH.ONHAND_PARAMETERS}?itemNumber=${dt.product}&page=${this.page}&size=${this.pageSize}&wareHouse=${dt.location}`
      : dt.location
      ? `${PATH.ONHAND_PARAMETERS}?page=${this.page}&size=${this.pageSize}&wareHouse=${dt.location}`
      : dt.product
      ? `${PATH.ONHAND_PARAMETERS}?itemNumber=${dt.product}&page=${this.page}&size=${this.pageSize}`
      : `${PATH.ONHAND_PARAMETERS}?page=${this.page}&size=${this.pageSize}`;
    this.prodService.getData(url).subscribe(
      (res: any) => {
        this.inventoryList = res['content'];
        this.totalPages = res['totalPages'];
        this.collectionSize = res['totalElements'];
      },
      (err) => {
        console.log(err);
      }
    );
  }
  refreshPages() {
    this.viewBtn.nativeElement.click();
  }
  firstLevel(inventory){
    if(!inventory.branchDetails){
      let url = this.filter.location
      ? `${PATH.ONHAND_FIRSTLEVEL}?itemNumber=${inventory.itemNumber}&wareHouse=${this.filter.location}`
      :`${PATH.ONHAND_FIRSTLEVEL}?itemNumber=${inventory.itemNumber}`;
      this.prodService
      .getData(url)
      .subscribe(
        (res: any) => {
          inventory.branchDetails = res.content;
          console.log(inventory)
        },
        (err) => {
          console.log(err);
        }
      );
    }else{
      delete  inventory.branchDetails
    }
  }

  expand(branch) {
    if(!branch.subInventory){
      this.prodService
        .getData(
          `${PATH.ONHAND_DETAILED}?itemNumber=${branch.itemNumber}&wareHouse=${branch.wareHouse}`
        )
        .subscribe(
          (res: any) => {
            branch.subInventory = res;
          },
          (err) => {
            console.log(err);
          }
        );
    }else{
      delete branch.subInventory
    }
  }
}
