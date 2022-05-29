import { Component, HostListener, OnInit,ViewChild,ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray,FormControl } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import { email, phone } from '../services/custom.validations';
import { Subscription } from 'rxjs/internal/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
@Component({
  selector: 'app-ledger-transaction',
  templateUrl: './ledger-transaction.component.html',
  styleUrls: ['./ledger-transaction.component.css']
})
export class LedgerTransactionComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  public date: Object = new Date()
  submitted:boolean=false;
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  sales = [];
  col: any = 'createdDate';
  order: any = 'desc';
  distFilterForm: FormGroup;
  filter: boolean = false;
  distributors:any=[];
  statusList:any;
  isVendor:boolean=false;
  consolidate='';
  maxDateValue=new Date();
  minDateValue=new Date();

  filterData = {
    itemName: "",
    itemNumber: '',
    itemPrice: '',
    vendor: '',
    vendorCode: "",
    status:"ACTIVE"
  };

  header = [
    {name: 'S.NO.', APIname: 'sNo', isAsc: true, showSort: true },
    {
      name: 'DATE',
      APIname: 'date',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'Vendor Name',
      APIname: 'vendor',
      isAsc: true,
      showSort: true,
    },
    
    {
      name: 'vch Type',
      APIname: 'vchType',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'Voucher Number',
      APIname: 'voucherNumber',
      isAsc: true,
      showSort: true,
    },
     {
      name: 'amount',
      APIname: 'amount',
      isAsc: true,
      showSort: true,
    },
  ];

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @HostListener('document:click')
  clickout() {
     this.filter = false;
   }
  constructor(    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,) { }

  ngOnInit(): void {
    this.createForm();
    this.route.params.subscribe((res) => {
    console.log(res)
    this.distFilterForm.patchValue({
      vendor:res.name,
      vendorCode:res.id
    })
    });
    // this.getledgers(this.col, this.order);
  }

  createForm() {
    this.distFilterForm = this.fb.group({
      vendor:['',Validators.required],
      vendorCode:[''],
      fromDate: ['',],
      toDate: ['',],
      particulars: [''],
   
    });
   
  }

  get f() { return this.distFilterForm.controls; }

  getledgers(col, order){
    this.prodService
      .getData(
        `${PATH.LEDGER_FILTER}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`
      )
      .subscribe(
        (res) => {
          this.distributors = res['content'];
          this.collectionSize = res['totalElements'];
        },
        (err) => {
          console.log(err);
        }
    );
  }

  onVendorSelection(vendorCode)
  {
    this.distributors=[];
    this.prodService
    .getData(
      `${PATH.VENDOR_CODE}/${vendorCode}`
    )
    .subscribe(
      (res) => {
        console.log(res)
        this.distFilterForm.patchValue({
          vendor:res['vendorName']
        })
       
      },
      (err) => {
        this.toastService.show(err, {
          classname: 'amulyaRed text-light',
          delay: 1000,
        });
        this.distFilterForm.patchValue({
          vendor:''
        })
      }
  );
  } 
  filterDistributor(){
    let payload;
    const filtered:any = {};  
  //   if(this.distFilterForm.value.vendor){
  //   this.distFilterForm.patchValue({
  //     vendorCode:this.distFilterForm.value.vendor.toUpperCase()
  //   })
  // }
    if (this.distFilterForm.valid) {
      for (let key in this.distFilterForm.value) {
        if (this.distFilterForm.value[key]) {
          filtered[key] = this.distFilterForm.value[key];
        }
      }
      console.log(filtered);
    }
    filtered.fromDate=filtered.fromDate?moment((new Date(filtered.fromDate))).format('YYYY-MM-DD'):'';
    filtered.toDate=filtered.toDate?moment((new Date(filtered.toDate))).format('YYYY-MM-DD'):'';
    payload = filtered;
    let sub = this.prodService.postData(payload,`${PATH.LEDGER_FILTER}`).subscribe((res) => {
      console.log(res);

      this.distributors = res.ledgerTransactions;
      this.consolidate=res.consolidatedBalanceAmount;

      console.log(this.distributors);
      this.collectionSize = res['totalElements'];
      this.isVendor=true
    },(err) => {
     console.log(err);
    })

  }

  checkDate(){
    
    if(this.distFilterForm.value.fromDate){
      this.minDateValue=new Date(this.distFilterForm.value.fromDate);
      if(this.distFilterForm.value.toDate){
        if(this.distFilterForm.value.fromDate>this.distFilterForm.value.toDate){
          this.toastService.show('From Date Must Be Less Than To Date', {
            classname: 'amulyaRed text-light',
            delay: 1000,
          });
          this.distFilterForm.patchValue(
            {
              toDate:''
            }
          )
        }
      }
      
    }
  }

  sortBy(type, details) {
    let order = '';
    order = details.isAsc ? 'asc' : 'desc';
    // let sub = this.prodService
    //   .getData(
    //     `${PATH.PRODUCTS_ACTIVE}?page=${this.page}&size=${this.pageSize}&sort=${type},${order}`
    //   )
    //   .subscribe((res) => {
    //     this.subscriptions.add(sub);
    //     details.isAsc = !details.isAsc;
    //     this.products = res['content'];
    //     this.collectionSize = res['totalElements'];
    //     this.formatProducts(this.page);
    //   });
  }

  updatePageSize(){
    this.filterDistributor();
  }

  refreshPages(){
    this.filterDistributor();
  }


}
