import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PATH } from '../constants';
import { ProductsService } from '../services/products.service';
import { ToastService } from '../services/toast.service';
import { ConfirmService } from '../transaction/transaction.service';

@Component({
  selector: 'app-order-quality-check',
  templateUrl: './qc-order.component.html'
})
export class QcOrderComponent implements OnInit {

  headerText = 'Order Quality Check';
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  purchaseForm: FormGroup;
  purchaseOrderItems: FormArray;
  showList: boolean;
  warehouses: any = [];
  vendors = [];
  purchases:any = [];
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
  qcparamFlag:boolean=false;
  rowData;
  isQCApproved:boolean=false;
  qcparamFormArray: Array<any> = [];
  isParamTable:boolean=false;
  constructor(
    private prodService: ProductsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService: ConfirmService
  ) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName');
    this.prepareForm();
    debugger
    this.route.params.subscribe((res) => {
      
      if (res.id) {
        this.currentId = res.id;
      }
      if (res.type) {
        this.type = res.type;
      }
    });
    this.getFormDropdowns();
    this.getPurchaseOrder();
  }

  prepareForm(){
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
  }

  getPurchaseOrder() {
    debugger
    this.prodService
      .getData(`${PATH.PURCHASES}/${this.currentId}`)
      .subscribe((res: any) => {
        this.purchases = res;
        console.log(this.purchases)
        if(this.purchases.status=='QC_APPROVED'){
          this.isQCApproved=true;
        }
        let purchaseitem=res['purchaseOrderItems'];
       
         for(let i=0;i<purchaseitem.length;i++)
         {
           if(purchaseitem[i].qualityCheckStatus!='QC Pending'){
            let qualitycheckArray =purchaseitem[i]['qualityCheck'];
            this.qcparamFormArray= qualitycheckArray.qualityCheckParameters
            this.isParamTable=true;
              if(purchaseitem[i].qualityCheckStatus=='QC Approved'){
                if(!purchaseitem[i]['receivedQuantity']){
                  this.isParamTable=false;
                  }
              }
           }

           else{
            this.isParamTable=false;
           }
          }
         console.log(this.qcparamFormArray)

        res.receivedDate = new Date(res.receivedDate);
        res['purchaseOrderItems'].map((o) => {
          o.itemAmount = o.quantity * o.price;
        });
        // if (this.type != 'view') {
        const control = <FormArray>(
          this.purchaseForm.controls['purchaseOrderItems']
        );
        res['purchaseOrderItems'].forEach((task) => {
          task.showProdList = false;
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

  calculateInvoiceAmount() {
    let total = 0;
    let items = this.purchaseForm.get('purchaseOrderItems') as FormArray;
    items.value.map((item) => {
      total = total + (item.invoicePrice ? item.invoicePrice : 0);
    });
    this.purchaseForm.controls['totalInvoiceAmount'].setValue(total);
  }

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

  qcParam(item){
    let itemVal = item.value
    console.log(itemVal.qualityCheckStatus)
    if(itemVal.qualityCheckStatus!="QC Approved"){
      this.rowData = itemVal;
      this.qcparamFlag = true;
    }
  }

  updateResponse(ev){
    this.ngOnInit();
    this.qcparamFlag = false;
  }

  saveOrderQc(){
    debugger
    let formVal = this.purchaseForm.value;
    let payload;
    let qcFlag = true;
    formVal.purchaseOrderItems.forEach(elm => {
      if(elm.qualityCheckStatus=='"QC Pending"'){
        qcFlag = false
      }
    });
    
    if(qcFlag){
      payload = {
        invoiceNumber:formVal.invoiceNumber,
        purchaseOrderItems:formVal.purchaseOrderItems,
        receivedDate:formVal.receivedDate,
        totalAmount:formVal.totalAmount,
        totalInvoiceAmount:formVal.totalInvoiceAmount
      }
      this.prodService.postData(payload, `${PATH.SAVE_QC}/${this.currentId}`).subscribe(
        (res) => {
          this.toastService.show('Quality Check Saved successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          });
          this.router.navigate(['purchases']);
        },
        (err) => {
          console.log(err);
          this.toastService.show(err, {
            classname: 'amulyaRed text-light',
            delay: 3000,
          });
        }
      );
    }else{
      this.toastService.show('Quality Check not completed !!', {
        classname: 'amulyaRed text-light',
        delay: 5000,
      });
    }

  }

}
