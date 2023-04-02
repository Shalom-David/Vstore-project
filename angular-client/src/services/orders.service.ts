import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Iorder, IplaceOrder } from 'src/interfaces/order';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private ordersUrl = 'http://localhost:8080/order';
  constructor(private httpClient: HttpClient) {}
  private ordersState = {
    orderUpdated: false,
  };

  ordersState$ = new BehaviorSubject(this.ordersState);
  getOrders(token: string, email?: string): Observable<Iorder[]> {
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    if (email) {
      headers = headers.append('customerEmail', email);
    }
    return this.httpClient.get<Iorder[]>(this.ordersUrl, { headers: headers });
  }
  placeOrder(order: IplaceOrder, token: string): Observable<Iorder> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.httpClient.post<Iorder>(this.ordersUrl, order, {
      headers: headers,
    });
  }
  cancelOrder(orderId: { orderId: string }, token: string): Observable<Iorder> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    return this.httpClient.patch<Iorder>(this.ordersUrl, orderId, {
      headers: headers,
    });
  }

  setOrderStatus(status: boolean) {
    this.ordersState.orderUpdated = status;
    this.ordersState$.next(this.ordersState);
  }
}
