import { createSlice } from "@reduxjs/toolkit";

const cart_slice = createSlice({
  name: "cart_slice",
  initialState: { 
    count: 0,
    items: [], 
  },
  reducers: {
    ADD_TO_CART: (state, action) => {
      // Increment the count instead of replacing it
      state.count += 1;
      // Also add the item to the items array if needed
      if (action.payload) {
        state.items.push(action.payload);
      }
    },
    SET_CART_COUNT: (state, action) => {
      state.count = action.payload;
    },
    SET_CART_ITEMS: (state, action) => {
      state.items = action.payload;
      // Ensure count matches the items length
      state.count = action.payload.length;
    },
    // Add a new reducer to remove items if needed
    REMOVE_FROM_CART: (state, action) => {
      state.count = Math.max(0, state.count - 1);
      // Also remove the item from the items array if needed
      if (action.payload) {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      }
    },
  },
});

export const { ADD_TO_CART, SET_CART_COUNT, SET_CART_ITEMS, REMOVE_FROM_CART } = cart_slice.actions;

export default cart_slice.reducer;