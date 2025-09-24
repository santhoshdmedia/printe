import { Divider, Input, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import abc from "../../assets/logo/ABC.jpg";
import logo from "../../assets/logo/without_bg.png";
import { googleLogin } from "../../helper/api_helper";
import { saveTokenToLocalStorage } from "../../redux/middleware";
// Main Login Component
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (isAuth) {
      const redirectUrl = localStorage.getItem("redirect_url");
      setIsExiting(true);
      setTimeout(() => {
        navigate(redirectUrl ? `/product/${redirectUrl}` : "/");
      }, 500);
    }
  }, [isAuth, navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(value);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!emailValidation(form.email)) {
      setErrorMessage("Invalid Email Id");
    } else {
      setErrorMessage("");
      dispatch({ type: "LOGIN", data: form });
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { name, email, picture, sub } = decoded;

      const response = await googleLogin({
        googleId: sub,
        name,
        email,
        picture,
      });

      if (response.status === 200) {
        const data = response.data;
        // saveTokenToLocalStorage()
        // console.log
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
        message.success("Logged in successfully with Google!");
      } else {
        throw new Error(response.data?.message || "Failed to authenticate with Google");
      }
    } catch (error) {
      console.error("Google login error:", error);
      message.error(error.message || "Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Google Login Error
  const handleGoogleError = () => {
    console.error("Google Login Failed");
    message.error("Google login failed. Please try again.");
    setIsGoogleLoading(false);
  };

  return (
    <div className={`w-full min-h-screen flex !font-primary transition-all duration-500 ${isMounted ? (isExiting ? "exit-animation" : "enter-animation") : "opacity-0"}`}>
      {/* Logo in top right corner with gold background */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <Link to={"/"} className="p-2 md:p-3 bg-yellow-400 flex items-center justify-center rounded-md cursor-pointer">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-6 md:h-8 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Left Section - Background Image */}
      <div 
        className={`hidden lg:flex lg:w-1/2 items-center justify-center p-8 lg:p-12 relative transition-all duration-500 ${isMounted ? (isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100") : "-translate-x-full opacity-0"}`}
        style={{
          backgroundImage: `url(${abc})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        
        <div className="max-w-md relative z-10 text-white px-4">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Welcome Back</h1>
            <p className="text-base md:text-lg">
              Access your account and continue your journey with us. We're glad to have you back.
            </p>
          </div>
          <div className="bg-yellow-400 bg-opacity-90 p-4 md:p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="bg-black p-2 rounded-full mr-3">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-black font-semibold text-base md:text-lg">Secure Login</h3>
            </div>
            <p className="text-black text-sm md:text-base">
              Your security is our priority. All your data is encrypted and securely stored.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-500 ${isMounted ? (isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100") : "translate-x-full opacity-0"}`}>
        <div className="w-full max-w-md">
          <div className="mb-6 md:mb-8">
            <button 
              onClick={() => handleNavigation("/sign-up")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4 md:mb-6 text-sm md:text-base"
            >
              <FaArrowLeft className="mr-2" /> Register Here
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Login to Your Account</h1>
            <p className="text-gray-600 text-sm md:text-base">Enter your credentials to access your account</p>
          </div>

          <Spin spinning={isLogingIn || isGoogleLoading}>
            <form onSubmit={handleOnSubmit} className="bg-white rounded-lg">
              <div className="mb-4 md:mb-6">
                <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">Email Address</label>
                <Input 
                  value={form.email} 
                  required 
                  name="email" 
                  onChange={handleOnChange} 
                  placeholder="Enter your email" 
                  style={{ fontSize: "16px", height: "44px", borderRadius: "8px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  type="email"
                />
              </div>
              
              <div className="mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 font-medium text-sm md:text-base">Password</label>
                  <Link 
                    to="/forget-password" 
                    className="text-blue-600 hover:text-blue-800 text-xs md:text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/forget-password");
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input.Password 
                  value={form.password} 
                  required 
                  name="password" 
                  onChange={handleOnChange} 
                  placeholder="••••••••" 
                  style={{ fontSize: "16px", height: "44px", borderRadius: "8px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                />
              </div>
              
              {errorMessage && (
                <div className="mb-3 md:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                </div>
              )}
              
              <button 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base" 
                type="submit"
              >
                Sign in
              </button>
              
              <Divider className="my-4 md:my-6 text-xs md:text-sm">Or</Divider>
              
              {/* <div className="flex justify-center mb-4 md:mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="100%"
                />
              </div> */}
              
              <div className="text-center">
                <p className="text-gray-600 text-xs md:text-sm">
                  Don't have an account?{" "}
                  <Link 
                    to="/sign-up" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/sign-up");
                    }}
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </Spin>
          
          <div className="mt-6 md:mt-8 text-center">
            <Link 
              to="/help" 
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-xs md:text-sm"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/help");
              }}
            >
               Need help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login