import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { promise } from 'protractor';
import { Subject } from 'rxjs';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Injectable()
export class ConfirmService {
  transactionSubject = new Subject<any>();
  transactionObservable = this.transactionSubject.asObservable();
  constructor(private modalService: NgbModal) {}

  /**
   * Opens a confirmation modal
   * @param options the options for the modal (title and message)
   * @returns {Promise<boolean>} a promise that is fulfilled when the user chooses to confirm
   * or closes the modal
   */
  confirm(): Promise<boolean> {
    let modal = this.modalService.open(ConfirmModalComponent, { size: 'sm' });
    console.log(modal)
    return modal.result.then(res=>{
        if(!res){
            this.transactionSubject.next(true);
            return Promise.resolve(true)
        }else{
          return Promise.resolve(true)
        }
    })
    // return modal.result;
  }
  callComponentMethod(value: any) {
        
  }
}
