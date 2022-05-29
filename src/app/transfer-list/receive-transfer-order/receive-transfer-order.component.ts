import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductsService } from 'src/app/services/products.service';
import { PATH } from 'src/app/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from 'src/app/product-modal/product-modal.component';
import { ToastService } from 'src/app/services/toast.service';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { ConfirmService } from 'src/app/transaction/transaction.service';
@Component({
  selector: 'app-receive-transfer-order',
  templateUrl: './receive-transfer-order.component.html',
  styleUrls: ['./receive-transfer-order.component.css']
})
export class ReceiveTransferOrderComponent implements OnInit {
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  purchaseForm: FormGroup;
  transferOrderItems: FormArray;
  showList: boolean;
  warehouses: any = [];
  vendors = [];
  purchases = [];
  headerText = 'New Purchase Order';
  productList = [];
  productListCopy: any = [];
  totalPages: number = 10;
  showProduct: any;
  productsPage: number = 1;
  isEdit: boolean;
  currentId: any = null;
  grandTotal: number;
  isFormEdited: boolean;
  saveDraft: boolean;
  type: any = null;
  loading = false;
  userName: any;
  isDraftEdited: boolean;
  vendorOtherFlag:boolean=false;
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName');
    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
        this.purchaseForm = this.fb.group({
          transferOrderCode: ['', Validators.required],
          createdBy: [{ value: '', disabled: true }, Validators.required],
          receivedDate: [null],
          notes: [''],
          id: [null],
          transferOrderItems: this.fb.array([]),
          sourceWareHouse:[''],
          destinationWareHouse:['']
        });
        this.headerText = 'Receive Transfer Order';

