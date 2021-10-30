import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html'
})
export class SalesListComponent implements OnInit {
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  sales = [];
  col: any = 'createdDate';
  order: any = 'desc';
  header = [
    {
      name: 'DATE',
      APIname: 'createdDate',
      isAsc: true,
      showSort:true
    },
    {
      name: 'SALES ORDER#',
      APIname: 'salesOrderCode',
      isAsc: true,
      showSort:true
    },
    {
      name: 'CUSTOMER NAME',
      APIname: 'customerName',
      isAsc: true,
      showSort:true
    },
    {
      name: 'CREATED BY',
      APIname: 'createdBy',
      isAsc: true,
      showSort:true
    },
    {
      name: 'AMOUNT',
      APIname: 'totalAmount',
      isAsc: true,
      showSort:true
    },
    {
      name: 'DUE DATE',
      APIname: 'expectedShipmentDate',
      isAsc: true,
      showSort:true
    },
    {
      name: 'STATUS',
      APIname: 'status',
      isAsc: true,
      showSort:true
    },
  ];
  @HostListener('document:click')
  clickout() {
    this.sales.map((o) => {
      o.showMenu = false;
    });
  }
  type: any = null;
  constructor(
    private prodService: ProductsService,
    public toastService: ToastService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getsaleOrders(this.col, this.order);
  }

  /**
   * API call to get sale orders list list
   */
  getsaleOrders(col,order) {
    // API CALL HERE
    this.prodService
      .getData(`${PATH.SALES}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`)
      .subscribe(
        (res) => {
          this.sales = res['content'];
          console.log(this.sales);
          this.collectionSize = res['totalElements'];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  sortBy(type,details) {
    let order = '';
    order = details.isAsc ? 'asc' : 'desc';
   
    this.prodService
      .getData(
        `${PATH.SALES}?page=${this.page}&size=${this.pageSize}&sort=${type},${order}`
      )
      .subscribe(
        (res) => {
          details.isAsc = !details.isAsc;
          this.sales = res['content'];
          console.log(this.sales);
          // this.transactions = res['content'];
        },
        (err) => {
          console.log(err);
        }
      );
  }
  updatePageSize() {
    this.getsaleOrders(this.col, this.order);
  }

  /**
   * Show or hide menu for each row
   */
  showOptions(e, sale) {
    e.stopPropagation();
    this.sales.map((o) => {
      o.showMenu = false;
    });
    if (sale.status == 'CLOSED' || sale.status == 'CANCELLED') {
      return false;
    }

    sale['showMenu'] = !sale['showMenu'];
  }

  /**
   * Pagination call to get the page wise data
   */
  refreshPages() {
    this.getsaleOrders(this.col, this.order);
  }

  editsale(sale) {
    this.router.navigate(['sale', 'edit', sale.id]);
  }

  /**
   * Delete a sale order
   */

  deletesale(sale) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'Sales';
    modalRef.componentInstance.type = 'confirmation';
    modalRef.componentInstance.componentData = [
      {
        name: '',
        desc: '',
        code: '',
      },
    ];
    modalRef.componentInstance.err = { showerror: false, errMsg: '' };
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      modalRef.close();
    });
  }

  recieveSaleOrder(sale) {
    this.router.navigate(['sale', 'receive', sale.id]);
  }
  cancelsale(sale) {
    this.type = 'cancel';
    let payload = { ...sale };
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'cancel SO';
    modalRef.componentInstance.confirmCancel = true;
    // modalRef.componentInstance.componentData = [{
    //   name: '', desc: '', code: ''
    // }];
    // modalRef.componentInstance.err = { showerror: false, errMsg: '' }
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      // console.log(receivedEntry)
      payload.cancelReason = receivedEntry.reason;
      payload.comments = receivedEntry.comments;
      if (receivedEntry) {
        payload['status'] = 'CANCELLED';
        // console.log(receivedEntry)
        this.prodService
          .updateData(`${PATH.PURCHASES}/${payload.id}`, payload)
          .subscribe(
            (res) => {
              this.toastService.show('sale order cancelled successfully !!', {
                classname: 'amulyaGreen text-light',
                delay: 10000,
              });
              this.getsaleOrders(this.col, this.order);
            },
            (err) => {
              // console.log(err);
              this.toastService.show(err.message, {
                classname: 'bg-danger text-light',
                delay: 10000,
              });
            }
          );
      } else {
      }
      modalRef.close();
    });
  }
  
}
