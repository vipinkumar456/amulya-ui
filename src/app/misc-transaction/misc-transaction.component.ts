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
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-misc-transaction',
  templateUrl: './misc-transaction.component.html'
})
export class MiscTransactionComponent implements OnInit {
  @ViewChild('transactionForm') public AddTransaction: NgForm;
  page = 0;
  pageSize = 10;
  collectionSize = 0;
  col: any = 'createdDate';
  order: any = 'desc';
  transactionForm: FormGroup;
  showList: boolean;
  warehouses: any;
  transactions = [];
  headerText = '';
  productList = [];
  isEdit: boolean;
  currentId: any;
  revisions: any;
  uoms: any;
  isFormEdited: any;
  saveDraft: boolean;
  viewDetails: boolean;
  selectedTransaction: any;
  transactionItems: FormArray;
  submitted: boolean;
  isDraftEdited: boolean;
  showProduct: any;
  productListCopy: any = [];
  routeSubscription: any;
  productsPage: number = 1;
  header = [
    {
      name: 'DATE',
      APIname: 'transactionDate',
      isAsc: true,
      showSort:true
    },
    {
      name: 'TRANSACTION#',
      APIname: 'transactionCode',
      isAsc: true,
      showSort:true
    },
    {
      name: 'TRANSACTION REASONS',
      APIname: 'transactionReason',
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
      name: 'TYPE',
      APIname: 'transactionType',
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
  totalPages: number = 10;
  @HostListener('document:click')
  clickout() {
    this.transactions.map((o) => {
      o.showMenu = false;
    });
    this.transactionForm.get('transactionItems')['controls'].map((itm) => {
      itm.get('showProdList').value = false;
    });
  }
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private router: Router
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };
    // this.routeSubscription = this.router.events.subscribe((evt) => {
    //   if (evt instanceof NavigationEnd) {
    //     this.router.navigated = false;
    //     this.routeSubscription.unsubscribe();
    //     window.scrollTo(0, 0);
    //   }
    // });
  }

  ngOnInit(): void {
    this.submitted = false;
    this.page = 1;
    this.showList = true;
    this.isEdit = false;
    this.viewDetails = false;
    this.transactionForm = this.fb.group({
      transactionCode: [{ value: '', disabled: true }, Validators.required],
      wareHouse: ['', Validators.required],
      transactionType: ['', Validators.required],
      notes: [''],
      transactionReason: [''],
      transactionDate: [''],
      itemSearch: [''],
      transactionItems: this.fb.array([this.createItem()]),
      invoiceNumber:['']
    });
    this.getTransactions(this.col, this.order);
    // this.getFormDropdowns();
    this.transactionForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
  }

  /**
   * API call to get transactions list
   */
  getTransactions(col,order) {
    // API CALL HERE
    this.prodService
      .getData(`${PATH.TRANSACTION}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`)
      .subscribe(
        (res) => {
          this.transactions = res['content'];
          this.collectionSize = res['totalElements'];
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
      (res) => {
        this.warehouses = res;
      },
      (err) => {
        console.log(err);
      }
    );
    this.getProducts(50);
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
  /**
   * Show or hide menu for each row
   */
  showOptions(e,transaction) {
    e.stopPropagation();
    
    this.transactions.map((o) => {
      o.showMenu = false;
    });
    transaction['showMenu'] = !transaction['showMenu'];
  }

  /**
   * check and close vendor form
   */
  closeTransactionForm() {
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
        if (receivedEntry == 'save Draft') {
          this.saveDraft = true;
          this.saveTransaction(this.transactionForm);
        } else {
          this.saveDraft = false;
        }
        modalRef.close();
        this.transactionForm.reset();
        this.showList = true;
      });
    } else {
      this.showList = true;
    }
  }

  /**
   * Pagination call to get the page wise data
   */
  refreshPages() {
    this.getTransactions(this.col, this.order);
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
   * Show add for with all the data
   */
  showAddForm() {
    this.viewDetails = false;
    this.transactionForm.reset();
    this.showList = false;
    this.headerText = 'New Non Sales Orders';
    this.getTransactionCode();
    if (this.warehouses.length == 1) {
      this.transactionForm.get('wareHouse').setValue(this.warehouses[0]);
    }
    this.transactionForm.markAsTouched();
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
    if (this.transactionForm.valid) {
      let payload = {};
      payload = form.value;
      payload['transactionItems'].map((trans) => {
        trans.itemName = trans.itemName.split('-')[0];
      });
      payload['transactionCode'] = this.transactionForm.get(
        'transactionCode'
      ).value;
      if (this.isDraftEdited) {
        payload['id'] = this.currentId;
      }
      payload['status'] = 'ACTIVE';
      this.prodService.postData(payload, PATH.TRANSACTION).subscribe(
        (res) => {
          this.toastService.show('Transaction saved successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          });
          this.getTransactions(this.col, this.order);
        },
        (err) => {
          console.log(err);
        }
      );
      this.transactionForm.reset();
      this.submitted = false;
      this.showList = true;
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
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
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
   * create a prouduct item, add and remove items
   */
  onProductSelection(item, product) {
    this.productList.map((list, id) => {
      if (list['itemName'] == product['itemName']) {
        item.controls.uom.setValue(list['unitOfMeasure']);
        item.controls.itemName.setValue(
          `${product['itemNumber']} - ${product['itemName']}`
        );
        let size = `${list['size']} ${list['sizeMeasurement']}`;
        item.controls.size.setValue(size);
      }
    });
    item.controls.showProdList.setValue(false);
  }

  /** products end */

  showTransaction(transaction) {
    this.viewDetails = true;
    this.showList = false;
    this.headerText = 'View Transaction';
    this.selectedTransaction = transaction;
  }

  updatePageSize() {
    this.getTransactions(this.col, this.order);
  }

  scrollToTop(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  createItem(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      lotNumber: ['', Validators.required],
      expiryDate: ['', Validators.required],
      size: ['', [Validators.required]],
      quantity: [, [Validators.min(1), Validators.required]],
      uom: ['', Validators.required],
      showProdList: [false],
      displayName: [''],
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