        this.getTransferOrder();
      } 
     
    });

  
  
  }

  getTransferOrder() {
    this.prodService
      .getData(`${PATH.TRANSFER_ORDER_ID}/${this.currentId}`)
      .subscribe((res: any) => {
        if (this.type == 'clone') {
          res['id'] = null;
        }
        res.receivedDate = new Date();
        // res['transferOrderItems'].map((o) => {
        //   o.itemAmount = o.quantity * o.price;
        // });
        // if (this.type != 'view') {
        const control = <FormArray>(
          this.purchaseForm.controls['transferOrderItems']
        );
        res['transferOrderItems'].forEach((task) => {
          task.showProdList = false;
          // task.itemName = task.itemNumber + ' - ' + task.itemName;
          // task.returnedQuantity = task.returnedQuantity
          //   ? task.returnedQuantity
          //   : 0;
          control.push(this.fb.group(task));
        });
        delete res['transferOrderItems'];
        // }
        this.purchaseForm.patchValue(res);
      
        // console.log(vendor)
        // this.calculateInvoiceAmount()
      });
  }

  /**
   *
   * List items for add/ edit menu items
   */



  /**
   * Show or hide menu for each row
   */
  showOptions(e, purchase) {
    e.stopPropagation();
    this.purchases.map((o) => {
      o.showMenu = false;
    });
    purchase['showMenu'] = !purchase['showMenu'];
  }

  /**
   * check and close vendor form
   */
  closePurchaseForm(): Promise<boolean> {
    // if (this.isFormEdited) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'purchases';
    modalRef.componentInstance.type = 'draftConfirmation';
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
      if (receivedEntry == 'save Draft') {
        this.saveDraft = true;
        // this.saveAsDraft()
      } else {
        this.saveDraft = false;
      }
    });
    return modalRef.result;
  }

  /**
   * Show add for with all the data
   */


  /**
   *
   * get purchase code on adding new PO
   */

  getTransferOrderCode() {
    this.prodService.getData(PATH.PURCHASE_CODE).subscribe(
      (res) => {
        let code = res['code'];
        this.purchaseForm.get('purchaseOrderCode').setValue(code);
      },
      (err) => {
        console.log(err);
      }
    );
  }

 
  
  


  // getProductByCode(item) {
  //   if (this.purchaseForm.get('vendorName').value) {
  //     return;
  //   }
  //   if (item.controls.itemName.value.trim() == '') {
  //     this.productList = [...this.productListCopy];
  //   } else {
  //     this.prodService
  //       .getData(`${PATH.PRODUCTCODE}${item.controls.itemName.value}`)
  //       .subscribe(
  //         (res) => {
  //           this.showProduct = true;
  //           item.controls.showProdList.setValue(true);
  //           this.productList = res['productResponses'];
  //         },
  //         (err) => {
  //           console.log(err);
  //         }
  //       );
  //   }
  // }

  /**
   *
   * Save purchase data on edit and new
   */

  savePurchaseOrder(form) {
    let payload = {};
    payload = this.purchaseForm.getRawValue();
    payload['createdBy'] = this.purchaseForm.get('createdBy').value;
    payload['status'] = 'ACTIVE';
   
    if (payload['id']) {
      this.prodService
        .updateData(`${PATH.PURCHASES}/${payload['transferOrderCode']}`, payload)
        .subscribe(
          (res) => {
            this.toastService.show('Purchase order saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
            this.router.navigate(['purchases']);
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  /***
   * Mark purchase status
   */

  updateStatus(purchase) {}

  /**
   *
   * Save a purchase order as draft
   */

  

  

  createItem(): FormGroup {
    return this.fb.group({
      itemName: [, Validators.required],
      itemNumber: [, Validators.required],
      receivedQuantity: [],
      transferQuantity: ['0'],
      lotNumber: [],
      expiryDate:[]
      // taxAmount:[]
    });
  }

  addItem(): void {
    this.transferOrderItems = this.purchaseForm.get(
      'transferOrderItems'
    ) as FormArray;
    this.transferOrderItems.push(this.createItem());
  }

  removeItem(index) {
    if (this.transferOrderItems && this.transferOrderItems.length > 1) {
      this.transferOrderItems.removeAt(index);
    }
    this.calculateGrandTotal();
  }

  /** products end */

  /**
   * Delete a purchase order
   */

  

  calculateAmount(item) {
    let quantity = parseInt(item.get('quantity').value);
    let receivedQuantity = parseInt(item.get('receivedQuantity').value);
    if (quantity && quantity > 0) {
      let total;
      if(receivedQuantity){
        total = receivedQuantity * item.get('price').value;
      }else{
        total = quantity * item.get('price').value;
      }
      item.get('itemAmount').setValue(total);
      this.calculateGrandTotal();
    }
  }
  calculateFinalAmount(item) {
    let quantity = parseInt(item.get('receivedQuantity').value);
    if (quantity && quantity > 0) {
      let total = quantity * item.get('price').value;
      item.get('invoicePrice').setValue(total);
      this.calculateGrandTotal();
    }
  }

  calculateInvoiceAmount() {
    let total = 0;
    let items = this.purchaseForm.get('transferOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + (item.invoicePrice ? item.invoicePrice : 0);
    });
    this.purchaseForm.controls['totalInvoiceAmount'].setValue(total);
    this.calculateGrandTotal();
  }
  calculateGrandTotal() {
    let total = 0;
    let finaltotal = 0;
    let items = this.purchaseForm.get('transferOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + item.itemAmount;
      finaltotal = finaltotal + item.invoicePrice;
    });
    this.purchaseForm.controls['totalAmount'].setValue(total);
    this.purchaseForm.controls['totalInvoiceAmount'].setValue(finaltotal);
    // this.grandTotal = total;
  }
  

  recievePurchaseOrder(form) {
 
    if (form.valid) {
      let payload = {};
      payload = this.purchaseForm.getRawValue();
      payload['receivedDate'] = new Date(payload['receivedDate']);
      this.prodService
        .patchData(`${PATH.RECEIVE_TRANSFER_ORDER}/${payload['id']}`, payload)
        .subscribe(
          (res) => {
            this.toastService.show('Transfer order saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
            this.router.navigate(['transfer-list']);
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      this.purchaseForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
    }
  }
  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = document.querySelector(
      'form .ng-invalid'
    );
    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: 'smooth',
    });
    firstInvalidControl.focus();
    //without smooth behavior
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  getVal(form) {
    console.log(form);
  }
  
}
