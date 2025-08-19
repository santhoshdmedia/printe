import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import publicSlice from "./slices/publicSlice";
import authSlice from "./slices/authSlice";
import orderSlice from "./slices/orderSlice";
import cart_slice from "./slices/cart.slice";
import rootSaga from "./middleware";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    publicSlice: publicSlice,
    authSlice: authSlice,
    orderSlice: orderSlice,
    cartSlice: cart_slice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
export default store;
