import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PATH } from 'src/app/constants';
import { ProductModalComponent } from 'src/app/product-modal/product-modal.component';
import { ProductsService } from 'src/app/services/products.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-quality-check-list',
  templateUrl: './quality-check-list.component.html'
})
export class QualityCheckListComponent implements OnInit {

  page = 1;
  pageSize = 10;
  collectionSize = 0;
  purchases = [];
  col: any = 'orderDate';
  order: any = 'desc';
  headers: Array<any> = [
    { name: 'orderDate', title: 'Date', sort: true,isAsc: true, },
    { name: 'purchaseOrderCode', title: 'Purchase Order', sort: true,isAsc: true, },
    { name: 'vendorName', title: 'Vendor Name', sort: true,isAsc: true, },
    { name: 'createdBy', title: 'Received By', sort: true,isAsc: true, },
    { name: 'totalAmount', title: 'Amount', sort: true,isAsc: true, },
    { name: 'dueDate', title: 'Due Date', sort: true,isAsc: true, },
    { name: 'status', title: 'Status', sort: true,isAsc: true, },
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
  getPurchaseOrders(col, details) {
  
    this.prodService
      .getData(
        `${PATH.PURCHASES}?page=${this.page}&size=${this.pageSize}&sort=${col},${this.order}`
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
    // API CALL HERE
    let sortOrder = '';
    sortOrder = details.isAsc ? 'asc' : 'desc';
    this.prodService
      .getData(
        `${PATH.PURCHASES}?page=${this.page}&size=${this.pageSize}&sort=${col},${sortOrder}`
      )
      .subscribe(
        (res) => {
          this.purchases = res['content'];
           details.isAsc = !details.isAsc;
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
