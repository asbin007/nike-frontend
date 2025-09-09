export enum Status {
  SUCCESS = "success",
  LOADING = "loading",
  ERROR = "error",
}

export interface ICategory {
  id: string;
  categoryName: string;
}

 export interface ICollection{
  id:string;
  collectionName:string;  // men amd women
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  costPrice?: number; // Cost price for profit calculation (admin only)
  isNew: boolean;
  isStock: boolean;
  features: string[];
  discount: number;
  colors: string[];
  images: string[] ;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  Category: ICategory;
  sizes:string[]

  brand: string;
  quantity: number;
  comments: string[];
  rating: number;
  collectionId: string;
  totalStock: number;
  Collection: ICollection;
}

export interface IProducts {
  products: IProduct[];
  status: Status;
  product: IProduct | null;
}
