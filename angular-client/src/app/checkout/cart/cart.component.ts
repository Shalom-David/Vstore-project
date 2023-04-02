import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { first } from 'rxjs';
import { Icart, IcartData } from 'src/interfaces/cart';
import { CartsService } from 'src/services/carts.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/services/users.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  @Output() cartData = new EventEmitter<Icart | null>();
  quantityArr: number[] = Array(10);
  cart!: Icart | null;
  productQuantity!: number;
  control = new FormControl('');
  email!: string;
  token!: string;
  constructor(
    private cartService: CartsService,
    private usersService: UsersService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.usersService.userAccessData$.subscribe((data) => {
      if (data.customerEmail && data.token && data.loggedIn) {
        this.email = data.customerEmail;
        this.token = data.token;
      }
    });
    if (this.email && this.token) {
      this.cartService
        .getCart(this.email, this.token)
        .pipe(first())
        .subscribe({
          next: (data) => {
            if (!data) this.cart = null;
            else {
              this.cart = data as Icart;
            }
            this.onCartDataChange();
          },
          error: (error: any) => {
            if (error.status === 404) {
              this.cart = null;
            }
            if (error.status === 403 || error.status === 401) {
              this.usersService.logout();
              this.router.navigate(['login'], { replaceUrl: true });
            }
          },
        });
    }

    this.cartService.cartState$.subscribe((state) => {
      if (state.cartUpdateStatus) {
        this.cartService
          .getCart(this.email, this.token)
          .pipe(first())
          .subscribe({
            next: (data) => {
              if (!data) this.cart = null;
              else {
                this.cart = data as Icart;

                this.cart = data as Icart;
              }
              this.onCartDataChange();
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
  }

  onCartDataChange() {
    this.cartData.emit(this.cart);
  }
  goToHomePage() {
    this.router.navigate([''], { replaceUrl: true });
  }
  updateCart(productId: string, quantity: number) {
    const cartData: IcartData & { update: boolean } = {
      productId,
      quantity,
      customerEmail: this.email,
      update: true,
    };

    this.cartService.updateCart(cartData, this.token).subscribe({
      next: () => this.cartService.setCartStatus(true),
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          this.usersService.logout();
          this.router.navigate(['login'], { replaceUrl: true });
        }
      },
    });
  }
  removeFromCart(productId: string) {
    const cartData: Omit<IcartData, 'quantity'> = {
      customerEmail: this.email,
      productId,
    };
    this.cartService.removeFromCart(cartData, this.token).subscribe({
      next: () => {
        this.cartService.setCartStatus(true);
        this.onCartDataChange();
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          this.usersService.logout();
          this.router.navigate(['login'], { replaceUrl: true });
        }
      },
    });
  }
}
