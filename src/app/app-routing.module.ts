import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
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
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ContainerComponent,
    children: [
      { path: 'category', component: ProductCategoryComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'list', component: ProductListComponent },
      { path: 'list/:categoryId', component: ProductListComponent },
      { path: 'vendor', component: VendorComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'inventory', component: InventoryComponent },
      {
        path: 'purchase',
        component: PurchaseComponent,
        // canDeactivate: [PurchaseCanDeactivateService],
      },
      {
        path: 'purchase/:type/:id',
        component: PurchaseComponent,
        // canDeactivate: [PurchaseCanDeactivateService],
      },
      { path: 'sales', component: SalesListComponent },
      { path: 'sale', component: SalesOrderComponent },
      { path: 'sale/:type/:id', component: SalesOrderComponent },
      {
        path: 'miscTransactions',
        component: MiscTransactionComponent,
      },
      {
        path: 'miscTransaction/:type', component: TransactionComponent,
        canDeactivate: [miscTransactionCanDeactivateService],
      },
      {
        path: 'miscTransaction/:type/:id', component: TransactionComponent,
        canDeactivate: [miscTransactionCanDeactivateService],
      },
      {
        path: 'transfer-list',
        component: TransferListComponent,
      },
      {
        path: 'transfer-order', component: TransferOrderComponent,
        canDeactivate: [TransferOrderCanDeactivateService],
      },
      { 
        path: 'transfer-order/:type/:id', component: TransferOrderComponent,
        canDeactivate: [TransferOrderCanDeactivateService],
      },
      { 
        path: 'quality-check', component: QualityCheckListComponent,
      },
      {
        path: 'quality-check/:type/:id', component: QcOrderComponent,
      },
      { 
        path: 'distributors', component: DistributorListComponent,
      },
      { 
        path: 'distributor/:type/:id', component: DistributorRegistrationComponent,
      },
      { 
        path: 'distributor-info/:type/:id', component: EditDistributorComponent,
      },
      { 
        path: 'distributor-kyc/:id', component: DistributorKycComponent,
      },
      { 
        path: 'shopping', component: ShoppingComponent,
      },
      { 
        path: 'payentmethod', component: PaymentmethodsComponent,
      },
    ],
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
