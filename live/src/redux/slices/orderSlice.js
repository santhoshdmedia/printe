import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkOut: {
    design_file: "",
    product_image: "",
    variant_price: {},
    product_name: "",
    product_quantity: 0,
    product_totalPrice: "",
  },
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    uploadDesign: (state, action) => {
      state.checkOut.design_file = action.payload;
    },
    resetCheckOut: (state) => {
      state.checkOut = {
        design_file: "",
        product_image: "",
        variant_price: {},
        product_name: "",
        product_quantity: 0,
        product_totalPrice: "",
      };
    },
  },
});

export default orderSlice.reducer;
export const { uploadDesign,resetCheckOut } = orderSlice.actions;
