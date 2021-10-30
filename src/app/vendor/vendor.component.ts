import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import { email, phone } from '../services/custom.validations';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html'
})
export class VendorComponent implements OnInit {
  submitted:boolean=false;
  Activevendors: any;
  InActivevendors: any;
  Draftedvendors: any;
  active = 1;
  showList: boolean;
  vendorAddForm: FormGroup;
  ProductSelect: FormGroup;
  isEdit: boolean;
  vendorId: any;
  text: string;
  isFormEdited: boolean;
  cities : Array<any>=[];
  states: Array<any>=[];
  vendorForm: boolean;
  vendorDetails: boolean;
  products: any;
  productList: Array<any> = [];
  productListCopy: any = [];
  selectedVendor: any;
  currentId: any;
  saveDraft: boolean;
  vendorProducts: FormArray;
  activecollectionSize: any;
  inActivecollectionSize: any;
  DraftedcollectionSize: any;
  activepage: any;
  activepageSize: any;
  inActivepage: any;
  inActivepageSize: any;
  draftedpage: any;
  draftedpageSize: any;
  productsPage: number = 1;
  totalPages: number = 10;
  page = 0;
  pageSize = 10;
  collectionSize = 0;
  col: any = 'createdDate';
  order: any = 'desc';
  showProduct: boolean;
  bankList;
  IfscCodeList;
  branchDetails;
  filter: boolean = false;
  filterData = {
    itemName: "",
    itemNumber: '',
    itemPrice: '',
    vendorCode: '',
    vendorName: "",
    status:"ACTIVE"
  };
  Activeheader = [
    {
      name: 'S.No',
      APIname: 'Sno',
      ActiveisAsc: true,
      showSort: false,
    },
    {
      name: 'VENDOR NAME',
      APIname: 'vendorName',
      ActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'VENDOR CODE',
      APIname: 'vendorCode',
      ActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'ONBOARDED ON',
      APIname: 'onboardDate',
      ActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'CITY',
      APIname: 'city',
      ActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'STATE',
      APIname: 'state',
      ActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'PINCODE',
      APIname: 'pinCode',
      ActiveisAsc: true,
      showSort: true,
    },
  ];
  InActiveheader = [
    {
      name: 'S.No',
      APIname: 'Sno',
      InActiveisAsc: true,
      showSort: false,
    },
    {
      name: 'VENDOR NAME',
      APIname: 'vendorName',
      InActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'VENDOR CODE',
      APIname: 'vendorCode',
      InActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'ONBOARDED ON',
      APIname: 'onboardDate',
      InActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'CITY',
      APIname: 'city',
      InActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'STATE',
      APIname: 'state',
      InActiveisAsc: true,
      showSort: true,
    },
    {
      name: 'PINCODE',
      APIname: 'pinCode',
      InActiveisAsc: true,
      showSort: true,
    },
  ];
  @HostListener('document:click')
  clickout() {
   this.hidePop();
    this.filter = false;
  }
  private hidePop(){
    this.Activevendors.map((o) => {
      o.showMenu = false;
    });
    this.Draftedvendors.map((o) => {
      o.showMenu = false;
    });
    this.InActivevendors.map((o) => {
      o.showMenu = false;
    });
  }
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.showList = true;
    this.text = 'New';
    this.isEdit = false;
    this.getVendorsList(this.col, this.order);
    this.getVendorProducts(50);
    this.getBankList();
    this.prodService.getData(`${PATH.STATES}`).subscribe(
      (res:any) => {
        this.states = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  createForm() {
    this.vendorAddForm = this.fb.group({
      vendorName: ['', Validators.required],
      vendorCode: [{ value: '', disabled: true }, Validators.required],
      primaryContactPerson: ['', Validators.required],
      primaryContactNumber: ['', [Validators.required,phone]],
      primaryContactEmail: ['', [Validators.required, email]],
      secondaryContactPerson: [''],
      secondaryContactNumber: [''],
      secondaryContactEmail: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', Validators.required],
      bankName: ['', [Validators.required]],
      branchName: ['', [Validators.required]],
      accountHolderName: ['', Validators.required],
      accountNumber: ['', [Validators.required]],
      confirmAccountNumber:['', [Validators.required]],
      ifscCode: ['', [Validators.required]],
      panNumber: ['', Validators.required],
      gstNumber: ['', Validators.required],
      tinNumber: [''],
      onboardDate: [''],
      paymentTerms: [''],
      status: [''],
      vendorProducts: this.isEdit?this.fb.array([]):this.fb.array([this.createItem()]),
    });
    this.vendorAddForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
  }

  get f() { return this.vendorAddForm.controls; }

  /**
   * API call to get vendors list
   */
  getVendorsList(col, order) {
    // API CALL HERE
    this.prodService.getData(`${PATH.VENDOR}/ACTIVE?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`).subscribe(
      (resp) => {
        this.Activevendors = resp['content'];
        console.log(this.Activevendors);
        this.Activevendors.map((data) => {
          data['statusText'] = 'Mark Inative';
        });
        console.log(this.Activevendors);
        this.collectionSize = resp['totalElements'];
      },
      (err) => {
        console.log(err);
      }
    );
    this.prodService.getData(`${PATH.VENDOR}/INACTIVE?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`).subscribe(
      (resp) => {
        this.InActivevendors = resp['content'];
        this.InActivevendors.map((data) => {
          data['statusText'] = 'Mark Active';
        });
        this.collectionSize = resp['totalElements'];
      },
      (err) => {
        console.log(err);
      }
    );
    this.prodService.getData(`${PATH.VENDOR}/DRAFTED`).subscribe(
      (resp) => {
        this.Draftedvendors = resp['content'];
      },
      (err) => {
        console.log(err);
      }
    );
  }

  sortBy(type, details) {
    let order = '';
    let InActiveorder = '';
    order = details.ActiveisAsc ? 'asc' : 'desc';
    InActiveorder = details.InActiveisAsc ? 'asc' : 'desc';
    this.prodService.getData(`${PATH.VENDOR}/ACTIVE?page=${this.page}&size=${this.pageSize}&sort=${type},${order}`).subscribe(
      (resp) => {
        details.ActiveisAsc = !details.ActiveisAsc;
        this.Activevendors = resp['content'];
        this.Activevendors.map((data) => {
          data['statusText'] = 'Mark Inative';
        });
        console.log(this.Activevendors);
        this.collectionSize = resp['totalElements'];
      },
      (err) => {
        console.log(err);
      }
    );
    this.prodService.getData(`${PATH.VENDOR}/INACTIVE?page=${this.page}&size=${this.pageSize}&sort=${type},${InActiveorder}`).subscribe(
      (resp) => {
        details.InActiveisAsc = !details.InActiveisAsc;
        this.InActivevendors = resp['content'];
        this.InActivevendors.map((data) => {
          data['statusText'] = 'Mark Active';
        });
        this.collectionSize = resp['totalElements'];
      },
      (err) => {
        console.log(err);
      }
    );

  }
  updatePageSize() {
    this.getVendorsList(this.col, this.order);
  }

  /**
   * API call to get vendor specific product list
   */
  getVendorProducts(size) {
    this.prodService
      .getData(
        `${PATH.PRODUCTS_ACTIVE}` + '?page=' + this.productsPage + '&size=' + size
      )
      .subscribe((res) => {
        this.productList.push(...res['content']);
        this.totalPages = res['totalPages'];
        this.productListCopy.push(...res['content']);
      });
  }
  onScroll() {
    this.productsPage = this.productsPage + 1;
    // this.productsSize=this.productsSize+25;
    if (this.productsPage <= this.totalPages) {
      this.getVendorProducts(50);
    }
  }
  onProductSelection(item, product) {
    // this.productList.map((list, id) => {
    // if (list['itemName'] == product['itemName']) {
    console.log(product);
    item.controls.uom.setValue(product['unitOfMeasure']);
    item.controls.price.setValue(product['mrp']);
    item.controls.itemNumber.setValue(product['itemNumber']);
    item.controls.itemName.setValue(
      `${product['itemNumber']} - ${product['itemName']}`
    );
    // }
    // });
    item.controls.showProdList.setValue(false);
  }

  get fa() {
    return this.vendorAddForm.get('transactionItems') as FormArray;
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

  /**
   * Show or hide menu for each row
   */
  showOptions(e,vendor) {

    e.stopPropagation();
    this.hidePop()
    vendor['showMenu'] = !vendor['showMenu'];
  }

  /**
   * check and close vendor form
   */
  closeVendorForm() {
    if (this.isFormEdited && !this.vendorDetails) {
      const modalRef = this.modalService.open(ProductModalComponent);
      modalRef.componentInstance.compName = 'vendorList';
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
        if (receivedEntry == 'save Draft') {
          this.saveDraft = true;
          this.saveVendorData(this.vendorAddForm);
        } else {
          this.saveDraft = false;
        }
        modalRef.close();
        this.vendorAddForm.reset();
        this.showList = true;
        this.vendorDetails = false;
        this.vendorForm = false;
      });
    } else {
      this.showList = true;
    }
  }

  /**
   * Pagination call to get the page wise data
   */
  refreshPages() {
    this.getVendorsList(this.col, this.order);
  }

  /**
   * Show add for with all the data
   */
  showAddForm() {
    this.createForm()
    this.isEdit = false;
    this.saveDraft = false;
    this.vendorAddForm.get('paymentTerms').setValue('30 Days');
    let currentDate = new Date().toISOString().substring(0, 10);
    this.prodService.getData(`${PATH.VENDOR_CODE}`).subscribe(
      (res) => {
        this.vendorAddForm.get('vendorCode').setValue(res['code']);
      },
      (err) => {}
    );
    this.text = 'New Vendor';
    this.showList = false;
    this.vendorDetails = false;
    this.vendorForm = true;
    this.vendorAddForm.get('onboardDate').setValue(currentDate);
  }

  /**
   * Show vendor data
   */

  showVendorData(vendor) {
    this.showList = false;
    this.text = '';
    this.selectedVendor = vendor;
    this.vendorForm = false;
    this.vendorDetails = true;
    this.products = vendor['vendorProducts'];
  }

  /**
   *
   * Show drafted data, remove close button
   */

  editDraft(vendor) {
    this.editVendor(vendor);
  }

  pincode(ev){
    this.prodService.getData(`${PATH.PINCODE+'?pinCode='+ev.value}`).subscribe(
      (res: any) => {
        if(res){
          this.vendorAddForm.patchValue({
            state:res.state,
            city:res.city
          })
        }else{
          this.vendorAddForm.patchValue({
            state:'',
            city:''
          })
        }
      },
      (err) => {
        this.vendorAddForm.patchValue({
          state:'',
          city:''
        })
      }
    );
  }

  /**
   * Edit selected vendor
   */

  editVendor(vendor) {
    this.isEdit = true;
    this.createForm()
    vendor['showMenu'] = !vendor['showMenu'];
    this.vendorForm = true;
    this.vendorDetails = false;
    this.showList = false;
    this.text = 'Edit Vendor';
    
    this.currentId = vendor.id;
    vendor.onboardDate = new Date(vendor.onboardDate);
    const control = <FormArray>this.vendorAddForm.controls['vendorProducts'];
    vendor['vendorProducts']?vendor['vendorProducts'].forEach((task) => {
      task.showProdList = false;
      task.itemName=task.itemNumber+" - "+task.itemName;
      // task.itemName: '',
      // itemNumber: '',
      // uom: '',
      // price: '',
      control.push(this.fb.group(task));
    }):control.push(this.fb.group([]));;
    // console.log(vendor)
    delete vendor['vendorProducts'];
    this.vendorAddForm.patchValue(vendor);
    this.onStateSelect();
    // this.vendorAddForm.get("vendorName").setValue(vendor.vendorName);
    // this.vendorAddForm.get("status").setValue(vendor.status);
    // this.vendorAddForm.get("vendorCode").setValue(vendor.vendorCode);
    // this.vendorAddForm.get("onboardDate").setValue(date);
    // this.vendorAddForm.get("city").setValue(vendor.city);
    // this.vendorAddForm.get("state").setValue(vendor.state);
    // this.vendorAddForm.get("pinCode").setValue(vendor.pinCode);
    // this.vendorAddForm.get("address").setValue(vendor.address);
    // this.vendorAddForm.get("panNumber").setValue(vendor.panNumber);
    // this.vendorAddForm.get("gstNumber").setValue(vendor.gstNumber);
    // this.vendorAddForm.get("tinNumber").setValue(vendor.tinNumber);
    // this.vendorAddForm.get("primaryContactPerson").setValue(vendor.primaryContactPerson);
    // this.vendorAddForm.get("primaryContactNumber").setValue(vendor.primaryContactNumber);
    // this.vendorAddForm.get("primaryContactEmail").setValue(vendor.primaryContactEmail);
    // this.vendorAddForm.get("secondaryContactPerson").setValue(vendor.secondaryContactPerson);
    // this.vendorAddForm.get("secondaryContactNumber").setValue(vendor.secondaryContactNumber);
    // this.vendorAddForm.get("secondaryContactEmail").setValue(vendor.secondaryContactEmail);
  }

  /**
   *
   * Save vendor data on edit and new
   */

  saveVendorData(form:FormGroup) {
    form.markAllAsTouched()
    let url = PATH.VENDOR;
    let payload = form.value;
    delete payload.paymentTerms;
    delete payload.itemName;
    delete payload.uom;
    delete payload.price;
    payload['vendorProducts'].map((trans) => {
      trans.itemName = trans.itemName.split(' - ')[1];
    });
    payload['vendorCode'] = this.vendorAddForm.get('vendorCode').value;
    if (this.isEdit) {
      if (payload['status'] == 'DRAFTED' && !this.saveDraft) {
        payload['status'] = 'ACTIVE';
      }
      url = PATH.VENDOR + '/' + this.currentId;
      this.prodService.updateData(url, payload).subscribe(
        (res) => {
          this.toastService.show('Vendor saved successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          });
          this.vendorForm = false;
          this.vendorDetails = false;
          this.showList = true;
          this.getVendorsList(this.col, this.order);
        },
        (err) => {
          console.log(err);
          this.toastService.show(err.message, {
            classname: 'amulyaRed text-light',
            delay: 10000,
          });
        }
      );
    } else {
      if (this.saveDraft) {
        payload['status'] = 'DRAFTED';
      }
      payload['status'] = 'ACTIVE';
      this.prodService.postData(payload, url).subscribe(
        (res) => {
          this.toastService.show('Vendor saved successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          });
          this.vendorForm = false;
          this.vendorDetails = false;
          this.showList = true;
          this.getVendorsList(this.col, this.order);
        },
        (err) => {
          console.log(err);
          this.toastService.show(err.message, {
            classname: 'amulyaRed text-light',
            delay: 10000,
          });
        }
      );
    }
    this.saveDraft = false;
    // this.vendorAddForm.reset();
  }

  /***
   * Mark vendor as inactive /active
   */

  updateStatus(vendor, status) {
    this.prodService
      .updateData(`${PATH.VENDOR}/${vendor.id}`, { status: status })
      .subscribe(
        (res) => {
          this.toastService.show('Status Updated Successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          });
          this.getVendorsList(this.col, this.order);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  saveAsDraft(vendorAddForm) {
    this.saveDraft = true;
    this.saveVendorData(vendorAddForm);
    this.vendorAddForm.reset();
  }

  onStateSelect() {
    // console.log(eve)
    this.prodService
      .getData(`${PATH.CITIES}/${this.vendorAddForm.controls['state'].value}`)
      .subscribe(
        (res: any) => {
          this.cities = res;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  createItem(): FormGroup {
    return this.fb.group({
      itemName: ['',Validators.required],
      itemNumber: ['',Validators.required],
      uom: ['',Validators.required],
      price: ['',Validators.required],
      showProdList: [false],
    });
  }

  addItem(): void {
    this.vendorProducts = this.vendorAddForm.get('vendorProducts') as FormArray;
    this.vendorProducts.push(this.createItem());
  }

  // removeItem() {
  //   if (this.vendorProducts && this.vendorProducts.length > 0) {
  //     this.vendorProducts.removeAt(this.vendorProducts.length - 1);
  //   }
  // }
  removeItem(index) {
    if (this.vendorProducts && this.vendorProducts.length > 1) {
      this.vendorProducts.removeAt(index);
    }
  }
  getBankList(){
    this.prodService.getData(PATH.BANK).subscribe((res) => {
      this.bankList = res;
    })
  }

  getIfscCodeList(){
    this.prodService.getData(`${PATH.BANK}/ifscCodes?bankName=${this.vendorAddForm.controls['bankName'].value}`).subscribe((res) => {
      this.IfscCodeList = res;
    })
  }

  getBranchDetails(){
    this.prodService.getData(`${PATH.BANK}/bankDetailsByIFSC?ifscCode=${this.vendorAddForm.controls['ifscCode'].value}`).subscribe((res) => {
      this.branchDetails = res;
      this.vendorAddForm.patchValue({
        branchName:this.branchDetails.branchName
      })
    })
  }

  filterProducts() {
    this.products=[];
    this.filterData.vendorCode=this.filterData.vendorCode.toUpperCase();
    let sub = this.prodService
      .postData(
        this.filterData,
        `${PATH.VENDORS_FILTER}?page=${this.page}&size=${this.pageSize}`
      )
      .subscribe((res) => {
        // console.log(this.page);
        console.log(this.filterData.status);
        if(this.filterData.status=='ACTIVE'){
          this.Activevendors = res['content'];
        }
        if(this.filterData.status=='INACTIVE'){
        this.InActivevendors = res['content'];
        }
        this.collectionSize = res['totalElements'];
        this.filter=false;
      });
  }
}
