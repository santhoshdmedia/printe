import { createSlice } from "@reduxjs/toolkit";

const cart_slice = createSlice({
  name: "cart_slice",
  initialState: { values: 0 },
  reducers: {
    ADD_TO_CART: (state, action) => {
      state.values = action.payload;
    },
  },
});

export const { ADD_TO_CART } = cart_slice.actions;

export default cart_slice.reducer;
