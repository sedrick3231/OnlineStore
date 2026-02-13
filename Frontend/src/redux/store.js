import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlicer";
import categoryReducer from "./categorySlicer";
import heroReducer from "./HeroSlicer";
import orderReduces from "./OrderSlicer";
import productReducer from "./productSlicer";
import themeReducer from "./themeSlicer";
import userReducer from "./userSlicer";
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    cart: cartReducer,
    order: orderReduces,
    products: productReducer,
    hero: heroReducer,
    categories: categoryReducer,
  },
});
