import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import {
  FormControl,
  Validators,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {
  DateFilterFn,
  MatCalendarCellClassFunction,
} from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { IuserDetail } from 'src/interfaces/user';
import { CustomValidatorsService } from 'src/services/custom-validators.service';
import { ErrorsService } from 'src/services/errors.service';
import { OrdersService } from 'src/services/orders.service';
import { UsersService } from 'src/services/users.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  private shouldFormatCardNumber = true;
  private repeatingDates!: Set<string>;
  user!: IuserDetail;
  token!: string;
  paymentForm!: FormGroup;
  currentDate = new Date();
  errorMessage = this.errors.getErrorMessage;
  constructor(
    private datePipe: DatePipe,
    private _formBuilder: FormBuilder,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private customValidators: CustomValidatorsService,
    private errors: ErrorsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usersService.userAccessData$.subscribe((userData) => {
      if (userData.customerEmail && userData.token && userData.loggedIn) {
        this.usersService
          .getUser(userData.customerEmail, userData.token)
          .subscribe({
            next: (data) => {
              this.user = data;
              this.token = userData.token;
              this.paymentForm.patchValue({
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                city: this.user.billingAddress.city,
                street: this.user.billingAddress.street,
              });
              this.ordersService
                .getOrders(this.token)
                .pipe(first())
                .subscribe({
                  next: (data) => {
                    this.repeatingDates = this.getRepeatingDates(data, 3);
                  },
                  error: (error) => {
                    if (error.status === 403 || error.status === 401) {
                      this.usersService.logout();
                      this.router.navigate(['login'], { replaceUrl: true });
                    }
                  },
                });
            },
            error: (error) => {
              if (error.status === 403 || error.status === 401) {
                this.usersService.logout();
                this.router.navigate(['login'], { replaceUrl: true });
              }
            },
          });
      }
    });
    this.paymentForm = this._formBuilder.group({
      firstName: [this.user ? this.user.firstName : '', Validators.required],
      lastName: [this.user ? this.user.lastName : '', Validators.required],
      city: [
        this.user ? this.user.billingAddress.city : '',
        Validators.required,
      ],
      street: [
        this.user ? this.user.billingAddress.street : '',
        Validators.required,
      ],
      date: [
        '',
        [
          Validators.required,
          this.customValidators.dateNotBeforeTodayValidator,
        ],
      ],
      cardNumber: [
        '',
        [Validators.required, Validators.pattern('^\\d{4}(\\s\\d{4}){3}$')],
      ],
    });

    this.formGroupChange.emit(this.paymentForm);
  }

  ngAfterViewInit(): void {
    if (this.shouldFormatCardNumber) {
      this.formatCardNumber();
      this.shouldFormatCardNumber = false;
    }
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const formatedDate = this.datePipe.transform(cellDate, 'dd/MM/yyyy');
      return this.repeatingDates.has(formatedDate!) ? 'custom-date-class' : '';
    }

    return '';
  };

  filterDates: DateFilterFn<Date | null> = (date: Date | null) => {
    if (date) {
      const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy');

      return !this.repeatingDates.has(formattedDate!);
    }
    return false;
  };

  formatCardNumber(): void {
    const input = this.paymentForm.get('cardNumber') as FormControl;
    if (!input.value) {
      return;
    }
    let cardNumber = input.value.replace(/\s+/g, '');

    if (cardNumber.length > 16) {
      cardNumber = cardNumber.substring(0, 16);
    }

    const formattedCardNumber = [];

    for (let i = 0; i < cardNumber.length; i += 4) {
      formattedCardNumber.push(cardNumber.substring(i, i + 4));
    }

    input.setValue(formattedCardNumber.join(' '));
  }

  private getRepeatingDates(orders: any[], threshold: number): Set<string> {
    const dateCount: { [date: string]: number } = {};
    const result = new Set<string>();

    for (const order of orders) {
      const date = order.deliveryDate;
      const dateParts = date.split('/');
      const formatedDate = new Date(
        Date.UTC(
          Number(dateParts[2]),
          Number(dateParts[1]) - 1,
          Number(dateParts[0])
        )
      );
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (
        formatedDate.getTime() >= currentDate.getTime() &&
        order.status !== 'cancelled' &&
        order.status !== 'rejected'
      ) {
        if (dateCount[date]) {
          dateCount[date]++;
        } else {
          dateCount[date] = 1;
        }

        if (dateCount[date] >= threshold) {
          result.add(date);
        }
      }
    }
    return result;
  }
}
