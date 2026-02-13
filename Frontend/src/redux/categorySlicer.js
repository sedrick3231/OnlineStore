import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const STORAGE_KEY = "categories";
const API_URL = import.meta.env.VITE_BACKEND_URL;

const loadCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const saveCategories = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore persistence errors.
  }
};

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
      const token = localStorage.getItem("adminAccessToken");
      if (!token) {
        // If no token, just return empty array and use localStorage data
        return [];
      }
      const response = await axios.get(`${API_URL}/admin/api/v1/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
  items: loadCategories(),
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory(state, action) {
      const name = action.payload?.name?.trim();
      if (!name) return;

      const id = toId(name);
      const exists = state.items.some(
        (item) => item.name.toLowerCase() === name.toLowerCase() || item.id === id
      );
      if (exists) return;

      const newCategory = {
        id,
        name,
        image: action.payload?.image || "",
      };
      state.items = [...state.items, newCategory];
      saveCategories(state.items);
    },
    removeCategory(state, action) {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      saveCategories(state.items);
    },
    updateCategory(state, action) {
      const { id, name, image } = action.payload || {};
      state.items = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              name: name?.trim() || item.name,
              image: typeof image === "string" ? image : item.image,
            }
          : item
      );
      saveCategories(state.items);
    },
    replaceCategories(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : state.items;
      saveCategories(state.items);
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
        saveCategories(action.payload);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep localStorage data on error
      })
      // Create category
      .addCase(createCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        saveCategories(state.items);
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
        saveCategories(state.items);
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
        saveCategories(state.items);
      })
      .addCase(deleteCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addCategory, removeCategory, updateCategory, replaceCategories } =
  categorySlice.actions;

export default categorySlice.reducer;
