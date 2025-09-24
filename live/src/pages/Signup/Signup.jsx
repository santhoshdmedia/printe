import { Divider, Input, Spin, Tooltip, message } from "antd";
import React, { useEffect, useState } from "react";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import abc from "../../assets/logo/ABC.jpg";
import logo from "../../assets/logo/without_bg.png";

const Signup = () => {
  const dispatch = useDispatch();
  const { isSigningUp, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    let local_item = localStorage.getItem("redirect_url");
    if (isAuth) {
      setIsExiting(true);
      setTimeout(() => {
        navigate(local_item ? `/product/${local_item}` : "/");
      }, 500);
    }
  }, [isAuth, navigate]);

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

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    if (name === "password") {
      checkPasswordStrength(value);
      if (form.confirmPassword) {
        confirmPasswordValidation(form.confirmPassword, value);
      }
    }

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
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[\W_]/.test(password)) strength += 1;

    switch (strength) {
      case 1:
        message = "Very Weak"; color = "#ff4d4f"; break;
      case 2:
        message = "Weak"; color = "#ff7a45"; break;
      case 3:
        message = "Medium"; color = "#ffa940"; break;
      case 4:
        message = "Strong"; color = "#73d13d"; break;
      case 5:
        message = "Very Strong"; color = "#52c41a"; break;
      default:
        message = ""; color = "transparent";
    }
    setPasswordStrength({ level: strength, message, color });
  };

  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = pattern.test(value);
    setErrorMessage((prev) => ({ ...prev, email: isValid ? "" : "Invalid email address." }));
    return isValid;
  };

  const passwordValidation = (value) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const isValid = pattern.test(value);
    setErrorMessage((prev) => ({
      ...prev,
      password: isValid ? "" : "Password must be at least 8 characters long, including 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character."
    }));
    return isValid;
  };

  const confirmPasswordValidation = (confirmPassword, password = form.password) => {
    const isValid = confirmPassword === password;
    setErrorMessage((prev) => ({
      ...prev,
      confirmPassword: isValid ? "" : "Passwords do not match."
    }));
    return isValid;
  };

  const nameValidation = (value) => {
    const pattern = /^[a-zA-Z]+([ ][a-zA-Z]+)*$/;
    const isValid = pattern.test(value) && value.length >= 3 && value.length <= 50;
    setErrorMessage((prev) => ({
      ...prev,
      name: isValid ? "" : "Name must be at least 3 characters long and contain only alphabets."
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
      dispatch({ type: "auth/SIGNUP", data: form });
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
      <div className={`w-full lg:w-1/2  flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto relative transition-all duration-500 ${isMounted ? (isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100") : "translate-x-full opacity-0"}`}>
        <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10">
          <div className="p-1.5 sm:p-2 md:p-3 bg-yellow-400 flex items-center justify-center rounded-md">
            <Link to={'/'}>
              <img src={logo} alt="Logo" className="h-5 sm:h-6 md:h-8 w-auto object-contain"/>
            </Link>
          </div>
        </div>
        <div className="w-full max-w-xl mt-10 sm:mt-12 md:mt-16 shadow-lg p-10 rounded-lg">
          <div className="mb-4 flex justify-end">
            <button onClick={() => handleNavigation("/")} className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
              Home <FaArrowRight className="ml-1" />
            </button>
          </div>
          <Spin spinning={isSigningUp}>
            <form onSubmit={handleOnSubmit} className="bg-white rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
                <Input value={form.name} required name="name" onChange={handleOnChange} placeholder="Enter your full name" />
                {errorMessage.name && <p className="text-red-500 text-xs mt-1">{errorMessage.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
                <Input value={form.email} required name="email" onChange={handleOnChange} type="email" placeholder="Enter your email"/>
                {errorMessage.email && <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>}
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-medium">Password</label>
                  <Tooltip title={passwordRequirementsTooltip}>
                    <span className="text-gray-400 cursor-help text-sm"><FaInfoCircle /></span>
                  </Tooltip>
                </div>
                <Input.Password value={form.password} required name="password" onChange={handleOnChange} placeholder="Create a strong password"/>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                        {passwordStrength.message}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-300" style={{
                        width: `${(passwordStrength.level / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}></div>
                    </div>
                  </div>
                )}
                {errorMessage.password && <p className="text-red-500 text-xs mt-1">{errorMessage.password}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
                <Input.Password value={form.confirmPassword} required name="confirmPassword" onChange={handleOnChange} placeholder="Confirm your password"/>
                {errorMessage.confirmPassword && <p className="text-red-500 text-xs mt-1">{errorMessage.confirmPassword}</p>}
              </div>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2.5 px-4 rounded-lg shadow-md" type="submit">
                Create Account
              </button>
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={(e) => { e.preventDefault(); handleNavigation("/login"); }}>
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </Spin>
          <div className="mt-6 text-center">
            <Link to="/help" className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm"
              onClick={(e) => { e.preventDefault(); handleNavigation("/help"); }}>
              <MdHelpOutline className="mr-1"/> Need help?
            </Link>
          </div>
        </div>
      </div>
      {/* Right Section */}
      <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-6 fixed right-0 top-0 h-full transition-all duration-500 ${isMounted ? (isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100") : "-translate-x-full opacity-0"}`}
        style={{ backgroundImage: `url(${abc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="max-w-md relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">Create Your Account</h1>
          <p className="text-white text-base mb-6">Join us today and unlock a world of possibilities.</p>
          <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg">
            <h3 className="text-black font-semibold mb-2">Benefits of Joining</h3>
            <ul className="text-black text-sm space-y-1.5">
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

export default Signup;
