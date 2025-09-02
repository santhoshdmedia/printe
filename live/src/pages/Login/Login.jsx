import { Divider, Input, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { EnvHelper } from "../../helper/EnvHelper";
import abc from "../../assets/logo/ABC.jpg";
import logo from "../../assets/logo/without_bg.png"

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);

  useEffect(() => {
    if (isAuth) {
      let local_item = localStorage.getItem("redirect_url");
      if (local_item) {
        navigate(`/product/${local_item}`);
      } else {
        navigate("/");
      }
    }
  }, [isAuth]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(value);
  };

  const passwordValidation = (value) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    return pattern.test(value);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!emailValidation(form.email)) setErrorMessage("Invalid Email Id");
    else if (!passwordValidation(form.password)) setErrorMessage("Invalid Password");
    else {
      setErrorMessage("");
      dispatch({ type: "LOGIN", data: form });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Logo in top right corner with gold background */}
      <div className="absolute top-6 right-6 z-50">
        <div className="p-3 bg-yellow-400 flex items-center justify-center rounded-md">
          <img 
              src={logo} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
        </div>
      </div>

      {/* Left Section - Background Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative"
        style={{
          backgroundImage: `url(${abc})`, // Changed from abc to logo
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Overlay with opacity */}
        <div className="absolute inset-0 bg-black opacity-70"></div>
        
        <div className="max-w-md relative z-10 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-lg">
              Access your account and continue your journey with us. We're glad to have you back.
            </p>
          </div>
          <div className="bg-yellow-400 bg-opacity-90 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-black p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-black font-semibold">Secure Login</h3>
            </div>
            <p className="text-black text-sm">
              Your security is our priority. All your data is encrypted and securely stored.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <button 
              onClick={() => navigate("/sign-up")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            >
              <FaArrowLeft className="mr-2" /> Register Here
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login to Your Account</h1>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          <Spin spinning={isLogingIn}>
            <form onSubmit={handleOnSubmit} className="bg-white rounded-lg">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
                <Input 
                  value={form.email} 
                  required 
                  name="email" 
                  onChange={handleOnChange} 
                  placeholder="Enter your email" 
                  style={{ fontSize: "16px", height: "48px", borderRadius: "8px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  type="email"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 font-medium">Password</label>
                  <Link to="/forget-password" className="text-blue-600 hover:text-blue-800 text-sm">
                    Forgot password?
                  </Link>
                </div>
                <Input.Password 
                  value={form.password} 
                  required 
                  name="password" 
                  onChange={handleOnChange} 
                  placeholder="••••••••" 
                  style={{ fontSize: "16px", height: "48px", borderRadius: "8px" }} 
                  className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                />
              </div>
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                </div>
              )}
              
              <button 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg" 
                type="submit"
              >
                Sign in
              </button>
              
              <Divider className="my-6">Or</Divider>
              
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 rounded-lg py-3 px-4 text-gray-700 hover:text-gray-900 transition duration-200 font-medium mb-6"
              >
                <FcGoogle className="text-lg" />
                Sign in with Google
              </button>
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link 
                    to="/sign-up" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </Spin>
          
          <div className="mt-8 text-center">
            <Link 
              to="/help" 
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm"
            >
              <MdHelpOutline className="mr-1" /> Need help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;