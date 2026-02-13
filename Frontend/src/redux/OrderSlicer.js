import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const url = import.meta.env.VITE_BACKEND_URL;

// ✅ GET Order Thunk
export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (credentials, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${url}/user/api/v1/get-order/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order");
      }
      const data = await response.json();
      return { orders: data.Orders }; // Adjust based on your backend shape
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ CREATE Order Thunk (with integrated stock deduction)
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, thunkAPI) => {
    try {
      // Create order on backend (backend handles stock validation and deduction)
      const response = await fetch(`${url}/user/api/v1/createOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error("Order creation error:", error.message);
      return thunkAPI.rejectWithValue({
        message: error.message || "Failed to create order",
        code: error.code || "ORDER_ERROR"
      });
    }
  }
);

// ✅ Initial State
const initialState = {
  orders: [],
  loading: false,
  error: null,
  success: false,
};

// ✅ Slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Order
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders; 
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // adjust based on your backend response
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
