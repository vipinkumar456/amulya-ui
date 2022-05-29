import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { ConfirmService } from '../transaction/transaction.service';
import * as moment from 'moment';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html'
})
export class PurchaseComponent implements OnInit {
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  purchaseForm: FormGroup;
  purchaseOrderItems: FormArray;
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
          purchaseOrderCode: ['', Validators.required],
          vendorName: ['', Validators.required],
          wareHouse: [''],
          createdBy: [{ value: '', disabled: true }, Validators.required],
          dueDate: ['', Validators.required],
          orderDate: [null],
          receivedDate: [null],
          notes: [''],
          id: [null],
          paymentTerms: [''],
          totalAmount: [null],
          totalInvoiceAmount: [],
          purchaseOrderItems: this.fb.array([]),
          invoiceNumber: [''],
        });
        this.headerText = 'Edit Purchase Order';
        this.purchaseForm.controls['purchaseOrderCode'].disable();
        this.purchaseForm.controls['vendorName'].disable();
        this.purchaseForm.controls['wareHouse'].disable();
        this.purchaseForm.controls['orderDate'].disable();
        this.purchaseForm.controls['paymentTerms'].disable();

        this.getPurchaseOrder();
      } else {
        this.purchaseForm = this.fb.group({
          purchaseOrderCode: ['', Validators.required],
          vendorCode:[''],
          vendorName: ['', Validators.required],
          wareHouse: [''],
          createdBy: [{ value: '', disabled: true }, Validators.required],
          dueDate: ['', Validators.required],
          receivedDate: [null],
          notes: [''],
          id: [null],
          paymentTerms: [''],
          totalAmount: [null],
          totalInvoiceAmount: [],
          purchaseOrderItems: this.fb.array([this.createItem()]),
          invoiceNumber: [''],
        });
      }
      if (res.type) {
        this.type = res.type;

        if (res.type == 'receive') {
          this.headerText = 'Receive Purchase Order';
          this.purchaseForm.controls['dueDate'].disable();
        } else if (res.type == 'clone') {
          this.headerText = 'Clone Purchase Order';
        } else if (res.type == 'view') {
          this.headerText = 'View Purchase Order';
        } else {
          this.headerText = 'Edit Purchase Order';
        }
      } else {
        this.showAddForm();
      }
    });
    this.getFormDropdowns();

    this.purchaseForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
    this.confirmService.transactionObservable.subscribe((res) => {
      this.saveAsDraft();
    });
  }

  getPurchaseOrder() {
    this.prodService
      .getData(`${PATH.PURCHASES}/${this.currentId}`)
      .subscribe((res: any) => {
        if (this.type == 'clone') {
          res['id'] = null;
        }
        res.receivedDate = new Date();
        res['purchaseOrderItems'].map((o) => {
          o.itemAmount = o.quantity * o.price;
        });
        // if (this.type != 'view') {
        const control = <FormArray>(
          this.purchaseForm.controls['purchaseOrderItems']
        );
        res['purchaseOrderItems'].forEach((task) => {
          task.showProdList = false;
          // task.itemName = task.itemNumber + ' - ' + task.itemName;
          task.returnedQuantity = task.returnedQuantity
            ? task.returnedQuantity
            : 0;
          control.push(this.fb.group(task));
        });
        delete res['purchaseOrderItems'];
        // }
        this.purchaseForm.patchValue(res);
        let vendor = this.vendors.find((o) => {
          return o.vendorName == res['vendorName'];
        });
        // console.log(vendor)
        this.calculateInvoiceAmount()
        this.productList = vendor ? vendor.vendorProducts : [];
      });
  }

  /**
   *
   * List items for add/ edit menu items
   */

  getFormDropdowns() {
    this.prodService.getData(PATH.VENODRS+'?page=1&size=500').subscribe(
      (res) => {
        this.vendors = res['content'];
        if (this.currentId && this.type) {
          let vendor = this.vendors.find((o) => {
            return o.vendorName == this.purchaseForm.get('vendorName').value;
          });
          this.productList = vendor ? vendor.vendorProducts : [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
    this.prodService.getData(PATH.WAREHOUSE).subscribe(
      (res) => {
        this.warehouses = res;
      },
      (err) => {
        console.log(err);
      }
    );
    // this.getProducts(500);
  }

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
  showAddForm() {
    // this.currentId = null;
    this.getPurchaseOrderCode();
    this.purchaseForm.get('createdBy').setValue(this.userName);
    this.grandTotal = 0.0;
    if (this.warehouses.length == 1) {
      this.purchaseForm.get('wareHouse').setValue(this.warehouses[0]);
    }
  }

  /**
   *
   * get purchase code on adding new PO
   */

  getPurchaseOrderCode() {
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
  onScrollToEnd() {
   
    this.productsPage = this.productsPage + 1;
    // this.productsSize=this.productsSize+25;
    if (this.productsPage <= this.totalPages) {
      // this.getProducts(500);
    }
  }
  getProducts(size) {
    this.prodService
      .getData(PATH.PRODUCTS_ACTIVE + '?page=' + this.productsPage + '&size=' + size)
      .subscribe(
        (res) => {
          this.totalPages = res['totalPages'];
          res['content']
            ? this.productListCopy.push(...res['content'])
            : (this.productListCopy = []);
            this.productList=this.productListCopy;
          // console.log(this.productList);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  selectProductNumber(product, fg) {
    console.log(product)
    if (product) {
      fg.patchValue(product);
      
    } else {
      fg.reset()
    }
  }
  selectProductName(product, fg) {
    if (product) {
      fg.patchValue(product);
      
    } else {
      fg.reset()
    }
  }
  showProducts(e, i) {
    e.stopPropagation();
    i.controls['showProdList'].value = !i.controls['showProdList'].value;
    // this.productList = this.productListCopy;
  }
  searchItm(item) {
    if (item.controls.itemName.value.trim() == '') {
      this.productList = [...this.productListCopy];
    }
  }
  getProductByCode(item) {
    if (this.purchaseForm.get('vendorName').value) {
      return;
    }
    if (item.controls.itemName.value.trim() == '') {
      this.productList = [...this.productListCopy];
    } else {
      this.prodService
        .getData(`${PATH.PRODUCTCODE}${item.controls.itemName.value}`)
        .subscribe(
          (res) => {
            this.showProduct = true;
            item.controls.showProdList.setValue(true);
            this.productList = res['productResponses'];
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }
  onProductSelection(item, product) {
    // console.log(item,product)
    product.itemName = `${product['itemNumber']} - ${product['itemName']}`;
    item.patchValue(product);

    // this.productList.map((list, id) => {
    //   if (list['itemName'] == product['itemName']) {
    //     item.patchValue({
    //       itemAmount: 0,
    //       itemName: list['itemName'],
    //       price: list['mrp'],
    //       quantity: 0,
    //       uom: list['unitOfMeasure'],
    //       lotNumber:[],
    //       manufacturingDate:[null],
    //       expiryDate:[null]
    //     });
    //     item.updateValueAndValidity();
    //   }

    // });
    item.controls.showProdList.setValue(false);
  }

  /**
   *
   * Save purchase data on edit and new
   */

  savePurchaseOrder(form) {
    debugger
    let payload:any = {};
    payload = this.purchaseForm.getRawValue();
    if(payload.dueDate){
      payload.dueDate=moment((new Date(payload.dueDate))).format('YYYY-MM-DD')
    }
    payload['createdBy'] = this.purchaseForm.get('createdBy').value;
    payload['status'] = 'ACTIVE';
   
    if (payload['id']) {
      this.prodService
        .updateData(`${PATH.PURCHASES}/${this.currentId}`, payload)
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
    } else {
      this.prodService.postData(payload, PATH.PURCHASES).subscribe(
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

  saveAsDraft() {
    // DRAFTPURCHASE
    let payload = {};
    payload = this.purchaseForm.getRawValue();

    if (this.isDraftEdited) {
      payload['id'] = this.currentId;
    }

    payload['status'] = 'DRAFTED';
    this.prodService.postData(payload, PATH.DRAFTPURCHASE).subscribe(
      (res) => {
        this.purchaseForm.markAsUntouched();
        this.toastService.show('Purchase order saved successfully !!', {
          classname: 'amulyaGreen text-light',
          delay: 10000,
        });
        // if (this.type == 'edit') {
        // this.getTransaction();
        // } else {
        this.router.navigate(['purchases']);
        // }
      },
      (err) => {
        this.toastService.show(err, {
          classname: 'amulyaRed text-light',
          delay: 10000,
        });
        // console.log(err);
      }
    );
  }

  onVendorSelection(eve) {
    // eve=eve.vendorName
    if(eve=='Others'){
      this.vendorOtherFlag = true;
    }else{
      this.vendorOtherFlag = false;
    }
    console.log(this.purchaseForm);
    this.purchaseOrderItems = this.purchaseForm.get(
      'purchaseOrderItems'
    ) as FormArray;
    this.purchaseOrderItems.controls = [];
    this.purchaseOrderItems.push(this.createItem());

    this.vendors.map((vendor) => {
      if (vendor.vendorName == eve) {
        this.productList = vendor.vendorProducts;
      }
    });
    let itemCategoryData = this.vendors.filter(itemInArray => itemInArray.vendorName === eve);
    this.purchaseForm.patchValue({
      vendorCode:itemCategoryData[0]['vendorCode']
    })
  }

  /**
   * create a prouduct item, add and remove items
   */
  // onProductSelection(selected) {
  //   this.productList.map((list, id) => {
  //     if (list['itemName'] == selected.value['itemName']) {
  //       selected.patchValue({
  //         itemAmount: 0,
  //         itemName: list['itemName'],
  //         price: list['price'],
  //         quantity: 0,
  //         uom: list['uom'],
  //       });
  //       selected.updateValueAndValidity();
  //     }
  //   });
  // }

  createItem(): FormGroup {
    return this.fb.group({
      itemAmount: [0],
      itemName: [, Validators.required],
      itemNumber: [, Validators.required],
      price: 0,
      quantity: ['', Validators.required],
      receivedQuantity: [],
      returnedQuantity: ['0'],
      invoiceQuantity:[],
      lotNumber: [],
      invoicePrice: [],
      showProdList: [false],
      uom: [{ value: '', disabled: true }],
      manufacturingDate: [null],
      expiryDate: [null],
      comments:[],
      bv:[],
      dp:[],
      hsn:[],
      // taxAmount:[]
    });
  }

  addItem(): void {
    this.purchaseOrderItems = this.purchaseForm.get(
      'purchaseOrderItems'
    ) as FormArray;
    this.purchaseOrderItems.push(this.createItem());
  }

  removeItem(index) {
    if (this.purchaseOrderItems && this.purchaseOrderItems.length > 1) {
      this.purchaseOrderItems.removeAt(index);
    }
    this.calculateGrandTotal();
  }

  /** products end */

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
    let items = this.purchaseForm.get('purchaseOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + (item.invoicePrice ? item.invoicePrice : 0);
    });
    this.purchaseForm.controls['totalInvoiceAmount'].setValue(total);
    this.calculateGrandTotal();
  }
  calculateGrandTotal() {
    let total = 0;
    let finaltotal = 0;
    let items = this.purchaseForm.get('purchaseOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + item.itemAmount;
      finaltotal = finaltotal + item.invoicePrice;
    });
    this.purchaseForm.controls['totalAmount'].setValue(total);
    this.purchaseForm.controls['totalInvoiceAmount'].setValue(finaltotal);
    // this.grandTotal = total;
  }
  recievePurchase(purchase) {
    this.type = 'recieve';
    this.currentId = purchase.id;
    purchase['showMenu'] = !purchase['showMenu'];
    this.headerText = 'Receive Purchase Order';
    this.showList = false;
    this.isEdit = true;
    purchase.dueDate = formatDate(purchase.dueDate, 'yyyy-MM-dd', 'en');
    // console.log(purchase)
    this.purchaseForm.patchValue(purchase);
  }
  recievePurchaseOrder(form) {
    if(!form.value.invoiceNumber){
      this.toastService.show('Please Enter The Invoice Number', {
        classname: 'amulyaRed text-light',
        delay: 3000,
      });
    }
    if (form.valid) {
      let payload = {};
      payload = this.purchaseForm.getRawValue();
      payload['dueDate'] = new Date(payload['dueDate']);
      payload['receivedDate'] = new Date(payload['receivedDate']);
      this.prodService
        .patchData(`${PATH.PURCHASE_RECEIVE}/${this.currentId}`, payload)
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
