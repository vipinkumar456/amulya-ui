import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html'
})
export class PurchasesComponent implements OnInit {
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  purchases = [];
  col: any = 'orderDate';
  order: any = 'desc';
  headers: Array<any> = [
    { name: 'orderDate', title: 'Date', sort: true },
    { name: 'purchaseOrderCode', title: 'Purchase Order', sort: true },
    { name: 'vendorName', title: 'Vendor Name', sort: true },
    { name: 'createdBy', title: 'Created By', sort: true },
    { name: 'totalAmount', title: 'Total Amount', sort: true },
    { name: 'dueDate', title: 'Due Date', sort: true },
    { name: 'status', title: 'Status', sort: true },
    { name: 'actions', title: '', sort: false },
  ];
  @HostListener('document:click')
  clickout() {
    this.purchases.map((o) => {
      o.showMenu = false;
    });
  }
  type: any = null;
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getPurchaseOrders(this.col, this.order);
  }

  /**
   * API call to get purchase orders list list
   */
  getPurchaseOrders(col, order) {
    // API CALL HERE
    this.prodService
      .getData(
        `${PATH.PURCHASES}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`
      )
      .subscribe(
        (res) => {
          this.purchases = res['content'];
          console.log(this.purchases);
          this.collectionSize = res['totalElements'];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  sortBy(col, details) {
    let order = '';
    order = details.isAsc ? 'asc' : 'desc';
    this.prodService
      .getData(
        `${PATH.PURCHASES}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`
      )
      .subscribe(
        (res) => {
          details.isAsc = !details.isAsc;
          this.purchases = res['content'];
          this.collectionSize = res['totalElements'];
        },
        (err) => {
          console.log(err);
        }
      );
  }
  updatePageSize() {
    this.getPurchaseOrders(this.col, this.order);
  }

  /**
   * Show or hide menu for each row
   */
  showOptions(e, purchase) {
    e.stopPropagation();
    this.purchases.map((o) => {
      o.showMenu = false;
    });
    if (purchase.status == 'CLOSED' || purchase.status == 'CANCELLED') {
      return false;
    }

    purchase['showMenu'] = !purchase['showMenu'];
  }

  /**
   * Pagination call to get the page wise data
   */
  refreshPages() {
    this.getPurchaseOrders(this.col, this.order);
  }

  /**
   * Delete a purchase order
   */

  deletePurchase(purchase) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'purchases';
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

  cancelPurchase(purchase) {
    this.type = 'cancel';
    let payload = { ...purchase };
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'cancelPO';
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
              this.toastService.show(
                'Purchase order cancelled successfully !!',
                { classname: 'amulyaGreen text-light', delay: 10000 }
              );
              this.getPurchaseOrders(this.col, this.order);
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
