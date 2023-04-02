export interface Icart {
  customer: string;
  creationDate: string;
  products: IcartProduct[];
  totalPrice: number;
}

export interface IcartProduct {
  _id: string;
  quantity: number;
  unitPrice: number
  totalProductPrice: number;
  name: string;
  imageData: string;
  description: string;
}
export interface IcartData {
  customerEmail: string;
  productId: string;
  quantity: number;
}
