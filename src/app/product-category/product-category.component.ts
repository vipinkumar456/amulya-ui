import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ProductsService } from '../services/products.service';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { PATH } from '../constants';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html'
})
export class ProductCategoryComponent implements OnInit {
  @HostListener('document:click')
  clickout() {
    this.categories.map((o) => {
      o.showMenu = false;
    });
   this.showFilter=false; 
  }
  constructor(private modalService: NgbModal, private prodService: ProductsService, private fb: FormBuilder, public toastService: ToastService) { }
  closeResult = '';
  categories: Array<any>=[];
  categoryForm: FormGroup;
  isEdit: boolean;
  showFilter: boolean;

  ngOnInit(): void {
    this.isEdit = false;
    this.showFilter = false;
    this.getCategories('all');
    this.categoryForm = this.fb.group({
      categoryname: ['', Validators.required],
      categorydesc: ['', Validators.required]
    });
  }

  getCategories(type) {
    this.showFilter = false;
    let url = '';
    if (type == '' || type == 'all') {
      url = PATH.CATEGORIES;
    }
    else if (type == 'ACTIVE') { 
      url = `${PATH.CATEGORIES}/ACTIVE`;
    }
    else if (type == 'INACTIVE') { 
      url = `${PATH.CATEGORIES}/INACTIVE`;
    }
    this.prodService.getData(url).subscribe(res => {
      this.formatCategories(res['productCategories']);
      console.log(this.categories);
    }, err => {
      console.log("Unable to get categories");
    })
  }

  toggleFilter() {
    event.stopPropagation()
    this.showFilter = !this.showFilter;
  }

  open(type) {
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = "productCategory";
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.componentData = [{
      name: '', desc: '', code: ''
    }];
    modalRef.componentInstance.err = { showerror: false, errMsg: '' }
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      this.getCategories('all');
      modalRef.close();
    });
  }

  showOptions(e,category) {
    e.stopPropagation();
    category["showMenu"] = !category["showMenu"];
  }

  editRow(e,category) {
    e.stopPropagation();
    console.log(category);
    let type = 'Edit'
    const modalRef = this.modalService.open(ProductModalComponent);
    modalRef.componentInstance.compName = "productCategory";
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.componentData = [{
      name: category.categoryName, desc: category.categoryDescription, code: category.id,
      limit:category.maximumLimitPerStaff,discountPercentage:category.discountPercentage
    }];
    modalRef.componentInstance.sendData.subscribe((receivedEntry) => {
      this.getCategories('all');
      modalRef.close();
    });

  }

  InactiveRow(e,category, index) {
    debugger
    e.stopPropagation();
    let status;
    if (category.activeStatus == "INACTIVE") {
      status = 'ACTIVE'
    } else {
      status = 'INACTIVE'
    }
    category["showMenu"] = false;
    this.prodService.updateData(`${PATH.CATEGORIES}/${category.id}`, { status: status }).subscribe(res => {
      this.toastService.show('Status Updated Successfully !!', { classname: 'amulyaGreen text-light', delay: 10000 });
      this.getCategories('all');
    }, err => {
      console.log(err);
    });
  }

  formatCategories(categories) {
    this.categories = categories;
    this.categories.map((data) => {
      data["showMenu"] = false;
      if (data.activeStatus == "INACTIVE") {
        data["statusText"] = "Mark Active";
      } else {
        data["statusText"] = "Mark Inactive";
      }
    })
  }
}
