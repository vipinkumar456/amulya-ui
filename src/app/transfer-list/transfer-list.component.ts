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
  selector: 'app-transfer-list',
  templateUrl: './transfer-list.component.html'
})
export class TransferListComponent implements OnInit {

  page = 1;
  pageSize = 10;
  collectionSize = 0;
  transfers = [];
  col: any = 'createdDate';
  order: any = 'desc';
  transactions: any;
  header = [
    {
      name: 'DATE',
      APIname: 'createdDate',
      isAsc: true,
      showSort:true
    },
    {
      name: 'TRANSFER ORDER#',
      APIname: 'transferOrderCode',
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
      name: 'DUE DATE',
      APIname: 'dueDate',
      isAsc: true,
      showSort:true
    },
    {
      name: 'STATUS',
      APIname: 'transferOrderStatus',
      isAsc: true,
      showSort:true
    },
  ];
  @HostListener('document:click')
  clickout() {
    this.transfers.map((o) => {
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
    this.getTransferOrders(this.col, this.order);
  }

  /**
   * API call to get transfer orders list list
   */
  getTransferOrders(col,order) {
    console.log(this.pageSize)
    console.log(this.transfers);
    this.prodService
      .getData(`${PATH.TRANSFER}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`)
      .subscribe(
        (res) => {
          this.transfers = res['content'];
          console.log(this.transfers);
          this.collectionSize = res['totalElements'];
          console.log(this.transfers)
        },
        (err) => {
          console.log(err);
        }
      );
  }

  /**
   * Show or hide menu for each row
   */
  showOptions(e, transfer) {
    e.stopPropagation();
    this.transfers.map((o) => {
      o.showMenu = false;
    });
    if (transfer.status == 'CLOSED' || transfer.status == 'CANCELLED') {
      return false;
    }

    transfer['showMenu'] = !transfer['showMenu'];
  }

  /**
   * Pagination call to get the page wise data
   */
  refreshPages() {
    this.getTransferOrders(this.col, this.order);
  }
  

  updatePageSize() {
    this.getTransferOrders(this.col, this.order);
  }

  scrollToTop(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  edittransfer(transfer) {
    this.router.navigate(['transfer', 'edit', transfer.id]);
  }

  /**
   * Delete a transfer order
   */

  deletetransfer(transfer) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'transfers';
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
  sortBy(type, details) {
    let order = '';
    order = details.isAsc ? 'asc' : 'desc';
    this.prodService
      .getData(
        `${PATH.TRANSFER}?page=${this.page}&size=${this.pageSize}&sort=${type},${order}`
      )
      .subscribe(
        (res) => {
          details.isAsc = !details.isAsc;
          this.transfers = res['content'];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  recievetransferOrder(transfer) {
    this.router.navigate(['transfer', 'receive', transfer.id]);
  }
  canceltransfer(transfer) {
    this.type = 'cancel';
    let payload = { ...transfer };
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
              this.toastService.show('transfer order cancelled successfully !!', {
                classname: 'amulyaGreen text-light',
                delay: 10000,
              });
              this.getTransferOrders(this.col, this.order);
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
