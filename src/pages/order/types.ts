export enum OrderStatus {
  Preparation = "preparation",
  Ontheway = "ontheway",
  Delivered = "delivered",
  Pending = "pending",
  Cancelled = "cancelled",
}

export enum PaymentMethod {
  Khalti = "khalti",
  Esewa = "esewa",
  COD = "cod",
}

export enum PaymentStatus {
  Paid = "paid",
  Unpaid = "unpaid",
}

export interface IOrderDetail {
  id: string;
  quantity: number;
  createdAt: string;
  orderId: string;
  productId: string;

  Order: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    addressLine: string;
    city: string;
    street: string;
    zipcode: string;
    orderStatus: OrderStatus;
    totalPrice: number;
    state:string,
    userId:string

    Payment: {
      id:string;
      paymentMethod: PaymentMethod;
      paymentStatus: PaymentStatus;
      pidx?: string; // Add pidx property for Khalti payments
    };
  };

  Shoe: {
    images: string[];
    name: string;
    price: number;
    Category: {
      categoryName: string;
    };
  };
}
