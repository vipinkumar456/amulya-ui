import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PATH } from '../constants';
import { email, phone } from '../services/custom.validations';
import { ProductsService } from '../services/products.service';
import { ToastService } from '../services/toast.service';
import { ConfirmService } from '../transaction/transaction.service';

@Component({
  selector: 'app-distributor-registration',
  templateUrl: './distributor-registration.component.html'
})
export class DistributorRegistrationComponent implements OnInit {

  distRegForm:FormGroup;
  sponsorInfo: any;
  sponsorFlag:boolean=false;
  submitted: boolean = false;
  currentId: any;
  type: any;
  headerText: string;
  distributor: any;
  errorMessage: any;

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
    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
        this.getdistributorById(this.currentId);
      }
      if (res.type) {
        this.type = res.type;
        if (res.type == 'registration') {
          this.headerText = 'Distributor Registration';
        }else if(res.type == 'edit'){
          this.headerText = 'Edit Distributor Name';
        }
      }
    })
  }

  getSponsorInfo(){
    let distributorId = this.distRegForm.get('sponsorId').value;
    let url = PATH.DISTRIBUTOR + '/' + distributorId
    this.prodService
      .getData(`${url}`)
      .subscribe(
        (res) => {
          this.sponsorInfo = res;
          this.sponsorFlag = true;
          this.distRegForm.patchValue({
            sponsorName:this.sponsorInfo.name,
            sponsorEmail:this.sponsorInfo.email
          })
        },
        (err) => {
          this.sponsorFlag = false;
          this.distRegForm.patchValue({
            sponsorName:'',
            sponsorEmail:''
          })
          this.toastService.show("Invalid Sponsor ID", {
            classname: 'amulyaRed text-light',
         });
        }
    );
  }

  getdistributorById(id){
    let url = PATH.DISTRIBUTOR + '/' + id;
    this.prodService
      .getData(`${url}`)
      .subscribe(
        (res) => {
          this.distributor= res;
          this.distRegForm.controls['sponsorId'].disable();
          this.distRegForm.patchValue({
            sponsorId:this.distributor.sponsorId,
            sponsorName:this.distributor.sponsorName,
            sponsorEmail:this.distributor.sponsorEmail,
            placement:this.distributor.placement,
            email:this.distributor.email,
            phoneNumber:this.distributor.phoneNumber,
            name:this.distributor.name
          })
        },
        (err) => {
          console.log(err);
        }
      );
  }

  prepareForm(){
    this.distRegForm = this.fb.group({
      sponsorId: ['', Validators.required],
      sponsorName: ['', Validators.required],
      sponsorEmail: ['', Validators.required],
      placement: ['', Validators.required],
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required,phone]],
      email: ['', [Validators.required,email]],
      codeConduct: ['', [Validators.required]],
      termCondition: ['', [Validators.required]]
    })
  }

  get f() { return this.distRegForm.controls; }

  saveDistributor(){
    this.submitted = true;
    let payload = this.distRegForm.getRawValue();
    console.log(payload);
    if(!this.sponsorFlag && this.distRegForm.invalid){
      this.toastService.show("Please Validate Input Field", {
        classname: 'amulyaRed text-light',
      });
      return
    }
    let sub = this.prodService.postData(payload,`${PATH.DISTRIBUTOR_REG}`)
       .subscribe((res) => {
         this.toastService.show('Distributor registered successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
         });
       this.router.navigate(['distributors']);
    },(err) => {
      this.errorMessage=err;
      this.toastService.show(this.errorMessage, {
        classname: 'amulyaRed text-light',
        delay: 10000,
      });
    })
  }

  updateDistributor(){
    this.submitted = true;
    let payload = this.distRegForm.getRawValue();
    let url = PATH.DISTRIBUTOR_NAME_UPDATE + '/' + this.distributor.id;
    let sub = this.prodService
       .patchData(`${url}`,payload)
       .subscribe((res) => {
         this.toastService.show('Distributor updated successfully !!', {
         classname: 'amulyaGreen text-light',
         delay: 10000,
       });
       this.router.navigate(['distributors']);
    },(err) => {
      this.errorMessage=err;
      this.toastService.show(this.errorMessage, {
      classname: 'amulyaRed text-light',
      delay: 10000,
   });
    })
  }

  termCondition(){
    window.open('assets/Code of Conduct-converted.pdf', '_blank');
  }

}
