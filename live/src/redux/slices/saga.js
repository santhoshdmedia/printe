import { call, put, takeLatest, all } from "redux-saga/effects";
import {
  isLogInStarted,
  isLogInSuccess,
  isLogInFailed,
  isSignUpStarted,
  isSignUpSuccess,
  isSignUpFailed,
  googleLoginStarted,
  googleLoginSuccess,
  googleLoginFailed,
  // ... other imports
} from "./slices/authSlice";
import { login, signUp } from "../helper/api_helper";

// Regular Login Saga (existing)
function* loginSaga(action) {
  try {
    yield put(isLogInStarted());
    const response = yield call(login, action.data);
    yield put(isLogInSuccess(response.data));
  } catch (error) {
    yield put(isLogInFailed(error.response?.data?.message || "Login failed"));
  }
}

// ========================================
// NEW: Google Login Saga
// ========================================
function* googleLoginSaga(action) {
  try {
    console.log("🔵 Saga: Google login started");
    yield put(googleLoginStarted());
    
    const { token, user } = action.payload;
    
    console.log("📦 Saga: Received data:", { token: !!token, user });
    
    if (!token || !user) {
      throw new Error("Invalid data from Google login");
    }

    // Format user data to match Redux state structure
    const userData = {
      _id: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
      wish_list: user.wish_list || [],
      picture: user.picture,
    };

    console.log("✅ Saga: Formatted user data:", userData);

    // Dispatch success action
    yield put(
      googleLoginSuccess({
        data: userData,
        message: "Login successful with Google!",
      })
    );

    console.log("✅ Saga: Success action dispatched - Auth state updated");
    
  } catch (error) {
    console.error("❌ Saga: Google login error:", error);
    yield put(
      googleLoginFailed(
        error.message || "Google login failed. Please try again."
      )
    );
  }
}

// Watchers
function* watchLogin() {
  yield takeLatest("LOGIN", loginSaga);
}

function* watchGoogleLogin() {
  yield takeLatest("GOOGLE_LOGIN", googleLoginSaga);
}

function* watchSignUp() {
  yield takeLatest("SIGN_UP", signUpSaga);
}

// Root Saga - combine all watchers
export default function* rootSaga() {
  yield all([
    watchLogin(),
    watchGoogleLogin(), // <-- Add this
    watchSignUp(),
    // ... other watchers
  ]);
}