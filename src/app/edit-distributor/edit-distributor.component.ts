import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/internal/Subscription';
import { PATH } from '../constants';
import { email, pan, phone, pincode } from '../services/custom.validations';
import { ProductsService } from '../services/products.service';
import { ToastService } from '../services/toast.service';
import { ConfirmService } from '../transaction/transaction.service';

@Component({
  selector: 'app-edit-distributor',
  templateUrl: './edit-distributor.component.html'
})
export class EditDistributorComponent implements OnInit {

  distRegForm:FormGroup;
  currentId: any;
  type: any;
  submitted: boolean = false;
  states: any;
  cities: any;
  distributor: any = [];
  bankList:any = [];
  IfscCodeList:any = [];
  branchDetails:any = [];
  errorMessage: any;
  image: any;
  subscriptions: Subscription;
  distRelationship:any;

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
    this.prepareForm();
    this.getStates();
    this.getDistRelation();
    this.getBankList();
    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
        this.getdistributorById(this.currentId);
      }
      if (res.type) {
        this.type = res.type;
      }
    })
  }

  prepareForm(){
    this.distRegForm = this.fb.group({
      sponsorId: ['', [Validators.required]],
      sponsorName: [''],
      sponsorEmail: [''],
      userName: ['', [Validators.required]],
      fatherName: [''],
      dateOfBirth: [''],
      gender: [''],
      email: ['', [Validators.required,email]],
      phoneNumber: ['', [Validators.required,phone]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required]],
      pinCode: ['', [Validators.required, pincode]],
      district:[''],
      tehsil:[''],
      bankName: ['', [Validators.required]],
      branchName: ['', [Validators.required]],
      accountHolderName: ['', Validators.required],
      accountNumber: ['', [Validators.required]],
      confirmAccountNumber:['', [Validators.required]],
      ifscCode: ['', [Validators.required]],
      pan: ['', [Validators.required,pan]],
      nomineeName: ['', [Validators.required]],
      nomineeRelation: ['', [Validators.required]]
    },{ validator: this.checkAccountNo})
  }

  get f() { return this.distRegForm.controls; }

  checkAccountNo(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.get('accountNumber').value;
    let confirmPass = group.get('confirmAccountNumber').value;
    return pass === confirmPass ? null : { notSame: true }
  }

  saveDistributor(){
    this.submitted = true;
    let formVal = this.distRegForm.getRawValue();
    let url = PATH.DISTRIBUTOR_UPDATE + '/' + this.distributor.id;
    let payload = {
      "address": formVal.address,
      "bankInformation": {
        "accountHolderName": formVal.accountHolderName,
        "accountNumber": formVal.accountNumber,
        "bankName": formVal.bankName,
        "branchName": formVal.branchName,
        "ifscCode": formVal.ifscCode,
        "pan": formVal.pan
      },
      "city": formVal.city,
      "dateOfBirth": formVal.dateOfBirth,
      "email": formVal.email,
      "fatherName": formVal.fatherName,
      "gender": formVal.gender,
      "nomineeInformation": {
        "nomineeName": formVal.nomineeName,
        "nomineeRelation": formVal.nomineeRelation
      },
      "phoneNumber": formVal.phoneNumber,
      "pinCode": formVal.pinCode,
      "sponsorId": formVal.sponsorId,
      "sponsorEmail": formVal.sponsorEmail,
      "sponsorName": formVal.sponsorName,
      "state": formVal.state
    }
    if(this.distRegForm.valid){
       this.prodService.patchData(`${url}`,payload).subscribe(
         (res) => {
           this.toastService.show('Distributor details updated successfully !!', {
             classname: 'amulyaGreen text-light',
             delay: 10000,
           })
           this.router.navigate(['distributors']);
         },
         (err) => {
           this.errorMessage=err;
             this.toastService.show(this.errorMessage, {
             classname: 'amulyaRed text-light',
             delay: 10000,
           });
         });
    }
  }

  pincode(ev){
    this.prodService.getData(`${PATH.PINCODE+'?pinCode='+ev.value}`).subscribe(
      (res: any) => {
        if(res){
          this.distRegForm.patchValue({
            state:res.state,
            city:res.city,
            district:res.district
          })
        }else{
          this.distRegForm.patchValue({
            state:'',
            city:'',
            district:''
          })
        }
      },
      (err) => {
        this.distRegForm.patchValue({
          state:'',
          city:'',
          district:''
        })
      }
    );
  }

  getDistRelation(){
    this.prodService.getData(`${PATH.DISTRIBUTOR+'/relationships'}`).subscribe(
      (res: any) => {
        this.distRelationship = res;
      },
      (err) => {
        console.log(err);
      }
    );
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
      .getData(`${PATH.CITIES}/${this.distRegForm.controls['state'].value}`)
      .subscribe(
        (res: any) => {
          this.cities = res;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getdistributorById(id){
    let url = PATH.DISTRIBUTOR + '/' + id;
    this.prodService
      .getData(`${url}`)
      .subscribe(
        (res) => {
          this.distRegForm.controls['sponsorId'].disable();
          this.distributor = res;
          let bankInfo = this.distributor.bankInformation;
          let nomineeInfo = this.distributor.nomineeInformation;
          this.distributor = Object.assign(this.distributor, bankInfo, nomineeInfo);
          this.distRegForm.patchValue(this.distributor);
          if(this.distributor.distributorStatus=='KYC_APPROVED'){
            this.distRegForm.disable();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  downloadDocs(doc){
    console.log(doc)
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

  getBankList(){
    this.prodService.getData(PATH.BANK).subscribe((res) => {
      this.bankList = res;
    })
  }

  getIfscCodeList(){
    this.prodService.getData(`${PATH.BANK}/ifscCodes?bankName=${this.distRegForm.controls['bankName'].value}`).subscribe((res) => {
      this.IfscCodeList = res;
    })
  }

  getBranchDetails(){
    this.prodService.getData(`${PATH.BANK}/bankDetailsByIFSC?ifscCode=${this.distRegForm.controls['ifscCode'].value}`).subscribe((res) => {
      this.branchDetails = res;
      this.distRegForm.patchValue({
        branchName:this.branchDetails.branchName
      })
    })
  }
  accountValidation(){
    let formData=this.distRegForm.value;
    if(formData.accountNumber){
      if(formData.confirmAccountNumber){
        if(formData.confirmAccountNumber!=formData.accountNumber){
          this.toastService.show('Account Number Should Be Match', {
            classname: 'amulyaRed text-light',
            delay: 2000,
          });
          this.distRegForm.patchValue({
            confirmAccountNumber:''
          })
           return false;     
         }
      }
        
    }
  }
  // ngOnDestroy() {
  //   this.subscriptions.unsubscribe();
  // }

}
