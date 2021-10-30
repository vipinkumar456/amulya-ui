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

@Component({
  selector: 'app-transfer-order',
  templateUrl: './transfer-order.component.html'
})
export class TransferOrderComponent implements OnInit {

  transferForm: FormGroup;
  transferOrderItems: FormArray;
  headerText = 'New Branch Transfer';
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
  type ='New';
  showProduct: any;
  lotNumbers:Array<any>=[];
  warehouses:Array<any>=[];
  sourceWareHouse:Array<any>=[];
  destinationWareHouse:Array<any>=[];
  isDraftEdited: any;
  noStock: boolean;
  loading:false;
  pageSize = 10;
  transactions = [];
  collectionSize = [];
  page = 0;
  selectedTransaction: Object;
  minDateValue=new Date();

  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }

  ngOnInit(): void {

    console.log(this.transferForm)

    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
        this.headerText = 'Edit Branch Transfer';
     
       // this.transferForm.controls['customerName'].disable();
       // this.transferForm.controls['businessName'].disable();
        // this.transferForm.controls['paymentTerms'].disable();
        this.transferForm = this.fb.group({
          id: [null],
          notes: [''],
          dueDate:new Date,
         sourceWareHouse:['',Validators.required],
         destinationWareHouse:['',Validators.required],
          transferOrderCode: [''],
          transferOrderItems: this.fb.array([]),
          status: 'ACTIVE',
          subTotal: [0],
          totalAmount: [0],
          createdBy: [{ value: '', disabled: true }, Validators.required],
          wareHouse:[]
       });
       this.transferForm.controls['transferOrderCode'].disable();
        this.getTransferOrder();
      } else {
        this.transferForm = this.fb.group({
          id: [null],
          notes: [''],
          dueDate:new Date,
         sourceWareHouse:['',Validators.required],
         destinationWareHouse:['',Validators.required],
          transferOrderCode: [''],
          transferOrderItems: this.fb.array([this.createItem()]),
          status: 'ACTIVE',
          subTotal: [0],
          totalAmount: [0],
          createdBy: [{ value: '', disabled: true }, Validators.required],
          wareHouse:[]
       });
        this.showAddForm();
      }
    });
    this.getSourceWareHouse();
    this.getDestinationWareHouse();
    this.getProducts(1000);

  
     this.transferForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
  }

  
  showAddForm() {
    // this.currentId = null;
    this.type='new';
      this.gettransferOrderCode();
    this.transferForm.get('createdBy').setValue('Test user');
    this.grandTotal = 0.0;
  }
  getTransferOrder() {
    this.prodService
      .getData(`${PATH.TRANSFER}/${this.currentId}`)
      .subscribe((res) => {
        if (this.type == 'clone') {
           res['id'] = null;
        }
      console.log(res)

      const control = <FormArray>(
        this.transferForm.controls['transferOrderItems']
      );
      res['transferOrderItems'].forEach((task) => {
        task.size=null;
        task.uom=null;
        task.expiryDate=null;
        task.lotNumbers=null
        task.availableQty=null;
        control.push(this.fb.group(task));
      });
      delete res['transferOrderItems'];
      
        this.transferForm.patchValue(res);
        this.transferForm.get('transferOrderItems')['controls'].map((o) => {
          console.log(o);
          if (o.controls['itemNumber'].value) {
            this.getLotNumbers(
              o,
              `${o.controls['itemNumber'].value}`,
              this.transferForm.get('sourceWareHouse').value
            );
          }
        });

      });
  }
  refreshPages() {
    this.getTransferOrder();
  }
 
  
  updatePageSize() {
    this.getTransferOrder();
  }

  addRemarks(e, form) {
    e.stopPropagation();
    this.transferForm.get('transferOrderItems')['controls'].map((o) => {
      o.get('showRemarks').setValue(false);
    });
    form.get('showRemarks').setValue(true);
  }
 
  issueChanged() {
    let arr = <FormArray>this.transferForm.get('transferItems');
    arr['controls'].map((o, index) => {
      if (index > 0) {
        arr.removeAt(index);
      } else {
        arr['controls'][index].reset();
      }
    });
    // arr['controls'] = [this.createItem()];
    // arr.updateValueAndValidity()

    this.transferForm.updateValueAndValidity();

    if (
      this.transferForm.get('transferType').value == 'Issue' &&
      this.transferForm.get('wareHouse').value
    ) {
      // console.log(this.transferForm.get('transactionItems'))
      this.transferForm.get('transferItems')['controls'].map((o) => {
        if (o.controls['itemNumber'].value) {
          this.getLotNumbers(
            o,
            `${o.controls['itemNumber'].value}`,
            this.transferForm.get('sourceWareHouse').value
          );
        }
      });
    }
  }
  onScrollToEnd() {
    console.log('ho');
    this.productsPage = this.productsPage + 1;
    // this.productsSize=this.productsSize+25;
    if (this.productsPage <= this.totalPages) {
      // this.getProducts(50);
    }
  }
  onScroll(e) {
    if (e.end > 45) {
      this.productsPage = this.productsPage + 1;
      if (this.productsPage <= this.totalPages) {
        this.getProducts(50);
      }
    }
  }
  getLotNumbers(fg, itmNum, warehouse) {
    this.prodService
      .getDataWithParams(`${PATH.LOT_NUMBERS}`, {
        itemNumber: itmNum,
        wareHouse: warehouse,
      })
      // .getData(`${PATH.LOT_NUMBERS}?itemName=${itmName}&wareHouse=${warehouse}`)
      .subscribe(
        (res: any) => {
          if (res.length) {
            fg.controls['lotNumbers'].setValue(res);

            let num = res.find((x) => {
              return x.lotNumber == fg.controls['lotNumber'].value;
            });
            if(num){
              fg.controls['availableQty'].setValue(num.availableQuantity)
              fg.controls['expiryDate'].setValue(num.expiryDate)

            }else{
              fg.controls['availableQty'].setValue(null);
              fg.controls['expiryDate'].setValue(null)
            }
            this.noStock = false;
          } else {
            this.noStock = true;
            this.toastService.show('No Stock Available', {
              classname: 'bg-danger text-light',
              delay: 5000,
            });

            fg.controls['lotNumbers'].setValue(res);

            let num = res.find((x) => {
              return x.lotNumber == fg.controls['lotNumber'].value;
            });
            if(num){
              fg.controls['availableQty'].setValue(num.availableQuantity)
              fg.controls['expiryDate'].setValue(num.expiryDate)

            }else{
              fg.controls['availableQty'].setValue(null);
              fg.controls['expiryDate'].setValue(null)
            }
              
          }
        },
        (err) => {
          console.log(err);
        }
      );
    // }
  }
  selectProductNumber(product, fg) {
    if (product) {
      fg.get('itemName').setValue(product.itemName);
      fg.controls.uom.setValue(product['unitOfMeasure']);
      fg.controls.size.setValue(product['sizeMeasurement']);
      
        this.getLotNumbers(
          fg,
          product.itemNumber,
          this.transferForm.get('sourceWareHouse').value
        );
  
    } else {
      fg.reset();
    }
  }
  selectProductName(product, fg) {
    if (product) {
      fg.get('itemNumber').setValue(product.itemNumber);
      fg.controls.uom.setValue(product['unitOfMeasure']);
      fg.controls.size.setValue(product['sizeMeasurement']);
        this.getLotNumbers(
          fg,
          product.itemNumber,
          this.transferForm.get('sourceWareHouse').value
        );
      
    } else {
      fg.reset();
    }
  }

  /**
   *
   * List items for add/ edit menu items
   */

  getSourceWareHouse() {
    this.prodService.getData(PATH.ALL_WAREHOUSE).subscribe(
      (res: any) => {
        this.sourceWareHouse = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getDestinationWareHouse() {
    this.prodService.getData(PATH.APPLICABLE_WAREHOUSE).subscribe(
      (res: any) => {
        this.destinationWareHouse = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * check and close vendor form
   */
  closetransferForm(): Promise<boolean> {
    // if (this.isFormEdited) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'transfers';
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
   * get transfer code on adding new PO
   */

  gettransferOrderCode() {
    this.prodService.getData(PATH.TRANSFER_ORDER_CODE).subscribe(
      (res) => {
        let code = res['code'];
        this.transferForm.get('transferOrderCode').setValue(code);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  get f() {
    return this.transferForm.controls;
  }

  get fa() {
    return this.transferForm.get('transferOrderItems') as FormArray;
  }
  getProducts(size) {
    this.prodService
      .getData(PATH.PRODUCTS + '?page=' + this.productsPage + '&size=' + size)
      .subscribe(
        (res) => {
          // console.log(res['content']);
          this.productList=res['content'];
          this.totalPages = res['totalPages'];
          this.productListCopy=res['content'];
          
          
          console.log(this.transferForm.get('transferOrderItems'));
           
          if(this.transferForm.get('transferOrderItems').value){
            this.transferForm.get('transferOrderItems')['controls'].map((o) =>
              res['content'].map( (i)=> {
                if(i.itemNumber==o.get('itemNumber').value){
                  console.log(i.sizeMeasurement +"  "+i.unitOfMeasure)
                  o.get('size').setValue(i.sizeMeasurement);
                  o.get('uom').setValue(i.unitOfMeasure);
                }
              })  
              )
          }
        },
        (err) => {
          console.log(err);
        }
      );
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
    if (this.transferForm.get('customerName').value) {
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
//   getLotNumbers(itmNumber,warehouse) {
//     console.log(warehouse+itmNumber)
//     this.prodService.getData(`${PATH.LOT_NUMBERS}?itemNumber=${itmNumber}&wareHouse=${warehouse}`).subscribe(
      
//       (res:any) => {

//        this.lotNumbers=res
//       },
//       (err) => {
//         console.log(err);
//       }
//     );
//   // }
// }
onProductSelection(item, product) {
  this.productList.map((list, id) => {
    if (list['itemName'] == product['itemName']) {
      item.controls.uom.setValue(list['unitOfMeasure']);
      item.controls.itemName.setValue(
        `${product['itemNumber']} - ${product['itemName']}`
      );
      let size = `${list['size']} ${list['sizeMeasurement']}`;
      item.controls.size.setValue(size);
      if (
        this.transferForm.get('transactionType').value == 'Issue' &&
        this.transferForm.get('wareHouse').value
      ) {
        this.getLotNumbers(
          item,
          `${product['itemNumber']}`,
          this.transferForm.get('wareHouse').value
        );
      }
    }
  });
  item.controls.showProdList.setValue(false);
}


  /**
   *
   * Save transfer data on edit and new
   */

  savetransferOrder(form) {
    let payload = {};
    payload = this.transferForm.getRawValue();
    console.log(this.transferForm.getRawValue())
    payload['createdBy'] = this.transferForm.get('createdBy').value;
    payload['status'] = 'ACTIVE';
    // if (payload['id']) {

    if(this.transferForm.get('sourceWareHouse').value==this.transferForm.get('destinationWareHouse').value){
      this.toastService.show("Source and Destination warehouses cannot be same!", {
        classname: 'amulyaRed text-light',
        delay: 10000,
      });
      return;
    }


      this.prodService
        .updateData(`${PATH.TRANSFER}`, payload)
        .subscribe(
          (res) => {
            this.toastService.show('transfer order saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
             this.router.navigate(['transfer-list'])
          },
          (err) => {
            console.log(err);
          }
        );
    // } else {
    //   this.prodService.postData(payload, PATH.transferS).subscribe(
    //     (res) => {
    //       this.toastService.show('transfer order saved successfully !!', {
    //         classname: 'amulyaGreen text-light',
    //         delay: 10000,
    //       });
    //       this.router.navigate(['transfer', 'edit', res['id']]);
    //     },
    //     (err) => {
    //       console.log(err);
    //     }
    //   );
    // }
  }

  /***
   * Mark transfer status
   */

  updateStatus(transfer) {}

  /**
   *
   * Save a transfer order as draft
   */

  saveAsDraft(form) {
    let payload = {};
    payload = this.transferForm.getRawValue();

    if (this.isDraftEdited) {
      payload['id'] = this.currentId;
    }

    payload['status'] = 'DRAFTED';
    this.prodService.postData(payload, PATH.DRAFTTRANSFER).subscribe(
      (res) => {
        this.transferForm.markAsUntouched();
        this.toastService.show('Transaction saved successfully !!', {
          classname: 'amulyaGreen text-light',
          delay: 10000,
        });
        this.router.navigate(['transfer-list']);
      },
      (err) => {
        this.toastService.show(err, {
          classname: 'amulyaRed text-light',
          delay: 10000,
        });
      }
    );
  }


  createItem(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      itemNumber: ['', Validators.required],
      lotNumber: ['', Validators.required],
      lotNumbers: [],
      expiryDate: ['', Validators.required],
      size: ['', Validators.required],
      transferQuantity: [, [Validators.min(1), Validators.required]],
      uom: ['', Validators.required],
      displayName: [''],
      availableQty: [],
      showRemarks: [false],
      description: [''],
    });
  }

  addItem(): void {
    this.transferOrderItems = this.transferForm.get('transferOrderItems') as FormArray;
    this.transferOrderItems.push(this.createItem());
  }

  removeItem(index) {
    if (this.transferOrderItems && this.transferOrderItems.length > 1) {
      this.transferOrderItems.removeAt(index);
    }
    // this.calculateGrandTotal();
  }

  /** products end */

  calculateAmount(item) {
    let quantity = parseInt(item.get('transferQuantity').value);
    if (quantity && quantity > 0) {
      let total = quantity * item.get('price').value;
      item.get('itemAmount').setValue(total);
      this.calculateGrandTotal();
    }
  }

  calculateInvoiceAmount() {
    let total = 0;
    let items = this.transferForm.get('transferOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + (item.invoicePrice ? item.invoicePrice : 0);
    });
    this.transferForm.controls['totalInvoiceAmount'].setValue(total);
  }
  calculateGrandTotal() {
    let total = 0;
    let items = this.transferForm.get('transferOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + item.itemAmount;
    });
    this.transferForm.controls['totalAmount'].setValue(total);
    this.grandTotal = total;
  }

  recievetransferOrder(form) {
    if (form.valid) {
      let payload = {};
      payload = this.transferForm.getRawValue();
      payload['dueDate'] = new Date(payload['dueDate']);
      payload['receivedDate'] = new Date(payload['receivedDate']);
      this.prodService
        .patchData(`${PATH.PURCHASE_RECEIVE}/${this.currentId}`, payload)
        .subscribe(
          (res) => {
            this.toastService.show('transfer order saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      this.transferForm.markAllAsTouched();
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
  lotSelected(f) {
    // console.log(f)
    let num = f.controls['lotNumbers'].value.find((o) => {
      return o.lotNumber == f.get('lotNumber').value;
    });
    if (num) {
      f.get('availableQty').setValue(num.availableQuantity);
      f.get('transferQuantity').setValidators([
        Validators.required,
        Validators.max(num.availableQuantity),
      ]);
      f.get('expiryDate').setValidators(null);
      f.get('transferQuantity').updateValueAndValidity();
      f.get('expiryDate').updateValueAndValidity();

      if (num.expiryDate) {
        f.get('expiryDate').setValue(num.expiryDate);
      } else {
        f.get('availableQty').setValue(null);
        f.get('expiryDate').setValue(null);
      }
      if (num.availableQuantity <= 0) {
        this.toastService.show('No Stock Available', {
          classname: 'bg-danger text-light',
          delay: 10000,
        });
      }
    }
  }
}
