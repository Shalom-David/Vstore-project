export interface IuserDetail {
  firstName: string;
  lastName: string;
  email: string;
  billingAddress: { city: string; street: string };
  role: string
}
export interface IuserRegistrationDetail {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  billingAddress: { city: string; street: string };
}
export interface IuserUpdateDetail {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  billingAddress?: { city?: string; street?: string };
}

export interface IuserWithAccessToken {
  user: IuserDetail;
  token: string;
}
