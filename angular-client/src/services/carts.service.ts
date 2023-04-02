import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Icart, IcartData } from '../interfaces/cart';

@Injectable({
  providedIn: 'root',
})
export class CartsService {
  private cartsUrl = 'http://localhost:8080/cart';
  constructor(private httpClient: HttpClient) {}
  private cartState = {
    cartProducts: [] as Omit<IcartData, 'customerEmail'>[],
    cartUpdateStatus: false,
  };

  cartState$ = new BehaviorSubject(this.cartState);
  getCart(email: string, token: string): Observable<Icart | string> {
    const headers = new HttpHeaders({
      customerEmail: email,
      Authorization: 'Bearer ' + token,
    });
    return this.httpClient.get<Icart | string>(this.cartsUrl, {
      headers: headers,
    });
  }

  addToCart(cartData: IcartData, token: string): Observable<Icart> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    return this.httpClient.post<Icart>(this.cartsUrl, cartData, {
      headers: headers,
    });
  }
  updateCart(
    cartData: IcartData & { update: boolean },
    token: string
  ): Observable<Icart> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    return this.httpClient.post<Icart>(this.cartsUrl, cartData, {
      headers: headers,
    });
  }

  removeFromCart(
    cartData: Omit<IcartData, 'quantity'>,
    token: string
  ): Observable<Icart> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.httpClient.patch<Icart>(this.cartsUrl, cartData, {
      headers: headers,
    });
  }

  setCartProduct(productId: string, quantity: number) {
    const productIndex = this.cartState.cartProducts.findIndex(
      (product) => product.productId === productId
    );
    if (productIndex > -1) {
      this.cartState.cartProducts[productIndex].quantity += quantity;
    } else {
      this.cartState.cartProducts.push({ productId, quantity });
    }
    this.cartState$.next(this.cartState);
  }

  setCartStatus(status: boolean) {
    this.cartState.cartUpdateStatus = status;
    this.cartState$.next(this.cartState);
  }
}
