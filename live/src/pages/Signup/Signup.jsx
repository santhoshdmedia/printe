import { Divider, Input, Spin, Tooltip, message } from "antd";
import React, { useEffect, useState } from "react";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { googleLogin } from "../../helper/api_helper";
import abc from "../../assets/logo/ABC.jpg";
import logo from "../../assets/logo/without_bg.png"

const Signup = () => {
  const dispatch = useDispatch();
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  useEffect(() => {
    // Trigger enter animation after component mounts
    setIsMounted(true);
    
    let local_item = localStorage.getItem("redirect_url");
    if (isAuth) {
      if (local_item) {
        // Add exit animation before navigation
        setIsExiting(true);
        setTimeout(() => {
          navigate(`/product/${local_item}`);
        }, 500);
      } else {
        setIsExiting(true);
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    }
  }, [isAuth]);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordStrength, setPasswordStrength] = useState({
    level: 0,
    message: "",
    color: "transparent"
  });

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 500);
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Use the same action type as regular signup
      dispatch({ type: "SIGNUP_SUCCESS", payload: data.user });
      message.success("Signed up successfully with Google!");
    }
  } catch (error) {
    console.error("Google signup error:", error);
    message.error(error.message || "Google signup failed. Please try again.");
  } finally {
    setIsGoogleLoading(false);
  }
};

  // Handle Google Login Error
  const handleGoogleError = () => {
    console.error("Google Signup Failed");
    message.error("Google signup failed. Please try again.");
    setIsGoogleLoading(false);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    
    // Check password strength in real-time
    if (name === "password") {
      checkPasswordStrength(value);
      // Also validate confirm password when password changes
      if (form.confirmPassword) {
        confirmPasswordValidation(form.confirmPassword, value);
      }
    }
    
    // Validate confirm password in real-time
    if (name === "confirmPassword") {
      confirmPasswordValidation(value, form.password);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    let message = "";
    let color = "transparent";

    if (password.length === 0) {
      setPasswordStrength({ level: 0, message: "", color });
      return;
    }

    // Check for minimum length
    if (password.length >= 8) strength += 1;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) strength += 1;

    // Check for lowercase letters
    if (/[a-z]/.test(password)) strength += 1;

    // Check for numbers
    if (/[0-9]/.test(password)) strength += 1;

    // Check for special characters
    if (/[\W_]/.test(password)) strength += 1;

    // Determine strength level and message
    switch (strength) {
      case 0:
      case 1:
        message = "Very Weak";
        color = "#ff4d4f"; // red
        break;
      case 2:
        message = "Weak";
        color = "#ff7a45"; // orange
        break;
      case 3:
        message = "Medium";
        color = "#ffa940"; // golden orange
        break;
      case 4:
        message = "Strong";
        color = "#73d13d"; // green
        break;
      case 5:
        message = "Very Strong";
        color = "#52c41a"; // dark green
        break;
      default:
        message = "";
        color = "transparent";
    }

    setPasswordStrength({ level: strength, message, color });
  };

  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = pattern.test(value);

    setErrorMessage((prevError) => ({
      ...prevError,
      email: isValid ? "" : "Invalid email address.",
    }));

    return isValid;
  };

  const passwordValidation = (value) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const isValid = pattern.test(value);

    setErrorMessage((prevError) => ({
      ...prevError,
      password: isValid ? "" : "Password must be at least 8 characters long, including 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.",
    }));

    return isValid;
  };

  const confirmPasswordValidation = (confirmPassword, password = form.password) => {
    const isValid = confirmPassword === password;

    setErrorMessage((prevError) => ({
      ...prevError,
      confirmPassword: isValid ? "" : "Passwords do not match.",
    }));

    return isValid;
  };

  const nameValidation = (value) => {
    const pattern = /^[a-zA-Z]+([ ][a-zA-Z]+)*$/;
    const isValid = pattern.test(value) && value.length >= 3 && value.length <= 50;

    setErrorMessage((prevError) => ({
      ...prevError,
      name: isValid ? "" : "Name must be at least 3 characters long and contain only alphabets.",
    }));

    return isValid;
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const isNameValid = nameValidation(form.name);
    const isEmailValid = emailValidation(form.email);
    const isPasswordValid = passwordValidation(form.password);
    const isConfirmPasswordValid = confirmPasswordValidation(form.confirmPassword);

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      dispatch({ type: "SIGNUP", data: form });
    }
  };

  const passwordRequirementsTooltip = (
    <div className="text-xs">
      <p>Password must contain:</p>
      <ul className="list-disc pl-4 mt-1">
        <li>At least 8 characters</li>
        <li>One uppercase letter (A-Z)</li>
        <li>One lowercase letter (a-z)</li>
        <li>One digit (0-9)</li>
        <li>One special character (!@#$%^&* etc.)</li>
      </ul>
    </div>
  );

  return (
    <div className={`w-full min-h-screen flex !font-primary transition-all duration-500 ${isMounted ? (isExiting ? "exit-animation" : "enter-animation") : "opacity-0"}`}>
      {/* Left Section - Signup Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto relative transition-all duration-500 ${isMounted ? (isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100") : "translate-x-full opacity-0"}`}>
        {/* Logo in top left corner with gold background */}
        <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10">
          <div className="p-1.5 sm:p-2 md:p-3 bg-yellow-400 flex items-center justify-center rounded-md">
            <Link to={'/'}>
            <img 
              src={logo} 
              alt="Logo" 
              className="h-5 sm:h-6 md:h-8 w-auto object-contain"
              />
              </Link>
          </div>
        </div>

        <div className="w-full max-w-md mt-10 sm:mt-12 md:mt-16">
          <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex justify-end">
            <button 
              onClick={() => handleNavigation("/")} 
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-xs sm:text-sm md:text-base"
            >
              Home <FaArrowRight className="ml-1" /> 
            </button>
          </div>

          <Spin spinning={isLogingIn || isGoogleLoading}>
            <form onSubmit={handleOnSubmit} className="bg-white rounded-lg">
              <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <label className="block text-gray-700 mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm md:text-base">Full Name</label>
                <Input 
                  value={form.name} 
                  required 
                  name="name" 
                  onChange={handleOnChange} 
                  placeholder="Enter your full name" 
                  style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                />
                {errorMessage.name && <p className="text-red-500 text-xs mt-1">{errorMessage.name}</p>}
              </div>
              
              <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <label className="block text-gray-700 mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm md:text-base">Email Address</label>
                <Input 
                  value={form.email} 
                  required 
                  name="email" 
                  onChange={handleOnChange} 
                  placeholder="Enter your email" 
                  style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  type="email"
                />
                {errorMessage.email && <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>}
              </div>
              
              <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="block text-gray-700 font-medium text-xs sm:text-sm md:text-base">Password</label>
                  <Tooltip title={passwordRequirementsTooltip} placement="topRight">
                    <span className="text-gray-400 hover:text-gray-600 cursor-help text-sm">
                      <FaInfoCircle />
                    </span>
                  </Tooltip>
                </div>
                <Input.Password 
                  value={form.password} 
                  required 
                  name="password" 
                  onChange={handleOnChange} 
                  placeholder="Create a strong password" 
                  style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                />
                
                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-1.5 sm:mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                        {passwordStrength.message}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(passwordStrength.level / 5) * 100}%`, 
                          backgroundColor: passwordStrength.color 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errorMessage.password && <p className="text-red-500 text-xs mt-1">{errorMessage.password}</p>}
              </div>
              
              <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-6">
                <label className="block text-gray-700 mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm md:text-base">Confirm Password</label>
                <Input.Password 
                  value={form.confirmPassword} 
                  required 
                  name="confirmPassword" 
                  onChange={handleOnChange} 
                  placeholder="Confirm your password" 
                  style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                />
                {errorMessage.confirmPassword && <p className="text-red-500 text-xs mt-1">{errorMessage.confirmPassword}</p>}
              </div>
              
              <button 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base" 
                type="submit"
              >
                Create Account
              </button>
              
              <Divider className="my-3 sm:my-4 md:my-5 lg:my-6 text-xs sm:text-sm">Or</Divider>
              
              <div className="flex justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="100%"
                />
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/login");
                    }}
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </Spin>
          
          <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-center">
            <Link 
              to="/help" 
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/help");
              }}
            >
              <MdHelpOutline className="mr-1 text-xs sm:text-sm" /> Need help?
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right Section - Illustration (Hidden on mobile, shown on larger screens) */}
      <div 
        className={`hidden lg:flex lg:w-1/2 items-center justify-center p-6 lg:p-8 fixed right-0 top-0 h-full transition-all duration-500 ${isMounted ? (isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100") : "-translate-x-full opacity-0"}`}
        style={{
          backgroundImage: `url(${abc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="max-w-md relative z-10">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4">Create Your Account</h1>
            <p className="text-white text-base lg:text-lg">
              Join us today and unlock a world of possibilities. Start your journey with our platform.
            </p>
          </div>
          <div className="bg-white bg-opacity-90 p-4 lg:p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-3 lg:mb-4">
              <div className="bg-black p-1.5 lg:p-2 rounded-full mr-3">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-black font-semibold text-sm lg:text-base">Benefits of Joining</h3>
            </div>
            <ul className="text-black text-xs lg:text-sm space-y-1.5 lg:space-y-2">
              <li>• Access exclusive features and content</li>
              <li>• Save your preferences and history</li>
              <li>• Faster checkout process</li>
              <li>• Personalized recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with GoogleOAuthProvider
export const SignupWithProvider = () => (
  <GoogleOAuthProvider clientId="323773820042-ube4qhfaig1dbrgvl85gchkrlvphnlv9.apps.googleusercontent.com">
    <Signup />
  </GoogleOAuthProvider>
);
