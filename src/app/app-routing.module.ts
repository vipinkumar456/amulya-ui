import { EcomContainerComponent } from './ecom-container/ecom-container.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { AdminroleGuard } from './adminrole.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { ProductCategoryComponent } from './product-category/product-category.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { ContainerComponent } from './container/container.component';
import { VendorComponent } from './vendor/vendor.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { MiscTransactionComponent } from './misc-transaction/misc-transaction.component';
import {
  miscTransactionCanDeactivateService,
  PurchaseCanDeactivateService,
   TransferOrderCanDeactivateService,
} from './misc-transaction/misc-transaction-can-deactivate-guard.service';
import { PurchaseComponent } from './purchase/purchase.component';
import { TransactionComponent } from './transaction/transaction.component';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesOrderComponent } from './sales-order/sales-order.component';
import { InventoryComponent } from './inventory/inventory.component';
import { TransferListComponent} from './transfer-list/transfer-list.component';
import { TransferOrderComponent} from './transfer-order/transfer-order.component';
import { QualityCheckListComponent } from './quality-check-list/quality-check-list.component';
import { QcOrderComponent } from './qc-order/qc-order.component';
import { DistributorListComponent } from './distributor-list/distributor-list.component';
import { DistributorRegistrationComponent } from './distributor-registration/distributor-registration.component';
import { EditDistributorComponent } from './edit-distributor/edit-distributor.component';
import { DistributorKycComponent } from './distributor-kyc/distributor-kyc.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { PaymentmethodsComponent } from './paymentmethods/paymentmethods.component';
import { LedgerTransactionComponent } from './ledger-transaction/ledger-transaction.component';
import { PaymentComponent } from './payment/payment.component';
import { DebitCreditNoteComponent } from './debit-credit-note/debit-credit-note.component';
import { ContinueShoppingComponent } from './continue-shopping/continue-shopping.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ReceiveTransferOrderComponent } from './transfer-list/receive-transfer-order/receive-transfer-order.component';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: ContainerComponent,
    canActivate:[AuthGuard,RoleGuard],
    children: [
      {path: 'dashboard', component: DashboardComponent },
     { path: 'list', component: ProductListComponent },
      { path: 'list/:categoryId', component: ProductListComponent },
      {path: 'vendor', component: VendorComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'inventory', component: InventoryComponent ,},
      { path: 'category', component: ProductCategoryComponent },
      {path: 'purchase', component: PurchaseComponent,
        // canDeactivate: [PurchaseCanDeactivateService],
      },
      {canActivate: [AuthGuard,RoleGuard],
        path: 'purchase/:type/:id',
        component: PurchaseComponent,
        // canDeactivate: [PurchaseCanDeactivateService],
      },
      { canActivate: [AuthGuard,RoleGuard], path: 'sales', component: SalesListComponent },
      { canActivate: [AuthGuard,RoleGuard], path: 'sale', component: SalesOrderComponent },
      { canActivate: [AuthGuard,RoleGuard], path: 'sale/:type/:id', component: SalesOrderComponent },
      {
        canActivate: [AuthGuard],
        path: 'miscTransactions',
        component: MiscTransactionComponent,
      },
      {canActivate: [AuthGuard],
        path: 'miscTransaction/:type', component: TransactionComponent,
        canDeactivate: [miscTransactionCanDeactivateService],
      },
      {canActivate: [AuthGuard],
        path: 'miscTransaction/:type/:id', component: TransactionComponent,
        canDeactivate: [miscTransactionCanDeactivateService],
      },
      {canActivate: [AuthGuard],
        path: 'transfer-list',
        component: TransferListComponent,
      },
      {canActivate: [AuthGuard],
        path: 'transfer-order', component: TransferOrderComponent,
        canDeactivate: [TransferOrderCanDeactivateService],
      },
      { canActivate: [AuthGuard],
        path: 'transfer-order/:type/:id', component: TransferOrderComponent,
        canDeactivate: [TransferOrderCanDeactivateService],
      },
      { canActivate: [AuthGuard],
        path: 'receive-transfer-order/:type/:id', component: ReceiveTransferOrderComponent
      },
      { canActivate: [AuthGuard],
        path: 'quality-check', component: QualityCheckListComponent,
      },
      {canActivate: [AuthGuard],
        path: 'quality-check/:type/:id', component: QcOrderComponent,
      },
      { canActivate: [AuthGuard],
        path: 'distributors', component: DistributorListComponent,
      },
      { canActivate: [AuthGuard],
        path: 'distributor/:type/:id', component: DistributorRegistrationComponent,
      },
      { canActivate: [AuthGuard],
        path: 'distributor-info/:type/:id', component: EditDistributorComponent,
      },
      { canActivate: [AuthGuard],
        path: 'distributor-kyc/:id', component: DistributorKycComponent,
      },
      // { canActivate: [AuthGuard,AdminroleGuard],
      //   path: 'shopping', component: ShoppingComponent,
      // },
      // { canActivate: [AuthGuard,AdminroleGuard],
      //   path: 'shopping/:categoryId/:categoryName', component: ShoppingComponent },
      // { canActivate: [AuthGuard,AdminroleGuard],
      //   path: 'payentmethod', component: PaymentmethodsComponent,
      // },
      { canActivate: [AuthGuard],
        path: 'ledger/:name/:id', component: LedgerTransactionComponent },
      { 
        canActivate: [AuthGuard],
        path: 'payment/:type/:id', component: PaymentComponent,
      },
      { 
        canActivate: [AuthGuard],
        path: 'debit-credit/:type/:id', component: DebitCreditNoteComponent,
      },
    ],
  },
  {
    path: '',
    component: EcomContainerComponent,
    children: [
      { canActivate: [AuthGuard,AdminroleGuard],
        path: 'shopping', component: ShoppingComponent,
      },
      { canActivate: [AuthGuard,AdminroleGuard],
        path: 'shopping/:categoryId/:categoryName', component: ShoppingComponent },
      { canActivate: [AuthGuard,AdminroleGuard],
        path: 'payentmethod', component: PaymentmethodsComponent,
      },
      { canActivate: [AuthGuard,AdminroleGuard],
        path: 'continue-shopping/:type', component: ContinueShoppingComponent,},
    
    ]
  },
  { path: '**', redirectTo: 'login' },
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
  providers: [miscTransactionCanDeactivateService],
})
export class AppRoutingModule {}
