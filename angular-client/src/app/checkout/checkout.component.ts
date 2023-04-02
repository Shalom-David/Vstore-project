import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from 'src/services/orders.service';
import { Iorder, IplaceOrder } from 'src/interfaces/order';
import { StatesService } from 'src/services/states.service';
import { Icart } from 'src/interfaces/cart';
import { CartsService } from 'src/services/carts.service';
import { UsersService } from 'src/services/users.service';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  paymentFormGroup = this._formBuilder.group({
    control: ['', Validators.required],
  });

  stepperOrientation: Observable<StepperOrientation>;
  @ViewChild(MatStepper) stepper!: MatStepper;
  order!: Iorder;
  email!: string;
  token!: string;
  completed = false;
  constructor(
    private _formBuilder: FormBuilder,
    breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private cartService: CartsService
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }
  ngOnInit(): void {
    this.usersService.userAccessData$.subscribe((data) => {
      if (data.customerEmail && data.token && data.loggedIn) {
        this.email = data.customerEmail;
        this.token = data.token;
      }
    });
  }

  ngAfterViewInit(): void {
    this.setStepByFragment();
    this.updateFragmentOnStepChange();
  }

  onCartDataChange(cart: Icart | null) {
    if (cart) this.completed = true;
    else this.completed = false;
  }
  paymentFormGroupChanged(formGroup: FormGroup): void {
    this.paymentFormGroup = formGroup;
  }
  placeOrder() {
    const date: string = this.paymentFormGroup.get('date')?.value!;
    const order: IplaceOrder = {
      customerEmail: this.email,
      billingAddress: {
        city: this.paymentFormGroup.get('city')!.value,
        street: this.paymentFormGroup.get('street')!.value,
      },
      deliveryDate: date.toLocaleString().split(',')[0],
      creditCard: this.paymentFormGroup.get('cardNumber')!.value,
    };
    this.ordersService.placeOrder(order, this.token).subscribe({
      next: (data) => {
        this.order = data;
        this.cartService.setCartStatus(true);
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          this.usersService.logout();
          this.router.navigate(['login'], { replaceUrl: true });
        }
      },
    });
  }

  private setStepByFragment(): void {
    const stepName = this.route.snapshot.fragment;
    if (stepName) {
      const stepIndex = this.switchLabelToStepIndex(stepName);
      if (stepIndex !== -1) {
        this.stepper.selectedIndex = stepIndex;
      } else {
        this.router.navigate(['checkout']); // navigate to default step
      }
    }
  }

  private updateFragmentOnStepChange(): void {
    this.stepper.selectionChange.subscribe((change) => {
      const stepName = change.selectedStep?.label;
      if (stepName) {
        this.router.navigate(['checkout'], { fragment: stepName });
      }
    });
  }

  private switchLabelToStepIndex(label: string): number {
    return this.stepper._steps
      .toArray()
      .findIndex((step) => step.label === label);
  }
}
