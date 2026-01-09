// Add this to your existing saga file (where you handle LOGIN action)

import { call, put, takeLatest } from "redux-saga/effects";
import {
  isLogInStarted,
  isLogInSuccess,
  isLogInFailed,
} from "./slices/authSlice"; // Adjust path as needed

// Note: This is different from regular login because the API call
// is already done in the component. We just need to handle the response.

function* googleLoginSaga(action) {
  try {
    yield put(isLogInStarted());
    
    const { token, user } = action.data;
    
    if (token && user) {
      // Format user data to match your Redux state structure
      const userData = {
        _id: user.id || user._id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
        wish_list: user.wish_list || [],
        picture: user.picture
      };

      yield put(
        isLogInSuccess({
          data: userData,
          message: "Login successful with Google!",
        })
      );
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    yield put(
      isLogInFailed(error.message || "Google login failed. Please try again.")
    );
  }
}

// Watcher for Google login
export function* watchGoogleLogin() {
  yield takeLatest("GOOGLE_LOGIN", googleLoginSaga);
}

// Make sure to add watchGoogleLogin to your rootSaga
// Example of rootSaga (adjust based on your setup):
/*
import { all } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([
    watchLogin(),
    watchSignUp(),
    watchGoogleLogin(), // <-- Add this
    watchUpdateUser(),
    // ... other watchers
  ]);
}
*/