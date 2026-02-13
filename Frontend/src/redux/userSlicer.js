import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const url = import.meta.env.VITE_BACKEND_URL;

// Async thunk for login and getting user data
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const response = await fetch(`${url}/user/api/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Check if OTP verification is required
      if (data.message?.toLowerCase().includes("otp sent.")) {
        // Return a special flag and the email used
        return thunkAPI.fulfillWithValue({
          otpRequired: true,
          email: credentials.email,
        });
      }
      // Normal successful login with user info
      return { user: data.user, token: data.token };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "user/updateUserThunk",
  async (formData, thunkAPI) => {
    try {
      const response = await fetch(`${url}/user/api/v1/update`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoggedIn: JSON.parse(localStorage.getItem("user")) ? true : false,
  loading: false,
  error: null,
  otpRequired: false,
  emailForOTP: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateUser(state, action) {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    LoginUser(state, action) {
      if (state.user && action.payload) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        state.isLoggedIn = true;
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    clearOTPState(state) {
      state.otpRequired = false;
      state.emailForOTP = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // If OTP is required
        if (action.payload.otpRequired) {
          state.user = null;
          state.token = null;
          state.isLoggedIn = false;
          state.otpRequired = true; // Add this flag to your state
          state.emailForOTP = action.payload.email; // Store email for OTP verification
          localStorage.removeItem("user");
        } else {
          // Normal login success
          state.user = action.payload.user;
          state.token = action.payload.token || null;
          state.isLoggedIn = true;
          state.otpRequired = false;
          state.emailForOTP = null;
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          if (action.payload.token) {
            localStorage.setItem("adminAccessToken", action.payload.token);
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.otpRequired = false;
        state.emailForOTP = null;
        localStorage.removeItem("user");
      })
      // handle user update
      .addCase(updateUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "User update failed";
      });
  },
});
export const { logout, updateUser, LoginUser, clearOTPState } = userSlice.actions;

export default userSlice.reducer;
