import { IcartProduct } from './cart';

export interface Iorder {
  _id: string;
  customerEmail: string;
  customerCart: {
    products: IcartProduct[];
    totalPrice: number;
  };
  billingAddress: { city: string; street: string };
  deliveryDate: string;
  orderDate: string;
  cardEndsWith: number;
  status: 'confirmed' | 'rejected' | 'canceled' | 'shipping';
}

export interface IplaceOrder {
  customerEmail: string;
  billingAddress: { city: string; street: string };
  deliveryDate: string;
  creditCard: string;
}
