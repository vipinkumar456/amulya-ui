import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { email, phone,pincode } from '../services/custom.validations';
import * as moment from 'moment';
@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.component.html'
})
export class SalesOrderComponent implements OnInit {
  saleForm: FormGroup;
  salesOrderItems: FormArray;
  headerText = 'New sales order';
  productsPage: number = 1;
  productList = [];
  productListCopy: any = [];
  cities: Array<any> = [];
  states: Array<any> = [];
  totalPages: number = 10;
  currentId: any = null;
  grandTotal: number;
  isFormEdited: boolean;
  saveDraft: boolean;
  type: any = null;
  showProduct: any;
  lotNumbers:Array<any>=[];
  warehouses:Array<any>=[];
  userName: any;
  submitted:boolean;
  isDraftEdited: boolean;
  isEdit:boolean=false;
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.getStates();
   
  }

 

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName');
    this.route.params.subscribe((res) => {
      if (res.id) {
       this.prepareSaleOrder();
        this.currentId = res.id;
        this.headerText = 'Edit sale Order';
        this.saleForm.controls['salesOrderCode'].disable();
        this.saleForm.controls['customerName'].disable();
        this.saleForm.controls['phoneNumber'].disable();
        this.saleForm.controls['email'].disable();
        this.saleForm.controls['pinCode'].disable();
        this.saleForm.controls['state'].disable();
        this.saleForm.controls['city'].disable();
        this.saleForm.controls['address'].disable();
        this.getsaleOrder();
        this.saleForm.controls['wareHouse'].setValidators([Validators.required]);
        
      }
      if (res.type) {
        this.type = res.type;

        if (res.type == 'issue') {
          this.headerText = 'Issue sales order';
        } else if (res.type == 'clone') {
          this.headerText = 'Clone sales order';
        }else if (res.type == 'edit') {
          this.headerText = 'Edit sales order';
        } else {
          this.saleForm.controls['wareHouse'].disable();
          this.headerText = 'View sales Order';
        }
      } else {
        this.prepareSaleForm();
        this.showAddForm();
    
        
      }
      
    });
    this.getFormDropdowns();

    this.saleForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
  }

  prepareSaleOrder(){
    this.saleForm = this.fb.group({
      address: [''],
      businessName: [''],
      city: [''],
      customerName: ['', Validators.required],
      deliveryMethod: [''],
      discount: [0],
      email: ['', [Validators.required, email]],
      expectedShipmentDate: [''],
      gst: [0],
      id: [null],
      notes: [''],
      phoneNumber: ['',[Validators.required, phone]],
      pinCode: ['',[pincode]],
      roundOff: 0,
      salesOrderCode: [''],
      salesOrderItems: this.fb.array([]),
      state: [''],
      status: 'ACTIVE',
      subTotal: [0],
      totalAmount: [0],
      createdBy: [{ value: '', disabled: true }, Validators.required],
      wareHouse:[''],
      customerID: ['', Validators.required],
    });
  }
    prepareSaleForm(){
      this.saleForm = this.fb.group({
        address: [''],
        businessName: [''],
        city: [''],
        customerName: ['', Validators.required],
        deliveryMethod: [''],
        discount: [0],
        email: ['', [Validators.required, email]],
        expectedShipmentDate: [''],
        gst: [0],
        id: [null],
        notes: [''],
        phoneNumber: ['',[Validators.required, phone]],
        pinCode: ['',[pincode]],
        roundOff: 0,
        salesOrderCode: [''],
        salesOrderItems: this.fb.array([this.createItem()]),
        state: [''],
        status: 'ACTIVE',
        subTotal: [0],
        totalAmount: [0],
        createdBy: [{ value: '', disabled: true }, Validators.required],
        wareHouse:[''],
        customerID: ['', Validators.required],
      });
    }

 get f() { return this.saleForm.controls; }


 
  showAddForm() {
    // this.currentId = null;
    this.getsalesOrderCode();
    this.saleForm.get('createdBy').setValue(this.userName);
    this.grandTotal = 0.0;
  }
  getStates() {
    this.prodService.getData(`${PATH.STATES}`).subscribe(
      (res: any) => {
        this.states = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  
  onStateSelect() {
    // console.log(eve)
    this.prodService
      .getData(`${PATH.CITIES}/${this.saleForm.controls['state'].value}`)
      .subscribe(
        (res: any) => {
          this.cities = res;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  

  getsaleOrder() {
    this.prodService
      .getData(`${PATH.SALES}/${this.currentId}`)
      .subscribe((res) => {
        let resData:any = res;
        this.isEdit=true;
        console.log(resData);
        if (this.type == 'clone') {
          res['id'] = null;
        }
        res['salesOrderItems'].map((o) => {
          this.getLotNumbers(o.itemNumber,resData.wareHouse)
          o.itemAmount = o.quantity * o.price;
        });
        this.saleForm.patchValue({
          "state":resData.state
        })
        this.onStateSelect();
        this.saleForm.patchValue(res);
   
        const control = <FormArray>this.saleForm.controls['salesOrderItems'];
        res['salesOrderItems']?res['salesOrderItems'].forEach((task) => {
        console.log(task);
        task.showProdList = false;
          control.push(this.fb.group(task));
        }):control.push(this.fb.group([]));;
      });
  }

  /**
   *
   * List items for add/ edit menu items
   */
   customerID(ev){
    console.log(ev.value);
    this.prodService.getData(`${PATH.ACTIVE_DISTRIBUTOR+'/'+ev.value}`).subscribe(
      (res: any) => {
        if(res){
          this.saleForm.patchValue({
            customerName:res.name,
            phoneNumber:res.phoneNumber,
            email:res.email,
            pinCode:res.pinCode,
            state:res.state,
            city:res.city,
            address:res.address
          })
        }else{
          this.saleForm.patchValue({
            customerName:'',
            phoneNumber:'',
            email:'',
            pinCode:'',
            state:'',
            city:'',
            address:''
          })
        }
      },
      (err) => {
        this.saleForm.patchValue({
          customerName:'',
          phoneNumber:'',
          email:'',
          pinCode:'',
          state:'',
          city:'',
          address:''
        })
      }
    );
  }

   pincode(ev){
    console.log(ev.value);
    this.prodService.getData(`${PATH.PINCODE+'?pinCode='+ev.value}`).subscribe(
      (res: any) => {
        if(res){
          this.saleForm.patchValue({
            state:res.state,
            city:res.city,
          })
        }else{
          this.saleForm.patchValue({
            state:'',
            city:'',
          })
        }
      },
      (err) => {
        this.saleForm.patchValue({
          state:'',
          city:'',
        })
      }
    );
  }

  getFormDropdowns() {
    this.getProducts(50);
    this.prodService.getData(PATH.WAREHOUSE).subscribe(
      (res: any) => {
        this.warehouses = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * check and close vendor form
   */
  closesaleForm(): Promise<boolean> {
    // if (this.isFormEdited) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'sales';
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
   *
   * get sale code on adding new PO
   */

  getsalesOrderCode() {
    this.prodService.getData(PATH.SALES_ORDER_CODE).subscribe(
      (res) => {
        let code = res['code'];
        this.saleForm.get('salesOrderCode').setValue(code);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getProducts(size) {
    this.prodService
      .getData(PATH.PRODUCTS_ACTIVE + '?page=' + this.productsPage + '&size=' + size)
      .subscribe(
        (res) => {
          // console.log(res['content']);
          this.productList.push(...res['content']);
          this.totalPages = res['totalPages'];
          this.productListCopy.push(...res['content']);
          // console.log(this.productList);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  onScroll() {
    this.productsPage = this.productsPage + 1;
    // this.productsSize=this.productsSize+25;
    if (this.productsPage <= this.totalPages) {
      this.getProducts(50);
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
    if (this.saleForm.get('customerName').value) {
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
  getLotNumbers(itemNumber,warehouse) {
    
    this.prodService.getData(`${PATH.LOT_NUMBERS}?itemNumber=${itemNumber}&wareHouse=${warehouse}`).subscribe(
      (res:any) => {
       this.lotNumbers=res
      },
      (err) => {
        console.log(err);
      }
    );
  // }
}
getTransferOrder() {
  this.prodService
    .getData(`${PATH.SALES}/${this.currentId}`)
    .subscribe((res) => {
      if (this.type == 'clone') {
         res['id'] = null;
      }
      console.log(res)
      res['transferOrderItems'].map((o) => {
        o.itemAmount = o.quantity * o.price;
      });
      console.log(res)
      this.saleForm.patchValue(res);
    });
}
  onProductSelection(item, product) {
    this.productList.map((list, id) => {
      if (list['itemNumber'] == product['itemNumber']) {
        item.patchValue({
          itemAmount: 0,
          itemName: list['itemName'],
          itemNumber: list['itemNumber'],
          price: list['mrp'],
          quantity: 0,
          uom: list['unitOfMeasure'],
        });
        if (this.saleForm.get('wareHouse').value) {
          this.getLotNumbers(`${product['itemNumber']}`,this.saleForm.get('wareHouse').value)
        }
        item.updateValueAndValidity();
      }
    });
    item.controls.showProdList.setValue(false);
  }

  /**
   *
   * Save sale data on edit and new
   */

  savesaleOrder(form) {
    this.submitted = true;
    let payload:any = {};
    console.log(this.saleForm);
    payload = this.saleForm.getRawValue();
    payload.salesOrderItems.forEach(elm => {
      elm.expiryDate=moment((new Date(elm.expiryDate))).format('YYYY-MM-DD')
    });
    payload['createdBy'] = this.saleForm.get('createdBy').value;
    payload['status'] = 'ACTIVE';
    if (this.saleForm.valid) {
      this.prodService
        .postData(payload,`${PATH.SALES}`)
        .subscribe(
          (res) => {
            this.toastService.show('Sale order saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
            this.router.navigate(['sales'])
          },
          (err) => {
            console.log(err);
          }
        );
      }
  }

  issuesaleOrder(form){
    this.submitted = true;
    let formData = this.saleForm.getRawValue();
    let payload = {
      "issuedDate": "2022-06-29T18:30:00.000+00:00",
      "salesOrderItems": formData.salesOrderItems,
      "wareHouse": formData.wareHouse
    };
    
    if (this.saleForm.valid) {
      this.prodService
        .patchData(`${PATH.ISSUE}/${this.currentId}`, payload)
        .subscribe(
          (res) => {
            this.toastService.show('sale order issued successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
            this.router.navigate(['sales'])
          },
          (err) => {
            console.log(err);
          }
        );
      }
  }

  /***
   * Mark sale status
   */

  updateStatus(sale) {}

  /**
   *
   * Save a sale order as draft
   */

  saveAsDraft() {
    let payload = {};
    payload = this.saleForm.getRawValue();

    if (this.isDraftEdited) {
      payload['id'] = this.currentId;
    }

    payload['status'] = 'DRAFTED';
    this.prodService.postData(payload, PATH.DRAFTSALES).subscribe(
      (res) => {
        this.saleForm.markAsUntouched();
        this.toastService.show('Sales order saved successfully !!', {
          classname: 'amulyaGreen text-light',
          delay: 10000,
        });
        // if (this.type == 'edit') {
        // this.getTransaction();
        // } else {
        this.router.navigate(['sales']);
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

  createItem(): FormGroup {
    return this.fb.group({
      invoicePrice: [0],
      itemName: [''],
      itemNumber: [''],
      issueQuantity:[],
      lotNumber: [''],
      price: [0],
      quantity: [0],
      uom: [{ value: '', disabled: true }],

      itemAmount: [0],
      // itemName: ['', Validators.required],
      // price: 0,
      availableQty:[],
      expiryDate: [''],
      // receivedQuantity: [],
      // returnedQuantity: [],
      // lotNumber: [],
      // invoicePrice: [],
      showProdList: [false],
      // uom: [{ value: '', disabled: true }],
    });
  }

  addItem(): void {
    this.salesOrderItems = this.saleForm.get('salesOrderItems') as FormArray;
    this.salesOrderItems.push(this.createItem());
  }

  removeItem(index) {
    if (this.salesOrderItems && this.salesOrderItems.length > 1) {
      this.salesOrderItems.removeAt(index);
    }
    this.calculateGrandTotal();
  }

  /** products end */

  calculateAmount(item) {
    let quantity = parseInt(item.get('quantity').value);
    let issueQuantity = parseInt(item.get('issueQuantity').value);
    if ((quantity && quantity > 0 && this.type!='issue') || (issueQuantity && issueQuantity > 0 && this.type=='issue')) {
      let total;
      if(this.type=='issue'){
        total = issueQuantity * item.get('price').value;
      }else{
        total = quantity * item.get('price').value;
      }
      item.get('itemAmount').setValue(total);
      this.calculateGrandTotal();
    }
    // if (issueQuantity && issueQuantity > 0 && this.type=='issue') {
    //   let total = quantity * item.get('price').value;
    //   item.get('itemAmount').setValue(total);
    //   this.calculateGrandTotal();
    // }
  }

  calculateInvoiceAmount() {
    let total = 0;
    let items = this.saleForm.get('salesOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + (item.invoicePrice ? item.invoicePrice : 0);
    });
    this.saleForm.controls['totalInvoiceAmount'].setValue(total);
  }
  calculateGrandTotal() {
    let total = 0;
    let items = this.saleForm.get('salesOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + item.itemAmount;
    });
    this.saleForm.controls['totalAmount'].setValue(total);
    this.grandTotal = total;
  }

  recievesaleOrder(form) {
    if (form.valid) {
      let payload = {};
      payload = this.saleForm.getRawValue();
      payload['dueDate'] = new Date(payload['dueDate']);
      payload['receivedDate'] = new Date(payload['receivedDate']);
      this.prodService
        .patchData(`${PATH.PURCHASE_RECEIVE}/${this.currentId}`, payload)
        .subscribe(
          (res) => {
            this.toastService.show('sale order saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      this.saleForm.markAllAsTouched();
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
  lotSelected(f){
    let num=this.lotNumbers.find(o=>{
      return o.lotNumber==f.get('lotNumber').value
    })
    console.log(f)
    f.get('availableQty').setValue(num.availableQuantity)
    f.get('quantity').setValidators([Validators.max(num.availableQuantity)]);
    f.get('quantity').updateValueAndValidity();
    
    if(num.expiryDate){
      f.get('expiryDate').setValue(num.expiryDate);
      
    }else{
      f.get('availableQty').setValue(null)
      f.get('expiryDate').setValue(null)
    }
  }
}
