import { createSlice } from "@reduxjs/toolkit";

const loadCartFromLocalStorage = () => {
  try {
    const storedCart = localStorage.getItem("cart");
    const parsed = storedCart ? JSON.parse(storedCart) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      price: Number(item.price),
      qty: Number(item.qty || 1),
    }));
  } catch (e) {
    console.error("Cart parse error:", e);
    return [];
  }
};

const saveCartToLocalStorage = (cartItems) => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
};

const getEffectivePrice = (item) => {
  const basePrice = Number(item.price) || 0;
  const discount = Number(item.salePercentage) || 0;
  if (item.isOnSale && discount > 0) {
    return Math.round(basePrice - (basePrice * discount) / 100);
  }
  return basePrice;
};

const initialState = {
  cartItems: loadCartFromLocalStorage(),
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.cartItems.find((i) => i._id === item._id);

      if (existingItem) {
        existingItem.qty += item.qty;
      } else {
        state.cartItems.push({ ...item });
      }

      saveCartToLocalStorage(state.cartItems);
    },

    incrementQty: (state, action) => {
      const item = state.cartItems.find((i) => i._id === action.payload);
      if (item) item.qty += 1;
      saveCartToLocalStorage(state.cartItems);
    },

    decrementQty: (state, action) => {
      const item = state.cartItems.find((i) => i._id === action.payload);
      if (item && item.qty > 1) item.qty -= 1;
      saveCartToLocalStorage(state.cartItems);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i._id !== action.payload);
      saveCartToLocalStorage(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      saveCartToLocalStorage([]);
    },

    calculateTotals: (state) => {
      let totalQty = 0;
      let totalAmt = 0;
      state.cartItems.forEach((item) => {
        totalQty += item.qty;
        totalAmt += item.qty * getEffectivePrice(item);
      });
      state.totalQuantity = totalQty;
      state.totalAmount = totalAmt;
    },
  },
});

export const {
  addToCart,
  incrementQty,
  decrementQty,
  removeFromCart,
  clearCart,
  calculateTotals,
} = cartSlice.actions;

export default cartSlice.reducer;
