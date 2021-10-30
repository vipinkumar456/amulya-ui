import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { ProductCategoryComponent } from './product-category/product-category.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductsService } from './services/products.service';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { LoginComponent } from './login/login.component';
import { ContainerComponent } from './container/container.component';
import { AuthService } from './services/auth.service';
import {
  AppInterceptor,
  authInterceptorProviders,
} from './services/interceptor';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { VendorComponent } from './vendor/vendor.component';
import { AuthGuard } from './auth.guard';
import { PurchasesComponent } from './purchases/purchases.component';
import { MiscTransactionComponent } from './misc-transaction/misc-transaction.component';
import { ToastComponent } from './toast/toast.component';
import { ToastService } from './services/toast.service';
import { miscTransactionCanDeactivateService, PurchaseCanDeactivateService, TransferOrderCanDeactivateService } from './misc-transaction/misc-transaction-can-deactivate-guard.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PurchaseComponent } from './purchase/purchase.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { TransactionComponent } from './transaction/transaction.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { ConfirmService } from './transaction/transaction.service';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesOrderComponent } from './sales-order/sales-order.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InventoryComponent } from './inventory/inventory.component';
import { MinValidatorDirective } from './services/min.validator';
import { NgSelectModule } from '@ng-select/ng-select';
import { TransferOrderComponent } from './transfer-order/transfer-order.component';
import { TransferListComponent } from './transfer-list/transfer-list.component';
import { ErrorsComponent } from './services/errors/errors.component';
import { QualityCheckListComponent } from './quality-check-list/quality-check-list.component';
import { QcOrderComponent } from './qc-order/qc-order.component';
import { QcParametersComponent } from './qc-parameters/qc-parameters.component';
import { DistributorListComponent } from './distributor-list/distributor-list.component';
import { DistributorRegistrationComponent } from './distributor-registration/distributor-registration.component';
import { EditDistributorComponent } from './edit-distributor/edit-distributor.component';
import { DistributorKycComponent } from './distributor-kyc/distributor-kyc.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PaymentmethodsComponent } from './paymentmethods/paymentmethods.component';

export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'YYYY-MM-DD HH:mm:ss',
  parseInput: 'YYYY-MM-DD HH:mm:ss',
  datePickerInput: 'YYYY-MM-DD HH:mm:ss',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
  };
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ProductCategoryComponent,
    SidenavComponent,
    DashboardComponent,
    ProductListComponent,
    ProductModalComponent,
    LoginComponent,
    ContainerComponent,
    VendorComponent,
    PurchasesComponent,
    MiscTransactionComponent,
    ToastComponent,
    PurchaseComponent,
    TransactionComponent,
    ConfirmModalComponent,
    SalesListComponent,
    SalesOrderComponent,
    InventoryComponent,
    MinValidatorDirective,
    TransferOrderComponent,
    TransferListComponent,
    ErrorsComponent,
    QualityCheckListComponent,
    QcOrderComponent,
    QcParametersComponent,
    DistributorListComponent,
    DistributorRegistrationComponent,
    EditDistributorComponent,
    DistributorKycComponent,
    ShoppingComponent,
    PaymentmethodsComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    InfiniteScrollModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxSpinnerModule,
    NgSelectModule,
    NgbDropdownModule
  ],
  providers: [
    authInterceptorProviders,
    ProductsService,
    AuthService,
    AuthGuard,
    ToastService,
    miscTransactionCanDeactivateService,PurchaseCanDeactivateService,TransferOrderCanDeactivateService,
    { provide: OWL_DATE_TIME_LOCALE, useValue: "EN" },
    ConfirmService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ProductModalComponent,ConfirmModalComponent],
})
export class AppModule {}
