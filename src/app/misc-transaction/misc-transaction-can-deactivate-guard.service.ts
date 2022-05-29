import { Injectable, Input } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { PurchaseComponent } from '../purchase/purchase.component';
import { TransactionComponent } from '../transaction/transaction.component';
import { ConfirmService } from '../transaction/transaction.service';
 import { TransferOrderComponent } from '../transfer-order/transfer-order.component';

@Injectable()
export class miscTransactionCanDeactivateService implements CanDeactivate<TransactionComponent> {
    constructor(private confirmService:ConfirmService){}
    canDeactivate(component : TransactionComponent) : Promise<boolean> {
        if(component.transactionForm.touched) {
          // return true
          return this.confirmService.confirm()
            // return confirm("Are you sure you want to exit form ?");
        }
        return Promise.resolve(true);
    }
};

@Injectable()
export class PurchaseCanDeactivateService implements CanDeactivate<PurchaseComponent> {
    constructor(private confirmService:ConfirmService){}
    canDeactivate(component : PurchaseComponent) : Promise<boolean> {
        if(component.purchaseForm.touched) {
          // return true
          return this.confirmService.confirm()
            // return confirm("Are you sure you want to exit form ?");
        }
        return Promise.resolve(true);
    }
}
@Injectable()
export class TransferOrderCanDeactivateService implements CanDeactivate<TransferOrderComponent> {
    constructor(private confirmService:ConfirmService){}
    canDeactivate(component : TransferOrderComponent) : Promise<boolean> {
        if(component.transferForm.touched) {
          // return true
          return this.confirmService.confirm()
            // return confirm("Are you sure you want to exit form ?");
        }
        return Promise.resolve(true);
    }
}