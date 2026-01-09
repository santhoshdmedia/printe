// src/utils/googleAuthHelper.js
// Shared helper for Google Authentication across Login component and Layout (One Tap)

import { jwtDecode } from "jwt-decode";
import { message } from "antd";
import { googleLogin, mergeCart } from "../helper/api_helper";
import { saveTokenToLocalStorage } from "../redux/middleware";

/**
 * Handles Google Login Success for both Login page and One Tap popup
 * @param {Object} credentialResponse - Response from Google OAuth
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} navigate - React Router navigate function
 * @param {Function} setErrorMessage - Function to set error messages (optional)
 * @returns {Object} - { success: boolean, error: string | null }
 */
export const handleGoogleLoginSuccess = async (
  credentialResponse,
  dispatch,
  navigate,
  setErrorMessage = null
) => {
  try {
    console.log("🔵 Google Login - Starting authentication process");

    // Decode the JWT credential
    const decoded = jwtDecode(credentialResponse.credential);
    
    const googleData = {
      googleId: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture
    };

    console.log("🔵 Google Login - Sending data to backend:", googleData);

    // Call backend API
    const response = await googleLogin(googleData);
    
    console.log("✅ Google Login - Full Response:", response);
    
    // Handle different response structures
    const data = response.data || response;
    const token = data.token || data.accessToken || data.jwt;
    const user = data.user || data.userData;
    
    // Validate response
    if (!token || !user) {
      console.error("❌ Missing token or user in response:", data);
      throw new Error(`Invalid response structure. Token: ${!!token}, User: ${!!user}`);
    }

    console.log("✅ Valid response - Token and User found");
    
    // Save token to localStorage
    saveTokenToLocalStorage(token);
    console.log("✅ Token saved to localStorage");
    
    // Merge guest cart if exists
    const guest = localStorage.getItem("guest");
    if ((user.id || user._id) && guest && guest !== "") {
      try {
        const mergeData = {
          guestId: guest,
          id: { _id: user.id || user._id }
        };
        await mergeCart(mergeData);
        localStorage.removeItem("guest");
        console.log("✅ Guest cart merged successfully");
      } catch (cartError) {
        console.error("⚠️ Cart merge error (non-critical):", cartError);
      }
    }

    // Dispatch Redux action
    dispatch({ 
      type: "GOOGLE_LOGIN", 
      data: { token, user }
    });

    console.log("✅ Redux action dispatched - User authenticated");
    message.success(`Welcome back, ${user.name || user.email}!`);
    
    // Handle navigation
    setTimeout(() => {
      const redirectUrl = localStorage.getItem("redirect_url");
      localStorage.removeItem("redirect_url");
      
      // Navigate to redirect URL or home
      const destination = redirectUrl ? `/product/${redirectUrl}` : "/";
      console.log("🔵 Navigating to:", destination);
      navigate(destination);
    }, 500);
    
    return { success: true, error: null };
    
  } catch (error) {
    console.error("❌ Google login error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error stack:", error.stack);
    
    const errorMsg = error.response?.data?.message 
      || error.message 
      || "Google login failed. Please try again.";
    
    if (setErrorMessage) {
      setErrorMessage(errorMsg);
    }
    
    message.error(errorMsg);
    
    return { success: false, error: errorMsg };
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isUserAuthenticated = () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return !!token;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Get user data from localStorage
 * @returns {Object | null}
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("redirect_url");
    console.log("✅ Auth data cleared");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};