import {
  Component,
  inject,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { map } from 'rxjs/operators';

import { Iproduct } from 'src/interfaces/product';
import { ProductService } from 'src/services/products.service';
import { Buffer } from 'buffer';
import { PageEvent } from '@angular/material/paginator';
import { StatesService } from 'src/services/states.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { CartsService } from 'src/services/carts.service';
import { IuserDetail } from 'src/interfaces/user';
import { IcartData, IcartProduct } from 'src/interfaces/cart';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { UsersService } from 'src/services/users.service';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  @ViewChildren('quantitySelect') quantitySelects!: QueryList<MatSelect>;
  @ViewChild('dialogRef') dialogTemplateRef!: TemplateRef<any>;
  private page!: number;
  private category!: string;
  private searchQuery!: string;
  quantityArr: number[] = Array(10);
  dialogRef!: MatDialogRef<any>;
  products!: Iproduct[];
  maxPageCount = 0;
  pageIndex = 0;
  defaultQuantity = 1;
  selectedProduct!: Iproduct;
  user!: IuserDetail;
  token!: string;
  snackBarVerticalPosition!: 'top' | 'bottom';

  constructor(
    private productsService: ProductService,
    private statesService: StatesService,
    private cartService: CartsService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .pipe(
        map(({ matches }) => {
          return matches ? 'top' : 'bottom';
        })
      )
      .subscribe((position) => {
        this.snackBarVerticalPosition = position;
      });
  }

  private openCartSnackBar() {
    const snackBarRef = this._snackBar.open(
      'Successfully Added To Cart!',
      'To Checkout',
      {
        panelClass: ['add-to-cart-snackbar'],
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: this.snackBarVerticalPosition,
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['checkout'], {
        replaceUrl: true,
        fragment: 'Cart',
      });
    });
  }

  private openLoginSnackBar() {
    const snackBarRef = this._snackBar.open(
      'Must be signed in to add items to your cart!',
      'Sign In',
      {
        panelClass: ['login-snackbar'],
        duration: 10000,
        horizontalPosition: 'center',
        verticalPosition: this.snackBarVerticalPosition,
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['login'], {
        replaceUrl: true,
      });
    });
  }

  handlePageEvent(event: PageEvent) {
    if (event.pageIndex > event.previousPageIndex!) {
      this.page = event.pageIndex + 1;
    } else {
      this.page = this.pageIndex;
    }
    this.products = [];
    this.subscribeToProducts(this.category, this.page, this.searchQuery);

    this.pageIndex = event.pageIndex;
  }

  ngOnInit(): void {
    this.statesService.state$.subscribe((state) => {
      this.category = state.selectedOption;
      this.searchQuery = state.selectedSearchOption;
      this.products = [];

      this.subscribeToProducts(this.category, 1, this.searchQuery);
      this.pageIndex = 0;
      this.usersService.userAccessData$.subscribe((userData) => {
        if (userData.customerEmail && userData.token && userData.loggedIn) {
          this.usersService
            .getUser(userData.customerEmail, userData.token)
            .subscribe({
              next: (userDetail) => {
                this.user = userDetail;
                this.token = userData.token;
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
    });
  }
  addToCart(productId: string, quantity: number) {
    if (this.user) {
      const cartData: IcartData = {
        productId,
        quantity,
        customerEmail: this.user.email,
      };

      this.cartService.addToCart(cartData, this.token).subscribe({
        next: () => this.cartService.setCartStatus(true),
        error: (error) => {
          if (error.status === 403 || error.status === 401) {
            this.usersService.logout();
            this.router.navigate(['login'], { replaceUrl: true });
          }
        },
      });
      this.openCartSnackBar();
    } else {
      this.openLoginSnackBar();
    }
  }

  openDialog(dialogTemplateRef: TemplateRef<any>, product: Iproduct) {
    this.dialogRef = this.dialog.open(dialogTemplateRef, {
      width: '400px',
    });
    this.selectedProduct = product;
  }

  subscribeToProducts(category?: string, page?: number, searchQuery?: string) {
    this.productsService
      .getProducts(category, page, searchQuery)
      .pipe(first())
      .subscribe((data) => {
        this.products = Object.entries(data)[0][1];
        this.maxPageCount = Object.entries(data)[1][1];
      });
  }
}
