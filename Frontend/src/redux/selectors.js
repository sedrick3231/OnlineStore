// Redux selectors with memoization for performance
import { createSelector } from "@reduxjs/toolkit";

// User selectors
export const selectUser = (state) => state.user.user;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
export const selectOtpRequired = (state) => state.user.otpRequired;
export const selectEmailForOTP = (state) => state.user.emailForOTP;

// Memoized selector for user data
export const selectUserData = createSelector(
  [selectUser, selectIsLoggedIn],
  (user, isLoggedIn) => ({
    user,
    isLoggedIn,
    isAdmin: user?.isAdmin || false,
  })
);

// Memoized selector for auth state
export const selectAuthState = createSelector(
  [selectIsLoggedIn, selectUserLoading, selectUserError, selectOtpRequired],
  (isLoggedIn, loading, error, otpRequired) => ({
    isLoggedIn,
    loading,
    error,
    otpRequired,
  })
);

// Product selectors
export const selectProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;

export const selectProductById = (productId) =>
  createSelector([selectProducts], (products) =>
    products?.find((p) => p._id === productId)
  );

// Cart selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;

export const selectCartSummary = createSelector(
  [selectCartItems, selectCartTotal],
  (items, total) => ({
    items,
    total,
    count: items?.length || 0,
  })
);

// Theme selector
export const selectTheme = (state) => state.theme.mode;
