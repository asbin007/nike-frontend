import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProduct, IProducts, Status } from "../globals/types/types";
import { AppDispatch, RootState } from "./store";
import { API } from "../globals/http";

const initialState: IProducts = {
  products: [],
  status: Status.LOADING,
  product: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts(state: IProducts, action: PayloadAction<IProduct[]>) {
      state.products = action.payload;
    },
    setStatus(state: IProducts, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setProduct(state: IProducts, action: PayloadAction<IProduct>) {
      state.product = action.payload;
    },
    // Real-time stock update actions
    updateProductStock(state: IProducts, action: PayloadAction<{ productId: string; totalStock: number; isStock: boolean }>) {
      const { productId, totalStock, isStock } = action.payload;
      
      // Update in products array
      const productIndex = state.products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        state.products[productIndex].totalStock = totalStock;
        state.products[productIndex].isStock = isStock;
      }
      
      // Update current product if it matches
      if (state.product && state.product.id === productId) {
        state.product.totalStock = totalStock;
        state.product.isStock = isStock;
      }
    },
    // Bulk stock update for multiple products
    updateMultipleProductStock(state: IProducts, action: PayloadAction<{ productId: string; totalStock: number; isStock: boolean }[]>) {
      action.payload.forEach(({ productId, totalStock, isStock }) => {
        const productIndex = state.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].totalStock = totalStock;
          state.products[productIndex].isStock = isStock;
        }
        
        if (state.product && state.product.id === productId) {
          state.product.totalStock = totalStock;
          state.product.isStock = isStock;
        }
      });
    },
  },
});
export const { setProducts, setStatus, setProduct, updateProductStock, updateMultipleProductStock } = productSlice.actions;
export default productSlice.reducer;

export function fetchProducts() {
  return async function fetchProductsThunk(dispatch: AppDispatch) {
    try {
      const res = await API.get("/product");
      if (res.status === 200) {
        dispatch(setStatus(Status.SUCCESS));

        dispatch(setProducts(res.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function fetchProduct(id: string) {
  return async function fetchProductThunk(
    dispatch: AppDispatch,
    getState: () => RootState
  ) {
     dispatch(setStatus(Status.LOADING)); // Set loading state first
    const store = getState();
    const productExits = store.products.products.find(
      (product: IProduct) => product.id === id
    );
    if (productExits) {
      dispatch(setProduct(productExits));
      dispatch(setStatus(Status.SUCCESS));
      return;
    }
    try {
      
      const res = await API.get(`/product/${id}`);
      if (res.status === 200) {
        dispatch(setStatus(Status.SUCCESS));

        dispatch(setProduct(res.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
