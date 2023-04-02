import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs';
import { OrdersComponent } from '../orders/orders.component';
import { UsersService } from 'src/services/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTab } from '@angular/material/tabs';
import { OrdersService } from 'src/services/orders.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent implements AfterViewInit, OnDestroy {
  @ViewChildren(MatTab)
  tabs!: QueryList<MatTab>;
  @ViewChild('ordersComponent', { static: false })
  ordersComponent!: OrdersComponent;
  snackBarVerticalPosition!: 'top' | 'bottom';
  token!: string;
  role!: string;
  selectedIndex = 0;
  tabNames: string[] = [];
  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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

  openSnackBar() {
    this._snackBar.open('You do not have permissions!', undefined, {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: this.snackBarVerticalPosition,
    });
  }
  onTabChange(index: number): void {
    this.router.navigate(['admin', this.tabNames[index]]);
    if (this.selectedIndex === 2) {
      this.usersService.userAccessData$.subscribe((accessData) => {
        if (
          accessData.customerEmail &&
          accessData.token &&
          accessData.loggedIn
        ) {
          this.usersService
            .getUser(accessData.customerEmail, accessData.token)
            .subscribe({
              next: (data) => {
                this.token = accessData.token;
                this.role = data.role;
                if (data.role === 'admin') {
                  this.ordersComponent.subscribeToOrders(this.token);
                }
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
  }

  ngAfterViewInit(): void {
    this.tabNames = this.tabs.map((tab) => tab.textLabel);
    this.route.paramMap.subscribe((params) => {
      const tabName = params.get('tabName');
      if (tabName) {
        const tabIndex = this.tabNames.indexOf(tabName);
        this.selectedIndex = tabIndex === -1 ? 0 : tabIndex;
        this.cdr.detectChanges();
      }
    });
  }
  ngOnDestroy() {
    this.ordersService.setOrderStatus(false);
  }
}
