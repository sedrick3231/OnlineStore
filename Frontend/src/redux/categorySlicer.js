import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const toId = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Async thunks for backend API calls
export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/user/api/v1/categories`);
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategoryAsync = createAsyncThunk(
  "categories/create",
  async (categoryData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminAccessToken");
      if (!token) {
        return rejectWithValue("Authentication token is missing. Please login as admin.");
      }
      const response = await axios.post(
        `${API_URL}/admin/api/v1/categories`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category");
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  "categories/update",
  async ({ id, name, image }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminAccessToken");
      if (!token) {
        return rejectWithValue("Authentication token is missing. Please login as admin.");
      }
      const response = await axios.put(
        `${API_URL}/admin/api/v1/categories/${id}`,
        { name, image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category");
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminAccessToken");
      if (!token) {
        return rejectWithValue("Authentication token is missing. Please login as admin.");
      }
      await axios.delete(`${API_URL}/admin/api/v1/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete category");
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    upsertCategoryFromSocket(state, action) {
      const payload = action.payload || {};
      const name = typeof payload.name === "string" ? payload.name.trim() : "";
      if (!name) return;

      const id = payload.id || toId(name);
      const image = typeof payload.image === "string" ? payload.image : "";
      const existingIndex = state.items.findIndex((item) => item.id === id);
      const updatedCategory = { id, name, image };

      if (existingIndex >= 0) {
        state.items[existingIndex] = { ...state.items[existingIndex], ...updatedCategory };
      } else {
        state.items.push(updatedCategory);
      }
    },
    removeCategory(state, action) {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create category
      .addCase(createCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update category
      .addCase(updateCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload;
        state.items = state.items.map((item) =>
          item.id === updatedCategory.id ? updatedCategory : item
        );
      })
      .addCase(updateCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete category
      .addCase(deleteCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  upsertCategoryFromSocket,
  removeCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
