import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const url = import.meta.env.VITE_BACKEND_URL;
const heroID = "698f9454cebbb893e09d96e1";
// Async thunk to fetch hero data
export const fetchHero = createAsyncThunk('hero/fetchHero', async () => {
  const res = await axios.get(`${url}/user/api/v1/getHeroData/${heroID}`);
  return res.data.hero;
});

const heroSlice = createSlice({
  name: 'hero',
  initialState: {
    loading: false,
    error: null,
    data: {
      images: [],
      heading: '',
      subheading: '',
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHero.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default heroSlice.reducer;
