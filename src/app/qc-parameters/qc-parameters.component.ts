import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PATH } from '../constants';
import { ProductsService } from '../services/products.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-qc-parameters',
  templateUrl: './qc-parameters.component.html'
})
export class QcParametersComponent implements OnInit {

  qcparams:any;
  qcparamForm:FormGroup;
  currentId: any = null;
  @Input() item : any;
  @Output() resItemEvent = new EventEmitter<string>();

  constructor(private prodService: ProductsService,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private fb:FormBuilder) { }

  ngOnInit(): void {
    this.route.params.subscribe((res) => {
      if (res.id) {
        this.currentId = res.id;
      }
    });
    this.prepareForm();
    this.getQcParam()
  }

  getQcParam(){
    this.prodService
      .getData(`${PATH.QTY_CHECK_PARAM}`)
      .subscribe((res: any) => {
        let resData = res;
        this.getQcParam = resData.map(elm=>{return {parameterName: elm, qualityCheckPassed:false}})
        for(let i=0; i<this.getQcParam.length; i++){
          this.addFormItem(this.getQcParam[i])
        }
      })
  }

  addFormItem(data){
    const control = <FormArray>this.qcparamForm.controls['qcparamFormArray']
    control.push(this.qcFormItem(data))
  }

  prepareForm(){
    this.qcparamForm = this.fb.group({
      qualityCheckRemarks: [],
      qcparamFormArray: this.fb.array([])
    })
  }

  qcFormItem(data){
    console.log(data)
    return this.fb.group({
      parameterName: [data.parameterName],
      qualityCheckPassed: [data.qualityCheckPassed],
    })
  }

  get f(){
    return this.qcparamForm.controls;
  }

  qcAction(action){
    let qcparanFormDt = this.qcparamForm.value;
    let qualityCheckParameters = qcparanFormDt.qcparamFormArray;
    qualityCheckParameters.forEach(elm => {
      if(elm.qualityCheckPassed=="true"){
        elm.qualityCheckPassed = true
      }
      if(elm.qualityCheckPassed=="false"){
        elm.qualityCheckPassed = false
      }
    });
    let qualityCheck = {
      qualityCheckParameters: qualityCheckParameters,
      qualityCheckRemarks:qcparanFormDt.qualityCheckRemarks,
      qualityCheckStatus: action
    }

    let payload:any = {};
    payload = this.item;
    payload.qualityCheck = qualityCheck;
    console.log(payload)
    this.prodService.postData(payload, `${PATH.COMPLETE_QC}/${this.currentId}`).subscribe(
      (res) => {
        this.toastService.show('Quality Check successfully !!', {
          classname: 'amulyaGreen text-light',
          delay: 5000,
        });
        this.resItemEvent.emit(action);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  goBack(){
    this.resItemEvent.emit('Go back');
  }

}
