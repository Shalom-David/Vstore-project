import { Injectable, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Iorder } from 'src/interfaces/order';
import { CartsService } from './carts.service';
import { IcartProduct } from 'src/interfaces/cart';

@Injectable({
  providedIn: 'root',
})
export class DownloadReceiptService {
  @Input() order!: Iorder;
  constructor(private cartService: CartsService) {}

  private generateReceiptContent(order: Iorder): string {
    const receiptContent = `
  Order ID: ${order._id}
  Customer Email: ${order.customerEmail}
  
  Items:
  ${order.customerCart.products
    .map(
      (product: IcartProduct) => `
    Name: ${product.name}
    Quantity: ${product.quantity}
    Unit Price $${product.unitPrice}
    Total Price: $${product.totalProductPrice}
  `
    )
    .join('')}
  
  Total Price: $${order.customerCart.totalPrice}
  
  Billing Address:
    City: ${order.billingAddress.city}
    Street: ${order.billingAddress.street}
  
  Delivery Date: ${order.deliveryDate}
  Order Date: ${order.orderDate}
  Card Ends With: ${order.cardEndsWith}
  Status: ${order.status}
  `;

    return receiptContent;
  }

  downloadReceipt(order: Iorder): void {
    const receiptContent = this.generateReceiptContent(order);
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${order._id}.txt`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.cartService.setCartStatus(true);

  }
}
