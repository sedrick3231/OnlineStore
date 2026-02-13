import { createSlice } from '@reduxjs/toolkit'

const initialState = "light"

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => action.payload, // replaces the current state
    toggleTheme: (state) => (state === "light" ? "dark" : "light"), // optional: toggles theme
  },
})

export const { setTheme, toggleTheme} = themeSlice.actions

export default themeSlice.reducer
