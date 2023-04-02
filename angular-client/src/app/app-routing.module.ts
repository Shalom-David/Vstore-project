import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { CartComponent } from './checkout/cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { LoginComponent } from './login/login.component';
import { MainPageComponent } from './main-page/main-page.component';
import { OrdersComponent } from './orders/orders.component';
import { RegistrationComponent } from './registration/registration.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'category/:', component: MainPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'checkout', redirectTo: 'checkout/#Cart', pathMatch: 'full' },
  { path: 'checkout/:step', component: CheckoutComponent },
  { path: 'register', redirectTo: 'register/', pathMatch: 'full' },
  { path: 'register/:step', component: RegistrationComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'admin/:tabName', component: AdminPanelComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
