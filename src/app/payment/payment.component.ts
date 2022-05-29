import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ToastService } from '../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { ConfirmService } from '../transaction/transaction.service';
import * as moment from 'moment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  paymentAddForm: FormGroup;
  paymentItems: FormArray;
  currentId: any = null;
  voucherNumber:any;
  date=new Date();
  
  paymentData = {
    transactionDate: "",
    vendorCode:"",
    vendor:"",
    voucherType: '',
    voucherNumber: '',
    amount: ''
  };

  constructor( private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService: ConfirmService) { }

  ngOnInit(): void {
    this.route.params.subscribe((res) => {
      this.paymentForm();
      if (res.id) {
        this.currentId = res.id;
        this.paymentData.vendorCode=res.id; 
        this.paymentData.vendor=res.type;
        console.log(res);
      } 
     
    });
  }
  
  paymentForm() {
    this.paymentAddForm = this.fb.group({
  
      paymentItems: this.fb.array([this.createPaymentItem()]),
    });
  }
  createPaymentItem(): FormGroup {
    return this.fb.group({
      transactionDate: [''],
      vendorCode: [''],
      vendor: ['',Validators.required],
      voucherType: [''],
      voucherNumber: [''],
      amount: ['']
    });
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
 }
  onVendorSelection(vendorCode)
  {
    this.prodService
    .getData(
      `${PATH.VENDOR_CODE}/${vendorCode}`
    )
    .subscribe(
      (res) => {
        console.log(res)
        this.paymentData.vendor=res['vendorName'];
        // const faControl = 
        // (<FormArray>this.paymentAddForm.controls['paymentItems']).at(0);
        // faControl['controls'].vendor.setValue(res['vendorName']);
       
      },
      (err) => {
        this.toastService.show(err, {
          classname: 'amulyaRed text-light',
          delay: 1000,
        });
        this.paymentData.vendor='';
        // const faControl = 
        // (<FormArray>this.paymentAddForm.controls['paymentItems']).at(0);
        // faControl['controls'].vendor.setValue('');
      }
  );
  } 


  makePayment(){
    console.log(this.paymentData);
    if(this.paymentData.transactionDate){
      this.paymentData.transactionDate=moment((new Date(this.paymentData.transactionDate))).format('YYYY-MM-DD')
    }
    let payload=this.paymentData;
    this.prodService.postData(payload, PATH.LEDGERPAYMENT).subscribe(
      (res) => {
        this.toastService.show('Payment successfully !!', {
          classname: 'amulyaGreen text-light',
          delay: 10000,
        });
        this.router.navigate(['vendor']);
      },
      (err) => {
        this.toastService.show(err, {
          classname: 'amulyaRed text-light',
          delay: 10000,
        });
      }
    );
  }
}
