import {
  Component,
  HostListener,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { first, map, Observable, startWith } from 'rxjs';
import { Icart } from 'src/interfaces/cart';
import { Iproduct, IsearchProducts } from 'src/interfaces/product';
import { IuserDetail } from 'src/interfaces/user';
import { ProductService } from 'src/services/products.service';
import { StatesService } from 'src/services/states.service';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { CartsService } from 'src/services/carts.service';
import { UsersService } from 'src/services/users.service';
@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css'],
})
export class MainNavComponent implements OnInit {
  @ViewChild(MatAutocomplete) autocomplete!: MatAutocomplete;
  optionsByCategory: IsearchProducts[] = [];
  searchOptions: IsearchProducts[] = [];
  filteredOptions!: Observable<IsearchProducts[]>;
  user!: IuserDetail | null;
  cart!: Icart | null;
  categories: string[] = [];
  token!: string;
  control = new FormControl('');
  constructor(
    private productsService: ProductService,
    private statesService: StatesService,
    private cartService: CartsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usersService.userAccessData$.subscribe((userData) => {
      console.log('userData');
      console.log(userData);
      if (userData.customerEmail && userData.token && userData.loggedIn) {
        this.token = userData.token;
        this.usersService
          .getUser(userData.customerEmail, userData.token)
          .subscribe({
            next: (data) => {
              this.user = data;
            },
            error: (error) => {
              if (error.status === 403 || error.status === 401) {
                this.usersService.logout();
                this.router.navigate(['login'], { replaceUrl: true });
              }
            },
          });

        this.cartService
          .getCart(userData.customerEmail, userData.token)
          .pipe(first())
          .subscribe({
            next: (data) => {
              if (!data) this.cart = null;
              else this.cart = data as Icart;
            },
            error: (error: any) => {
              if (error.status === 403 || error.status === 401) {
                this.usersService.logout();
                this.router.navigate(['login'], { replaceUrl: true });
              }
            },
          });
      } else {
        this.cart = null;
        this.user = null;
      }
    });
    this.productsService
      .getProducts()
      .pipe(first())
      .subscribe((data) => {
        Object.entries(data)[0][1].forEach((product: Iproduct) => {
          this.searchOptions.push({
            name: product.name,
            category: product.category,
          });
          if (!this.categories.includes(product.category))
            this.categories.push(product.category);
        });
      });

    this.cartService.cartState$.subscribe((state) => {
      if (state.cartUpdateStatus) {
        this.cartService
          .getCart(this.user!.email, this.token)
          .pipe(first())
          .subscribe({
            next: (data) => {
              if (!data) this.cart = null;
              else this.cart = data as Icart;
            },
            error: (error: any) => {
              if (error.status === 403 || error.status === 401) {
                this.usersService.logout();
                this.router.navigate(['login'], { replaceUrl: true });
              }
            },
          });
      }
    });
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
  goTo(endpoint: string, fragment?: string) {
    if (fragment) {
      this.router.navigate([endpoint], {
        replaceUrl: true,
        fragment: fragment,
      });
    } else {
      this.router.navigate([endpoint], { replaceUrl: true });
    }
  }

  logout() {
    this.usersService.logout();
    this.router.navigate([''], { replaceUrl: true });
    console.log(this.usersService.userAccessData$);
  }
  selectedSearchOption(event?: MatAutocompleteSelectedEvent, clear?: boolean) {
    switch (true) {
      case clear:
        this.control.reset('');
        return this.statesService.setSelectedSearchOption('');

      case event && !clear:
        return this.statesService.setSelectedSearchOption(event!.option.value);

      case !clear && !event:
        return this.statesService.setSelectedSearchOption(
          this.control.value as string
        );
      default:
        return;
    }
  }

  onOptionSelect(event: MatSelectChange) {
    this.statesService.setSelectedOption(event.value);
    this.optionsByCategory = this.searchOptions.filter(
      (option) => option.category === event.value
    );
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): IsearchProducts[] {
    const filterValue = this._normalizeValue(value);
    return (
      this.optionsByCategory.length
        ? this.optionsByCategory
        : undefined || this.searchOptions
    ).filter((option) =>
      this._normalizeValue(option.name).includes(filterValue)
    );
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
}
