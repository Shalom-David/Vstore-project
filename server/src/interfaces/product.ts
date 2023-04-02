export interface Iproduct {
  name: string
  category: string
  price: number
  imageId: string
  description: string
}
export interface IproductWithImage {
  productId: string
  name: string
  category: string
  price: number
  description: string
  imageData: string
}

export interface IpaginatedProducts {
  products: IproductWithImage[]
  totalCount: number
}
