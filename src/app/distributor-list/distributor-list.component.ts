import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PATH } from '../constants';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-distributor-list',
  templateUrl: './distributor-list.component.html'
})
export class DistributorListComponent implements OnInit {

  page = 1;
  pageSize = 10;
  collectionSize = 0;
  sales = [];
  col: any = 'createdDate';
  order: any = 'desc';
  distributors:any=[];
  distFilterForm:FormGroup;
  statusList:any;

  header = [
    {name: 'S.NO.', APIname: 'sNo', isAsc: true, showSort: true },
    {name: 'MEMBER ID', APIname: 'memberId', isAsc: true, showSort: true},
    {
      name: 'MEMBER NAME',
      APIname: 'memberName',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'DATE OF REG.',
      APIname: 'dateOfReg',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'SPONSOR ID',
      APIname: 'dateOfReg',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'SPONSOR NAME',
      APIname: 'dateOfReg',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'ACTIVATION DATE',
      APIname: 'dateOfReg',
      isAsc: true,
      showSort: true,
    },
    {
      name: 'STATUS',
      APIname: 'distributorStatusName',
      isAsc: true,
      showSort: true,
      width:''
    },
    {
      name: '',
      APIname: '',
      width:'200px'
    },
    {
      name: '',
      APIname: '',
      width:'200px'
    }
  ];
  cities: any;
  states: any;

  constructor(
    private prodService: ProductsService,
    private fb:FormBuilder
  ) { }

  ngOnInit(): void {
    this.getdistributors(this.col, this.order);
    this.filterForm();
    this.getStates();
    this.getStatusList();
  }

  filterForm(){
    this.distFilterForm = this.fb.group({
       distributorCode: [''],
       distributorStatus: [''],
       fromDate: [''],
       pan: [''],
       sponsorCode: [''],
       state: [''],
       toDate: [''],
       subscription: [''],
       city: ['']
    })
  }

  getStatusList(){
    this.prodService.getData(`${PATH.DISTSTATUS}`).subscribe((res) =>{
      this.statusList = res;
    })
  }

  getdistributors(col, order){
    this.prodService
      .getData(
        `${PATH.DISTRIBUTOR}?page=${this.page}&size=${this.pageSize}&sort=${col},${order}`
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

  getStates() {
    this.prodService.getData(`${PATH.STATES}`).subscribe(
      (res: any) => {
        this.states = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onStateSelect() {
    // console.log(eve)
    this.prodService
      .getData(`${PATH.CITIES}/${this.distFilterForm.controls['state'].value}`)
      .subscribe(
        (res: any) => {
          this.cities = res;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  filterDistributor(){
    let payload;
    const filtered = {};
    if (this.distFilterForm.valid) {
      for (let key in this.distFilterForm.value) {
        if (this.distFilterForm.value[key]) {
          filtered[key] = this.distFilterForm.value[key];
        }
      }
      console.log(filtered);
    }
    payload = filtered;
    let sub = this.prodService.postData(payload,`${PATH.DISTRIBUTOR_FILTER}`).subscribe((res) => {
      this.distributors = res['content'];
      this.collectionSize = res['totalElements'];
    },(err) => {
     console.log(err);
    })

  }

  updatePageSize(){
    
  }

  refreshPages(){
    
  }

}
