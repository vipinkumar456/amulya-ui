import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  NgForm,
  FormControl,
} from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmService } from './transaction.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html'
})
export class TransactionComponent implements OnInit {
  @ViewChild('transactionForm') public AddTransaction: NgForm;
  page = 0;
  pageSize = 10;
  collectionSize = 0;
  transactionForm: FormGroup;
  showList: boolean;
  warehouses: Array<any> = [];
  transactions = [];
  headerText: string = 'New Non Sales Orders';
  productList: Array<any> = [];
  isEdit: boolean;
  currentId: any;
  revisions: any;
  uoms: any;
  isFormEdited: any;
  saveDraft: boolean;
  viewDetails: boolean;
  selectedTransaction: any = {};
  transactionItems: FormArray;
  submitted: boolean;
  isDraftEdited: boolean;
  showProduct: any;
  productListCopy: any = [];
  routeSubscription: any;
  productsPage: number = 1;
  transType:any=[];
  noStock: boolean = false;
  loading = false;
  header = [
    {
      name: 'DATE',
      APIname: 'transactionDate',
      isAsc: true,
    },
    {
      name: 'TRANSACTION#',
      APIname: 'transactionCode',
      isAsc: true,
    },
    {
      name: 'CREATED BY',
      APIname: 'createdBy',
      isAsc: true,
    },
    {
      name: 'TYPE',
      APIname: 'transactionType',
      isAsc: true,
    },
    {
      name: 'STATUS',
      APIname: 'status',
      isAsc: true,
    },
  ];
  type: any = 'add';
  totalPages: number = 10;
  lotNumbers: Array<any> = [];
  @HostListener('document:click')
  clickout() {
    this.transactionForm.get('transactionItems')['controls'].map((itm) => {
      itm.get('showProdList').value = false;
      itm.get('showRemarks').value = false;
    });
  }
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
        this.transactionForm = this.fb.group({
          transactionCode: [{ value: '', disabled: true }, Validators.required],
          wareHouse: ['', Validators.required],
          transactionType: ['', Validators.required],
          notes: [''],
          transactionReason: [''],
          transactionDate: [''],
          itemSearch: [''],
          transactionItems: this.fb.array([]),
          id: [null],
          invoiceNumber: [''],
          transactionComments:[],
        });
        this.getTransaction();
      } else {
        this.transactionForm = this.fb.group({
          transactionCode: [{ value: '', disabled: true }, Validators.required],
          wareHouse: ['', Validators.required],
          transactionType: ['', Validators.required],
          notes: [''],
          transactionReason: [''],
          transactionDate: [''],
          itemSearch: [''],
          transactionItems: this.fb.array([this.createItem()]),
          id: [null],
          invoiceNumber: [''],
          transactionComments:[],
        });
        this.getTransactionCode();
        if (this.warehouses.length == 1) {
          this.transactionForm.get('wareHouse').setValue(this.warehouses[0]);
        }
        this.getFormDropdowns();
      }
      if (res.type) {
        this.type = res.type;
        if (this.type == 'view') {
          this.headerText = 'View Transaction';
        } else {
          this.getFormDropdowns();
        }
      }
    });

    this.transactionForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
    let draft = this.confirmService.transactionSubject.subscribe((res) => {
      draft.unsubscribe();
      this.saveAsDraft();
    });
    this.issueChanged();
    this.getTransReas();
  }
  qtyChanged(f) {
    if (this.transactionForm.get('transactionType').value == 'Issue') {
      if (f.get('availableQty').value < f.get('quantity').value) {
        this.toastService.show(
          'Entered quantity greater than available quantity',
          {
            classname: 'bg-danger text-light',
            delay: 10000,
          }
        );
      }
    }
  }
  lotSelected(f) {
    // console.log(f)
    let num = f.controls['lotNumbers'].value.find((o) => {
      return o.lotNumber == f.get('lotNumber').value;
    });
    if (num) {
      f.get('availableQty').setValue(num.availableQuantity);
      f.get('quantity').setValidators([
        Validators.required,
        Validators.max(num.availableQuantity),
      ]);
      f.get('expiryDate').setValidators(null);
      f.get('quantity').updateValueAndValidity();
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
  getTransaction() {
    this.prodService.getData(`${PATH.TRANSACTION}/${this.currentId}`).subscribe(
      (res) => {
        this.selectedTransaction = res;
        if (this.type != 'view') {
          const control = <FormArray>(
            this.transactionForm.controls['transactionItems']
          );
          res['transactionItems'].forEach((task) => {
            // task.itemName = task.itemName;
            task.showProdList = false;
            task.availableQty = null;
            task.lotNumbers = [];
            task.showRemarks = false;
            task.description = '';
            console.log(task);
            control.push(this.fb.group(task));
          });
          // console.log(control)
          // delete res['transactionItems'];
          this.transactionForm.patchValue(res);
        }
        if (this.type == 'clone') {
          res['id'] = null;
          this.getTransactionCode();
        }

        if (
          this.transactionForm.get('transactionType').value == 'Issue' &&
          this.transactionForm.get('wareHouse').value
        ) {
          // console.log(this.transactionForm.get('transactionItems'))
          this.transactionForm.get('transactionItems')['controls'].map((o) => {
            if (o.controls['itemNumber'].value) {
              this.getLotNumbers(
                o,
                `${o.controls['itemNumber'].value}`,
                this.transactionForm.get('wareHouse').value
              );
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  /**
   *
   * List items for add/ edit menu items
   */

  getFormDropdowns() {
    this.prodService.getData(PATH.WAREHOUSE).subscribe(
      (res: any) => {
        this.warehouses = res;
      },
      (err) => {
        console.log(err);
      }
    );
    this.getProducts(500);
    this.revisions = ['rev 1', 'rev 2', 'rev 3', 'rev 4'];
    this.prodService.getData(PATH.UOM).subscribe(
      (res) => {
        this.uoms = res;
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
          // this.productList = res['content'];
          this.totalPages = res['totalPages'];
          this.productListCopy.push(...res['content']);
          this.productList = this.productListCopy;
          // console.log(this.productList);
        },
        (err) => {
          console.log(err);
        }
      );
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
  selectProductNumber(product, fg) {
    if (product) {
      fg.get('itemName').setValue(product.itemName);
      fg.controls.uom.setValue(product['unitOfMeasure']);
      fg.controls.size.setValue(product.size);
      if (
        this.transactionForm.get('transactionType').value == 'Issue' &&
        this.transactionForm.get('wareHouse').value
      ) {
        this.getLotNumbers(
          fg,
          product.itemNumber,
          this.transactionForm.get('wareHouse').value
        );
      }
    } else {
      fg.reset();
    }
  }
  selectProductName(product, fg) {
    if (product) {
      fg.get('itemNumber').setValue(product.itemNumber);
      fg.controls.uom.setValue(product['unitOfMeasure']);
      fg.controls.size.setValue(product.size);
      if (
        this.transactionForm.get('transactionType').value == 'Issue' &&
        this.transactionForm.get('wareHouse').value
      ) {
        this.getLotNumbers(
          fg,
          product.itemNumber,
          this.transactionForm.get('wareHouse').value
        );
      }
    } else {
      fg.reset();
    }
  }
  /**
   * Show or hide menu for each row
   */
  showOptions(transaction) {
    transaction['showMenu'] = !transaction['showMenu'];
  }
  addRemarks(e, form) {
    e.stopPropagation();
    this.transactionForm.get('transactionItems')['controls'].map((o) => {
      o.get('showRemarks').setValue(false);
    });
    form.get('showRemarks').setValue(true);
  }

  /**
   * check and close vendor form
   */
  closeTransactionForm(): Promise<boolean> {
    if (this.isFormEdited && !this.viewDetails) {
      const modalRef = this.modalService.open(ProductModalComponent);
      modalRef.componentInstance.compName = 'transactions';
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
          this.saveTransaction(this.transactionForm);
          return Promise.resolve(true);
        } else {
          return Promise.resolve(true);
        }
      });
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   *
   * get transaction code on adding new PO
   */

  getTransactionCode() {
    this.prodService.getData(PATH.TRANSCODE).subscribe(
      (res) => {
        let code = res['code'];
        this.transactionForm.get('transactionCode').setValue(code);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * Edit selected transaction
   */

  cloneTransaction(transaction) {
    transaction['showMenu'] = !transaction['showMenu'];
    this.transactionForm.reset();
    this.viewDetails = false;
    this.showList = false;
    if (transaction.status == 'DRAFTED') {
      this.isDraftEdited = true;
      this.currentId = transaction.id;
      this.headerText = 'Edit Transaction';
      this.transactionForm
        .get('transactionCode')
        .setValue(transaction.transactionCode);
    } else {
      this.headerText = 'Clone Transaction';
      this.getTransactionCode();
    }
    transaction.transactionItems.map((trans) => {
      delete trans.description;
    });
    this.transactionForm
      .get('transactionType')
      .setValue(transaction.transactionType);
    this.transactionForm.get('wareHouse').setValue(transaction.wareHouse);
    this.transactionForm.get('notes').setValue(transaction.notes);
    this.transactionForm
      .get('transactionItems')
      .patchValue(transaction.transactionItems);
  }

  /**
   *
   * Save transaction data on edit and new
   */

  saveTransaction(form) {
    const invalid = [];
    const controls = this.transactionForm.controls['transactionItems'][0];
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    if (this.transactionForm.valid) {
      let payload = {};
      payload = form.value;
      payload['transactionCode'] = this.transactionForm.get(
        'transactionCode'
      ).value;
      // if (this.isDraftEdited) {
      //   payload['id'] = this.currentId;
      // }
      payload['status'] = 'ACTIVE';
      // if (payload['id']) {
      //   this.prodService
      //     .updateData(`${PATH.TRANSACTION}/${this.currentId}`, payload)
      //     .subscribe(
      //       (res) => {
      //         this.toastService.show('Transaction saved successfully !!', {
      //           classname: 'amulyaGreen text-light',
      //           delay: 10000,
      //         });
      //         this.router.navigate(['miscTransaction',res.id])
      //       },
      //       (err) => {
      //         console.log(err);
      //       }
      //     );
      // } else {
      this.prodService.postData(payload, PATH.TRANSACTION).subscribe(
        (res) => {
          this.toastService.show('Transaction saved successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          });
          this.transactionForm.reset();
          this.router.navigate(['miscTransactions']);
        },
        (err) => {
          this.toastService.show(err, {
            classname: 'amulyaRed text-light',
            delay: 10000,
          });
        }
      );
      // }
    } else {
      this.submitted = true;
      this.transactionForm.markAllAsTouched();
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
    return controlEl
      ? controlEl.getBoundingClientRect().top + window.scrollY - labelOffset
      : null;
  }

  get f() {
    return this.transactionForm.controls;
  }

  get fa() {
    return this.transactionForm.get('transactionItems') as FormArray;
  }

  /***
   * Edit transaction which is in drafted state
   */

  editDraft(transaction) {}

  /**
   *
   * Save a transaction order as draft
   */

  saveAsDraft() {
    let payload = {};
    payload = this.transactionForm.getRawValue();

    if (this.isDraftEdited) {
      payload['id'] = this.currentId;
    }

    payload['status'] = 'DRAFTED';
    this.prodService.postData(payload, PATH.DRAFTTRANS).subscribe(
      (res) => {
        this.transactionForm.markAsUntouched();
        this.toastService.show('Transaction saved successfully !!', {
          classname: 'amulyaGreen text-light',
          delay: 10000,
        });
        // if (this.type == 'edit') {
        // this.getTransaction();
        // } else {
        this.router.navigate(['miscTransactions']);
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

  /**
   * create a prouduct item, add and remove items
   */
  issueChanged() {

    if(this.type == 'issue'){
      this.transactionForm.patchValue({
        transactionType:'Issue'
      })
    }
    if(this.type == 'receipt'){
      this.transactionForm.patchValue({
        transactionType:'Receipt'
      })
    }
    

    this.transactionForm.updateValueAndValidity();

    if (
      this.transactionForm.get('transactionType').value == 'Issue' &&
      this.transactionForm.get('wareHouse').value
    ) {
      // console.log(this.transactionForm.get('transactionItems'))
      this.transactionForm.get('transactionItems')['controls'].map((o) => {
        if (o.controls['itemNumber'].value) {
          this.getLotNumbers(
            o,
            `${o.controls['itemNumber'].value}`,
            this.transactionForm.get('wareHouse').value
          );
        }
      });
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
            num
              ? fg.controls['availableQty'].setValue(num.availableQuantity)
              : null;
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
            num
              ? fg.controls['availableQty'].setValue(num.availableQuantity)
              : fg.controls['availableQty'].setValue(null);
          }
        },
        (err) => {
          console.log(err);
        }
      );
    // }
  }
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
          this.transactionForm.get('transactionType').value == 'Issue' &&
          this.transactionForm.get('wareHouse').value
        ) {
          this.getLotNumbers(
            item,
            `${product['itemNumber']}`,
            this.transactionForm.get('wareHouse').value
          );
        }
      }
    });
    item.controls.showProdList.setValue(false);
  }

  getTransReas(){
    let transType;
    if(this.type=='receipt'){
      transType = 'Transaction Type=Receipt'
    }else{
      transType = 'Transaction Type=Issue'
    }
    this.prodService.getData(`${PATH.TRANSREASON}?${transType}`).subscribe(
      (res) => {
        this.transType = res;
      })
  }
  

  /** products end */

  showTransaction(transaction) {
    this.viewDetails = true;
    this.showList = false;
    this.headerText = 'View Transaction';
    this.selectedTransaction = transaction;
  }

  scrollToTop(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  createItem(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      itemNumber: ['', Validators.required],
      lotNumber: ['', Validators.required],
      lotNumbers: [],
      expiryDate: ['', Validators.required],
      size: ['', Validators.required],
      quantity: [, [Validators.min(1), Validators.required]],
      uom: ['', Validators.required],
      showProdList: [false],
      displayName: [''],
      availableQty: [],
      showRemarks: [false],
      description: [''],
    });
  }

  addItem(): void {
    this.transactionItems = this.transactionForm.get(
      'transactionItems'
    ) as FormArray;
    this.transactionItems.push(this.createItem());
  }

  removeItem(index) {
    if (this.transactionItems && this.transactionItems.length > 1) {
      this.transactionItems.removeAt(index);
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

  sortBy(type, details) {
    let order = '';
    order = details.isAsc ? 'asc' : 'desc';
    this.prodService
      .getData(
        `${PATH.TRANSACTION}?page=${this.page}&size=${this.pageSize}&sort=${type},${order}`
      )
      .subscribe(
        (res) => {
          details.isAsc = !details.isAsc;
          this.transactions = res['content'];
          this.collectionSize = res['totalElements'];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
