import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_BACKEND_URL;

// Async thunk to fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${url}/products/getProducts/`, {
        withCredentials: true,
      });
      if (response.data.success) {
        return response.data.products;
      } else {
        return thunkAPI.rejectWithValue(
          response.data.message || "Failed to fetch products"
        );
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // ✅ Update stock in real-time when socket event is received
    updateProductStock: (state, action) => {
      const { productId, newStock } = action.payload;
      const product = state.items.find(item => item._id === productId);
      if (product) {
        product.stockQuantity = newStock;
        console.log(`📦 Stock updated for product ${productId}: ${newStock}`);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      });
  },
});

export const { updateProductStock } = productSlice.actions;
export default productSlice.reducer;
