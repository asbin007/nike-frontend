import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import productSlice from "./productSlice";
import reviewSlice from "./reviewSlice";
import cartSlice from './cartSlice'
import orderSlice from './orderSlice'
import chatSlice from './chatSlice'
import wishlistSlice from './wishlistSlice'
import comparisonSlice from './comparisonSlice'
import recommendationsSlice from './recommendationsSlice'
import couponSlice from './couponSlice'

const store = configureStore({
    reducer : {
        auth : authSlice,
        products:productSlice,
        reviews:reviewSlice,
        cart:cartSlice,
        orders:orderSlice,
        chat: chatSlice,
        wishlist: wishlistSlice,
        comparison: comparisonSlice,
        recommendations: recommendationsSlice,
        coupon: couponSlice,
    }
})

export default store 
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>


