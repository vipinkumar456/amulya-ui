import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ProductsService } from '../services/products.service';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { PATH } from '../constants';
import { ToastService } from '../services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { percentage,email, phone } from '../services/custom.validations';
import { parse } from 'path';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  products: Array<any> = [];
  col: any = 'createdDate';
  order: any = 'desc';
  showList: boolean;
  listAddForm: FormGroup;
  categories = [];
  uoms: Array<any> = [];
  vendors: Array<any> = [];
  warehouses: Array<any> = [];
  items = [];
  isEdit: boolean;
  productId: any;
  type: string;
  isFormEdited: boolean;
  showUom = false;
  selectedUom: any;
  errMsg: string;
  showerror: boolean;
  gst: Array<any> = [];
  isImgRes:boolean=false;
  imageApprove:any;
  amulyaCodes: Array<any> = [];
  productsPage: number = 1;
  totalPages: number = 10;
  loading = false;
  hsnCode:any;
  header = [
    {
      name: 'AMULYA CODE',
      APIname: 'itemNumber',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'NAME',
      APIname: 'itemName',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'CATEGORY',
      APIname: 'itemCategory',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'UOM',
      APIname: 'uom',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'MRP',
      APIname: 'mrp',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'CP',
      APIname: 'cp',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'DP',
      APIname: 'dp',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'BV',
      APIname: 'bv',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'HSN',
      APIname: 'hsn',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'PP',
      APIname: 'pp',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'STATUS',
      APIname: 'status',
      isAsc: true,
      showSort: true,
    },
  ];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  submitted: boolean;
  @HostListener('document:click')
  clickout() {
    this.products.map((o) => {
      o.showMenu = false;
    });
    this.filter = false;
  }
  image: string;
  categoryId = null;
  imageChanged: boolean = false;
  subscriptions: Subscription;
  filter: boolean = false;
  filterData = {
    // fromBV: "",
    itemCategoryId: '',
    itemName: null,
    itemNumber: null,
    // toBV: "",
    status:"ACTIVE"
  };
  viewProduct:boolean=false;
  selectedProduct:any={};
  constructor(
    private prodService: ProductsService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {
    this.subscriptions = new Subscription();
  }

  ngOnInit(): void {
    this.page = 1;
    this.showList = false;
    this.type = 'New';
    this.getListData();
    this.route.params.subscribe((res) => {
      if (res.categoryId) {
        this.filterData.itemCategoryId = res.categoryId;
        this.getProductListByCategory(res.categoryId);
      } else {
        this.getProductList(this.col, this.order);
      }
    });

    this.listAddForm = this.fb.group({
      itemCategoryId: ['', Validators.required],
      itemNumber: [{ value: '' }, Validators.required],
      itemName: ['', Validators.required],
      itemDescription: [''],
      mrp: ['', [Validators.required]],
      dp: ['', [Validators.required]],
      cp: ['', [Validators.required]],
      bv: ['', [Validators.required]],
      hsn: ['', [Validators.required]],
      pp: ['', [Validators.required]],
      dpPercentage: ['', [Validators.required,percentage]],
      cpPercentage: ['', [Validators.required,percentage]],
      bvPercentage: ['', [Validators.required,percentage]],
      ppPercentage: ['', [Validators.required,percentage]],
      availableQuantity: [''],
      status: [''],
      size: [],
      image: [null],
      unitOfMeasure: ['', Validators.required],
      preferredVendor: [''],
      applicableWareHouses: [''],
      discountPercentage: [''],
      maxLimitPerStaff: [''],
      quantityTracked: [true],
      serialControlled: [''],
      lotControlled: [true],
      revisionControlled: [''],
      staffDiscountAllowed: [true],
      igst: [],
      cgst: [],
      hgst: [],
      igstPercentage: ['', [Validators.required,percentage]],
      cgstPercentage: [''],
      hgstPercentage: [''],
      taxable:['']
    });
    console.log(this.listAddForm.value.taxable);
    this.listAddForm.valueChanges.subscribe((value) => {
      this.isFormEdited = true;
    });
    this.getHsnCode();
  }

  getListData() {
    let sub3 = this.prodService.getData(`${PATH.CATEGORIES}`).subscribe(
      (res) => {
        this.subscriptions.add(sub3);
        this.categories = res['productCategories'];
      },
      (err) => {
        console.log('Unable to get categories');
      }
    );
    let sub2 = this.prodService.getData(PATH.VENDOR).subscribe(
      (res: any) => {
        this.subscriptions.add(sub2);
        this.vendors = res;
      },
      (err) => {
        console.log('Unable to get vendors');
      }
    );
    let sub1 = this.prodService.getData(`${PATH.PRODUCTS}/uoms`).subscribe(
      (res: any) => {
        this.subscriptions.add(sub1);
        this.uoms = res;
      },
      (err) => {
        console.log('Unable to get uoms');
      }
    );
    let sub = this.prodService.getData(`${PATH.PRODUCTS}/warehouses`).subscribe(
      (res: any) => {
        this.subscriptions.add(sub);
        this.warehouses = res;
      },
      (err) => {
        console.log('Unable to get warehouses');
      }
    );
  }

  updatePageSize() {
    this.categoryId ? this.getProductListByCategory(this.categoryId) : this.getProductList(this.col, this.order);
  }

  getProductList(col,order) {
    let sub = this.prodService
      .getData(`${PATH.PRODUCTS}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`)
      .subscribe((res) => {
        this.subscriptions.add(sub);
        this.products = res['content'];
        console.log(this.products);
        this.collectionSize = res['totalElements'];
        this.formatProducts(this.page);
      });
  }

  getHsnCode() {
    let sub = this.prodService
      .getData(`${PATH.GET_HSN}`)
      .subscribe((res) => {
        this.hsnCode=res;
      });
  }

  getAllCodes(size){
    let sub = this.prodService
    .getData(`${PATH.PRODUCTS}?page=${this.productsPage}&size=${size}&sort=${this.col},${this.order}`)
    .subscribe((res) => {
      this.amulyaCodes = res['content'];
      this.totalPages = res['totalPages'];
    });
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
        this.getAllCodes(50);
      }
    }
  }

  getProductListByCategory(catId) {
         let sub = this.prodService
      .postData(
        this.filterData,
        `${PATH.PRODUCTS_FILTER}?page=${this.page}&size=${this.pageSize}`
      )
      .subscribe((res) => {
        // console.log(this.page);
        this.products = res['content'];
        this.collectionSize = res['totalElements'];
        this.formatProducts(this.page);
        this.subscriptions.add(sub);
        this.filter=false;
      });
  }
  viewProducts(product){
  
    this.listAddForm.patchValue(product);
    this.selectedProduct=product;
    this.viewProduct=true;
    this.viewImage()
  }

  filterOpen(){
    this.getAllCodes(500);
    this.filter=true;
    this.filterData = {
      // fromBV: "",
      itemCategoryId: '',
      itemName: null,
      itemNumber: null,
      // toBV: "",
      status:"ACTIVE"
    };
    
  }
  filterProducts() {
    let sub = this.prodService
      .postData(
        this.filterData,
        `${PATH.PRODUCTS_FILTER}?page=${this.page}&size=${this.pageSize}`
      )
      .subscribe((res) => {
        // console.log(this.page);
        this.products = res['content'];
        this.collectionSize = res['totalElements'];
        this.formatProducts(this.page);
        this.subscriptions.add(sub);
        this.filter=false;
      });
  }
  showOptions(product) {
    event.stopPropagation();
    product['showMenu'] = !product['showMenu'];
  }
  selectFiles() {
    this.fileInput.nativeElement.click();
  }
  uploadFile() {
    // this.fileUploading = true;
    const fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      let size = fileBrowser.files[0].size / 1024 / 1024;
      // if (size > 1) {
      //   return;
      // }
      const formData = new FormData();
      formData.append('file', fileBrowser.files[0]);
      let sub = this.prodService.uploadFile(formData).subscribe(
        (res) => {
          this.listAddForm.controls['image'].setValue(res['payload'].fileName);
          // this.toastService.show('File Uploaded successfully !!', {
          //   classname: 'amulyaGreen text-light',
          //   delay: 10000,
          // });
          this.getUploadedImg(res['payload']);
          this.subscriptions.add(sub);
          this.imageChanged = true;
          this.fileInput.nativeElement.value = '';
          if (this.isEdit) {
            this.SaveProductData(this.listAddForm);
          }
          // this.viewImage()
        },
        (err) => {
          this.fileInput.nativeElement.value = '';
        }
      );
    }
  }
  getUploadedImg(doc){
    console.log(doc)
    let sub = this.prodService
      .downloadFile(doc.fileName)
      .subscribe((res) => {
       console.log(res);
       this.isImgRes = true;
       this.imageApprove = res['payload'];
      
  });
}
  deleteImage() {
    this.listAddForm.controls['image'].setValue('');
    this.imageChanged = true;
    this.isImgRes = false;
       this.imageApprove ='';
    this.SaveProductData(this.listAddForm);

  }
  viewImage() {
    if (!this.listAddForm.controls['image'].value) {
      return;
    }
    let sub = this.prodService
      .downloadFile(this.listAddForm.controls['image'].value)
      .subscribe((res) => {
        this.image = res['payload'];
        this.subscriptions.add(sub);
      });
  }
  downloadImage() {
    // const a = document.createElement('a');
    // a.href = this.image;
    // a.download = this.listAddForm.controls['image'].value;
    // a.click();
    let doc=this.listAddForm.controls['image'].value;
    let sub = this.prodService
    .downloadFile(doc)
    .subscribe((res) => {
      this.image = res['payload'];
      const a = document.createElement('a');
      a.href = this.image;
      a.download = doc;
      a.click();
      this.subscriptions.add(sub);
    });
  }
  refreshPages() {
    this.categoryId ? this.getProductListByCategory(this.categoryId) : this.getProductList(this.col, this.order);
  }

  showAddForm() {

    this.isImgRes = false;
    this.imageApprove ='';
    this.listAddForm.reset();
    this.listAddForm.controls['quantityTracked'].setValue(true);
    this.listAddForm.controls['lotControlled'].setValue(true);
    this.listAddForm.controls['taxable'].setValue(true);
    this.type = 'New';
    this.showList = true;
    this.isEdit = false;
    this.selectedUom = 'SELECT UOM';
    if (this.warehouses.length == 1) {
      this.listAddForm.get('applicableWareHouses').setValue([]);
    }
  }
  getProductCode(){
    console.log(this.listAddForm.value);
    let catID=this.listAddForm.value.itemCategoryId;
    console.log(this.categories);
    let itemCategoryData = this.categories.filter(itemInArray => itemInArray.id === catID);
    let categoryName=itemCategoryData[0]['categoryName'];
    console.log(categoryName);
    let sub = this.prodService
    .getData(`${PATH.PRODUCTS}/category/productCode?category=${categoryName}`)
    .subscribe(
      (res) => {
      
        this.listAddForm.get('itemNumber').setValue(res['code']);
        this.subscriptions.add(sub);
      },
      (err) => {
        console.log('Unable to get product code');
      }
    );

    let getbyCategory = this.prodService
    .getData(`${PATH.CATEGORIES}/category/${categoryName}`)
    .subscribe(
      (res) => {
      console.log(res);
      this.listAddForm.get('discountPercentage').setValue(res['discountPercentage']);
      this.listAddForm.get('maxLimitPerStaff').setValue(res['maximumLimitPerStaff']);
      this.subscriptions.add(getbyCategory);
      },
      (err) => {
        console.log('Unable to get');
      }
    );

  }
  open() {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'ProductList';
  }

  addHsn(){
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'hsn';
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      if (receivedEntry == 'hsn') {
        this.getHsnCode();
      }
    });
  }

  get f() {
    return this.listAddForm.controls;
  }

  SaveProductData(form) {
    if (this.listAddForm.valid) {
      let payload = form.value;
      payload.applicableWareHouses = [];
      payload['itemNumber'] = this.listAddForm.get('itemNumber').value;
      if (this.isEdit) {
        let sub = this.prodService
          .updateData(`${PATH.PRODUCTS}/${this.productId}`, payload)
          .subscribe(
            (res) => {
              this.subscriptions.add(sub);
              this.toastService.show('Product Updated successfully !!', {
                classname: 'amulyaGreen text-light',
                delay: 10000,
              });

              if (!this.imageChanged) {
                this.showList = false;
              }
              this.categoryId
                ? this.getProductListByCategory(this.categoryId)
                : this.getProductList(this.col, this.order);
              this.viewImage();
              this.imageChanged = false;
            },
            (err) => {
              console.log(err);
              this.toastService.show(err, {
                classname: 'amulyaRed text-light',
                delay: 3000,
              });
            }
          );
      } else {
        let warehouse = form.value.applicableWareHouses;
        payload['applicableWareHouses'] = [];
        // payload['applicableWareHouses'].push(warehouse);
        payload['status'] = 'ACTIVE';
        let sub = this.prodService.postData(payload, 'products').subscribe(
          (res) => {
            this.subscriptions.add(sub);
            this.toastService.show('Product saved successfully !!', {
              classname: 'amulyaGreen text-light',
              delay: 10000,
            });
            if (!this.imageChanged) {
              this.showList = false;
            }
            this.categoryId
              ? this.getProductListByCategory(this.categoryId)
              : this.getProductList(this.col, this.order);
            this.imageChanged = false;
            this.viewImage();
          },
          (err) => {
            this.toastService.show(err, {
              classname: 'amulyaRed text-light',
              delay: 3000,
            });
          }
        );
      }
      // this.showList = false;
    } else {
      this.submitted = true;
      this.listAddForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.toastService.show('Please fill all the required fields', {
        classname: 'bg-danger text-light',
        delay: 10000,
      });
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

  markInactive(product) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'productStatus';
    modalRef.componentInstance.componentData=product;
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      if (receivedEntry == 'hsn') {
        this.getHsnCode();
      }
    });
    // let status;
    // if (product.status == 'ACTIVE') {
    //   status = 'INACTIVE';
    // } else {
    //   status = 'ACTIVE';
    // }
    // let sub = this.prodService
    //   .updateData(`${PATH.PRODUCTS}/${product.id}`, { status: status })
    //   .subscribe(
    //     (res) => {
    //       this.subscriptions.add(sub);
    //       this.toastService.show('Status Updated successfully !!', {
    //         classname: 'amulyaGreen text-light',
    //         delay: 10000,
    //       });
    //       this.categoryId
    //         ? this.getProductListByCategory
    //         : this.getProductList(this.col, this.order);
    //     },
    //     (err) => {
    //       console.log(err);
    //     }
    //   );
  }

  editRow(product) {
    debugger
    this.showList = true;
    product['showMenu'] = false;
    this.isEdit = true;
    this.type = 'Edit';
    this.productId = product.id;
    this.selectedUom = product.unitOfMeasure;
    this.image = '';
    this.listAddForm.patchValue(product);
    this.viewImage();
  }

  formatProducts(page) {
    this.products.map((data, index) => {
      if (data.status == 'ACTIVE') {
        data['markText'] = 'mark Active/InActive';
      } else {
        data['markText'] = 'mark Active/InActive';
      }
    });
    console.log(this.products);
  }

  closeProductForm() {
    if (this.isFormEdited) {
      const modalRef = this.modalService.open(ProductModalComponent);
      modalRef.componentInstance.compName = 'productList';
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
        if (receivedEntry == 'exit') {
          modalRef.close();
          this.listAddForm.reset();
          this.showList = false;
          this.isFormEdited = false;
        }
      });
    } else {
      this.showList = false;
    }
  }

  scrollToTop(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  addNewUom() {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = 'uomList';
    modalRef.componentInstance.type = 'view';
    modalRef.componentInstance.componentData = [
      {
        name: '',
        desc: '',
        code: '',
      },
    ];
    modalRef.componentInstance.err = { showerror: false, errMsg: '' };
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      if (receivedEntry == 'uomSaved') {
        modalRef.close();
      }
    });
  }

  selectUOM(uom) {
    this.listAddForm.get('unitOfMeasure').setValue(uom);
    this.selectedUom = uom;
  }

  showUOM() {
    this.showUom = !this.showUom;
  }

  selectProductNumber(product) {
    if (product) {
     this.filterData.itemName=product.itemName;
     this.filterData.itemNumber=product.itemNumber
    }
  }
  selectProductName(product) {
    if (product) {
      this.filterData.itemNumber=product.itemNumber
    }
  }

  taxableChange(){
    console.log(this.listAddForm.value.taxable);
    debugger
    if(!this.listAddForm.value.taxable){
    this.listAddForm.get('igstPercentage').setValidators(null);
    this.listAddForm.get('igstPercentage').setValue("");
    this.listAddForm.get('igst').setValue("");
    this.listAddForm.get('cgst').setValue("");
    this.listAddForm.get('hgst').setValue("");
    this.listAddForm.get('igstPercentage').setErrors(null);
    }
    if(this.listAddForm.value.taxable){
      this.listAddForm.get('igstPercentage').setValidators(Validators.required);
      }
  }

  itemClick(){
  }
  sortBy(type, details) {
    let order = '';
    order = details.isAsc ? 'asc' : 'desc';
    let sub = this.prodService
      .getData(
        `${PATH.PRODUCTS_ACTIVE}?page=${this.page}&size=${this.pageSize}&sort=${type},${order}`
      )
      .subscribe((res) => {
        this.subscriptions.add(sub);
        details.isAsc = !details.isAsc;
        this.products = res['content'];
        this.collectionSize = res['totalElements'];
        this.formatProducts(this.page);
      });
  }

  Calculation(){
   let cal=this.listAddForm.value;
   if(!cal.cpPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      cp:'',
     })
   }
   if(!cal.dpPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      dp:'',
     })
   }
   if(!cal.bvPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      bv:'',
     })
   }
   if(!cal.ppPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      pp:'',
     })
   }
   if(!cal.igstPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      igst:'', cgst:'',hgst:'',
      cgstPercentage:'',hgstPercentage:''
     })
   }
   if(!cal.cgstPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      cgst:'',
     })
   }
   if(!cal.hgstPercentage || !cal.mrp){
    this.listAddForm.patchValue({
      hgst:'',
     })
   }
   if(!this.listAddForm.value.dp){
    this.listAddForm.patchValue({
      bv:'',pp:'',cgst:'',igst:'',hgst:''
     })
   }

    if(cal.mrp && cal.cpPercentage){
      let res=(cal.mrp*(100-cal.cpPercentage))/100
      this.listAddForm.patchValue({
       cp:parseFloat(res.toFixed()),
      })
    }
    if(cal.mrp && cal.dpPercentage){
      let res=(cal.mrp*(100-cal.dpPercentage))/100
      this.listAddForm.patchValue({
       dp:parseFloat(res.toFixed()),
      })
    }
    if(this.listAddForm.value.dp && cal.bvPercentage){
      let res=(this.listAddForm.value.dp*cal.bvPercentage)/100
      this.listAddForm.patchValue({
       bv:parseFloat(res.toFixed()),
      })
    }
    if(this.listAddForm.value.dp && cal.ppPercentage){
      let res=(this.listAddForm.value.dp*cal.ppPercentage)/100
      this.listAddForm.patchValue({
       pp:parseFloat(res.toFixed()),
      })
    }
    if(this.listAddForm.value.dp && cal.igstPercentage){
      let res=(this.listAddForm.value.dp*cal.igstPercentage)/100
      let gstres=parseFloat(res.toFixed(2))/2;
      this.listAddForm.patchValue({
       igst:parseFloat(res.toFixed(2)),
       cgst:parseFloat(gstres.toFixed(2)),
       hgst:parseFloat(gstres.toFixed(2))
      })
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
