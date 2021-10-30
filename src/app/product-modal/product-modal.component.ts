import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { ToastService } from '../services/toast.service';
import { Subject } from 'rxjs';
import { percentage,email, phone } from '../services/custom.validations';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html'
})
export class ProductModalComponent implements OnInit {
  @Input() compName;
  @Input() type;
  @Input() componentData;
  @Output() sendData: EventEmitter<any> = new EventEmitter();
  subject: Subject<boolean>;

  categoryForm: FormGroup;
  uomForm: FormGroup;
  showCategoryForm: boolean;
  showProductList: boolean;
  showerror: boolean;
  errMsg: string;
  showListConfirmation: boolean;
  commonConf: boolean;
  btnText: string;
  stockList = [
    { details: 'Delhi', quantity: 1201 },
    { details: 'Noida', quantity: 121 },
    { details: 'Pune', quantity: 201 },
    { details: 'Kolkata', quantity: 12 },
    { details: 'Cohin', quantity: 121 },
    { details: 'Trishur', quantity: 11 }
  ]
  showVendorConfirmation: boolean;
  purchaseDeleteConfirmation: boolean;
  showTransactionConfirmation: boolean;
  showTransactionDraftConfirmation: boolean;
  showPurchaseDraftConfirmation: boolean;
  addNewUom: boolean;
  confirmCancel:boolean=false;
  cancelReason={
    reason:null,
    comments:''

  }
  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private prodService: ProductsService, public toastService: ToastService) { }
  get f() { return this.categoryForm.controls; }
  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      categoryname: ['', Validators.required],
      categorydesc: ['', Validators.required],
      discountPercentage: ['', [Validators.required,percentage]],
      maximumLimitPerStaff: ['', Validators.required]
    });
  
    
    this.uomForm = this.fb.group({
      uomname: ['', Validators.required]
    });
    this.showerror = false;
    if (this.compName == 'productCategory') {
      this.showCategoryForm = true;
      this.showProductList = false;
      if (this.type == 'Edit' && this.componentData.length > 0) {
        this.categoryForm.get('categoryname').setValue(this.componentData[0].name);
        this.categoryForm.get('categorydesc').setValue(this.componentData[0].desc);
        this.categoryForm.get('discountPercentage').setValue(this.componentData[0].discountPercentage);
        this.categoryForm.get('maximumLimitPerStaff').setValue(this.componentData[0].limit);
      }
    } else if (this.compName == 'productList' && this.type == 'confirmation') {
      this.showCategoryForm = false;
      this.showProductList = false;
      this.showListConfirmation = true;
      this.purchaseDeleteConfirmation = false;
      this.showTransactionConfirmation = false;
      this.btnText = "Exit Form";
    } else if (this.compName == 'vendorList' && this.type == 'confirmation') {
      this.showCategoryForm = false;
      this.showProductList = false;
      this.showListConfirmation = false;
      this.showVendorConfirmation = true;
      this.purchaseDeleteConfirmation = false;
      this.showTransactionConfirmation = false;
      this.commonConf = true;
    }
    else if (this.compName == 'purchases') {
      if (this.type == 'draftConfirmation') {
        this.showPurchaseDraftConfirmation = true;
        this.purchaseDeleteConfirmation = false;
        this.commonConf = true;
      } else {
        this.showPurchaseDraftConfirmation = false;
        this.purchaseDeleteConfirmation = true;
        this.commonConf = true;
      }
      this.showCategoryForm = false;
      this.showProductList = false;
      this.showListConfirmation = false;
      this.showVendorConfirmation = false;
      this.showTransactionConfirmation = false;
    }
    else if (this.compName == 'transactions') {
      if (this.type == 'draftConfirmation') {
        this.showTransactionConfirmation = false;
        this.showTransactionDraftConfirmation = true;
        this.commonConf = true;
      } else {
        this.commonConf = false;
        this.showTransactionConfirmation = true;
        this.showTransactionDraftConfirmation = false;
      }
      this.showCategoryForm = false;
      this.showProductList = false;
      this.showListConfirmation = false;
      this.showVendorConfirmation = false;
      this.showTransactionConfirmation = false;
    } else if(this.compName == 'uomList') {
      this.addNewUom = true;
    }
    else if(this.compName == 'cancelPO'){

    }else{
      this.showCategoryForm = false;
      this.showProductList = true;
      this.commonConf =  false;
    }
  }

  saveCategory(form) {
    console.log(form.value);
    let recievedData;
    recievedData = form.value;
    let payload = {
      "categoryDescription": form.value.categorydesc,
      "categoryName": form.value.categoryname,
      "discountPercentage": form.value.discountPercentage,
      "maximumLimitPerStaff": form.value.maximumLimitPerStaff,
    }
    if (this.type == 'Edit') {
      this.prodService.updateData(`${PATH.CATEGORIES}/${this.componentData[0].code}`, payload).subscribe(res => {
        this.toastService.show('Category Updated Successfully !!', { classname: 'amulyaGreen text-light', delay: 10000 });
        this.sendData.emit(res);
      }, err => {
        console.log(err);
        if (err.code = 409) {
          this.showerror = true;
          this.errMsg = err.message;
        }
      });
    } else {
      this.prodService.postData(payload, PATH.CATEGORIES).subscribe(res => {
        this.toastService.show('Category Created Successfully !!', { classname: 'amulyaGreen text-light', delay: 10000 });
        this.sendData.emit(res);
      }, err => {
        console.log("Unable to create category")
        this.showerror = true;
        this.errMsg = err.message;
      });
    }
  }

  exit() {
    this.sendData.emit('exit');
  }

  saveDraft() {
    this.sendData.emit('save Draft');
  }

  delete() {
    this.sendData.emit('delete');
  }

  saveUom(form) {
    this.sendData.emit()
  }
  cancelPO(){
    this.sendData.emit(this.cancelReason);
  }
}
