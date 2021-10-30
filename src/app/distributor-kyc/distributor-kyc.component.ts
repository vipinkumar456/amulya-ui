import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PATH } from '../constants';
import { ProductsService } from '../services/products.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-distributor-kyc',
  templateUrl: './distributor-kyc.component.html'
})
export class DistributorKycComponent implements OnInit {
  currentId: any;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  imageChanged: boolean = false;
  subscriptions: Subscription;
  fileUploadPayload:any=[];
  docType: any;
  distributor: any = [];
  isFileUploaded:boolean=false;
  isPanCard:boolean=false;
  isResidentialFront:boolean=false;
  isResidentialBack:boolean=false;
  isCancelledCheque:boolean=false;
  imagePan: any;
  imageResidentialFront: any;
  imageResidentialBack: any;
  imageCancelledCheque: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private prodService: ProductsService,
    public toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
        this.getdistributorById(this.currentId);
      }
    })
  }

  updateKyc(){
    let payload = this.fileUploadPayload;
    console.log(payload.length)
    let url = PATH.DISTRIBUTOR_KYC + '/' + this.distributor.id;
    if(this.isFileUploaded && payload.length==4){
      this.prodService.patchData(`${url}`,payload).subscribe((res) => {
          this.toastService.show('KYC document uploaded successfully !!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          })
          this.router.navigate(['distributors']);
        },
        (err) => {
          console.log(err);
        }
      );
    }else{
      this.toastService.show('KYC document not uploaded !!', {
        classname: 'amulyaRed text-light',
        delay: 5000,
      })
    }
  }

  getdistributorById(id){
    let url = PATH.DISTRIBUTOR + '/' + id;
    this.prodService
      .getData(`${url}`)
      .subscribe(
        (res) => {
          this.distributor = res;
    })
  }

  selectFiles(type) {
    this.docType = type;
    this.fileInput.nativeElement.click();
  }

  uploadFile() {
    let fileUploadDetails = {
      documentType: "",
      documentTypeName: "",
      file: ""
    }
    const fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      let size = fileBrowser.files[0].size / 1024 / 1024;
      const formData = new FormData();
      formData.append('file', fileBrowser.files[0]);
      let sub = this.prodService.uploadFile(formData).subscribe(
        (res) => {
          fileUploadDetails.documentType = this.docType
          fileUploadDetails.file = res['payload'].fileName;
          // this.subscriptions.add(sub);
          this.imageChanged = true;
          this.fileInput.nativeElement.value = '';
          this.fileUploadPayload.push(fileUploadDetails);
          console.log(this.fileUploadPayload)
          this.isFileUploaded = true;
          this.getUploadedImg(fileUploadDetails);
          this.toastService.show(fileUploadDetails.documentType+ ' updated successfully!!', {
            classname: 'amulyaGreen text-light',
            delay: 10000,
          })
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
        .downloadFile(doc.file)
        .subscribe((res) => {
          if(doc.documentType=='PAN_CARD'){
            this.isPanCard = true;
            this.imagePan = res['payload'];
          }
          if(doc.documentType=='RESIDENTIAL_PROOF_FRONT'){
            this.isResidentialFront = true;
            this.imageResidentialFront = res['payload'];
          }
          if(doc.documentType=='RESIDENTIAL_PROOF_BACK'){
            this.isResidentialBack = true;
            this.imageResidentialBack = res['payload'];
          }
          if(doc.documentType=='CANCELLED_CHEQUE'){
            this.isCancelledCheque = true;
            this.imageCancelledCheque = res['payload'];
          }
          this.subscriptions.add(sub);
    });
  }

}
