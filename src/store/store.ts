import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import productSlice from "./productSlice";
import reviewSlice from "./reviewSlice";
import cartSlice from './cartSlice'
import orderSlice from './orderSlice'
import chatBoxSlice from './chatBoxSlice'
import wishlistSlice from './wishlistSlice'
import comparisonSlice from './comparisonSlice'
import recommendationsSlice from './recommendationsSlice'

const store = configureStore({
    reducer : {
        auth : authSlice,
        products:productSlice,
        reviews:reviewSlice,
        cart:cartSlice,
        orders:orderSlice,
        chat: chatBoxSlice,
        wishlist: wishlistSlice,
        comparison: comparisonSlice,
        recommendations: recommendationsSlice,
    }
})

export default store 
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>


