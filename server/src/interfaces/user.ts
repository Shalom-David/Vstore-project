export interface Iuser {
  firstName: string
  lastName: string
  email: string
  password: string
  billingAddress: { city: string; street: string }
  role: 'admin' | 'user'
}

export interface IuserUpdateDetail {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  billingAddress?: { city: string; street: string };
}