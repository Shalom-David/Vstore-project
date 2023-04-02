import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  IpaginatedProducts,
  Iproduct,
  IupdateProduct,
} from 'src/interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'http://localhost:8080/products';
  constructor(private httpClient: HttpClient) {}
  private productsState = {
    productUpdated: false,
  };

  productsState$ = new BehaviorSubject(this.productsState);
  getProducts(
    category?: string,
    page?: number,
    searchQuery?: string
  ): Observable<Iproduct[] | IpaginatedProducts> {
    switch (true) {
      case Boolean(page && !category && !searchQuery):
        return this.httpClient.get<IpaginatedProducts>(
          `${this.productsUrl}?page=${page}`
        );
      case Boolean(page && searchQuery && !category):
        return this.httpClient.get<IpaginatedProducts>(
          `${this.productsUrl}?search=${searchQuery}&page=${page}`
        );
      case Boolean(category && page && !searchQuery):
        return this.httpClient.get<IpaginatedProducts>(
          `${this.productsUrl}?category=${category}&page=${page}`
        );
      case Boolean(category && page && searchQuery):
        return this.httpClient.get<IpaginatedProducts>(
          `${this.productsUrl}?search=${searchQuery}&category=${category}&page=${page}`
        );
      case Boolean(category && !page && searchQuery):
        return this.httpClient.get<IpaginatedProducts>(
          `${this.productsUrl}?search=${searchQuery}&category=${category}`
        );
      case Boolean(category && !page && !searchQuery):
        return this.httpClient.get<IpaginatedProducts>(
          `${this.productsUrl}?category=${category}`
        );
      default:
        return this.httpClient.get<Iproduct[]>(this.productsUrl);
    }
  }

  updateProduct(
    productData: IupdateProduct,
    token: string
  ): Observable<Iproduct> | any {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    const formData = new FormData();

    for (const key in productData) {
      if (
        productData.hasOwnProperty(key) &&
        productData[key as keyof Iproduct] !== null
      ) {
        formData.append(
          key,
          productData[key as keyof Iproduct] as string | Blob
        );
      }
    }

    return this.httpClient.patch<Iproduct>(this.productsUrl, formData, {
      headers: headers,
    });
  }
  addProduct(
    productData: Omit<Iproduct, 'productId'>,
    token: string
  ): Observable<Iproduct> | any {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    const formData = new FormData();

    for (const key in productData) {
      if (key === 'imageData') {
        formData.append(
          'image',
          productData[key as keyof Omit<Iproduct, 'productId'>] as string | Blob
        );
      } else {
        formData.append(
          key,
          productData[key as keyof Omit<Iproduct, 'productId'>] as string | Blob
        );
      }
    }
    return this.httpClient.post<Iproduct>(this.productsUrl, formData, {
      headers: headers,
    });
  }

  setProductStatus(status: boolean) {
    this.productsState.productUpdated = status;
    this.productsState$.next(this.productsState);
  }
}
