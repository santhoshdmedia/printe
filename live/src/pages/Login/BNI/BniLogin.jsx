import React, { useEffect, useState, useRef } from "react";
import { Input, Form, Spin, message, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { MdHelpOutline } from "react-icons/md";
import logo from "../../../assets/logo/without_bg.png";
import Bnilogo from "../../../assets/BNI/bni.png";
import abc from "../../../assets/BNI/Group.png";

const BniLogin = () => {
  const dispatch = useDispatch();
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpRefs = useRef([]);

  // Form state
  const [form, setForm] = useState({
    memberName: "",
    businessName: "",
    contactNumber: "",
    email: "",
    chapterName: "",
    city: "",
    category: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  const [errorMessage, setErrorMessage] = useState({
    memberName: "",
    businessName: "",
    contactNumber: "",
    email: "",
    chapterName: "",
    city: "",
    category: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordStrength, setPasswordStrength] = useState({
    level: 0,
    message: "Very Weak",
    color: "#ef4444"
  });

  useEffect(() => {
    setIsMounted(true);

    let local_item = localStorage.getItem("redirect_url");
    if (isAuth) {
      if (local_item) {
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
  }, [isAuth, navigate]);

  // OTP timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    // Clean input values
    if (name === "memberName" || name === "businessName" || name === "chapterName" || name === "city" || name === "category") {
      const cleanedValue = value.replace(/\s+/g, " ").trimStart();
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedValue }));
    } else if (name === "contactNumber") {
      const cleanedPhone = value.replace(/\D/g, "");
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedPhone }));
    } else if (name === "password") {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
      checkPasswordStrength(value);
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }

    // Validate inputs
    if (name === "memberName") {
      memberNameValidation(value);
    } else if (name === "contactNumber") {
      contactNumberValidation(value);
    } else if (name === "email") {
      emailValidation(value);
    } else if (name === "password") {
      passwordValidation(value);
    } else if (name === "confirmPassword") {
      confirmPasswordValidation(value, form.password);
    }
  };

  // OTP handling functions
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = form.otp.split('');
    newOtp[index] = value;
    setForm(prev => ({ ...prev, otp: newOtp.join('') }));

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !form.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      setForm(prev => ({ ...prev, otp: pastedData }));
      
      // Focus the last input
      setTimeout(() => {
        otpRefs.current[5]?.focus();
      }, 0);
    }
  };

  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    
    // Dispatch resend OTP action
    dispatch({
      type: "RESEND_OTP",
      data: { email: form.email }
    });
    
    setOtpTimer(60);
    message.success("OTP resent successfully!");
  };

  // Validation functions
  const memberNameValidation = (value) => {
    const cleanedName = value.replace(/\s+/g, " ").trim();
    const pattern = /^[a-zA-Z\s.'-]+$/;
    const isValid =
      pattern.test(cleanedName) &&
      cleanedName.length >= 2 &&
      cleanedName.length <= 50;

    setErrorMessage((prevError) => ({
      ...prevError,
      memberName: isValid
        ? ""
        : "Name must be 2-50 characters and contain only letters, spaces, apostrophes, periods, and hyphens.",
    }));

    return isValid;
  };

  const contactNumberValidation = (value) => {
    const isValid = value.length >= 10 && value.length <= 15;

    setErrorMessage((prevError) => ({
      ...prevError,
      contactNumber: isValid ? "" : "Contact number must be 10-15 digits.",
    }));

    return isValid;
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

  const otpValidation = (value) => {
    const isValid = value.length === 6 && /^\d+$/.test(value);
    
    setErrorMessage((prevError) => ({
      ...prevError,
      otp: isValid ? "" : "Please enter a valid 6-digit OTP.",
    }));

    return isValid;
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    let message = "Very Weak";
    let color = "#ef4444";

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        message = "Very Weak";
        color = "#ef4444";
        break;
      case 2:
        message = "Weak";
        color = "#f97316";
        break;
      case 3:
        message = "Fair";
        color = "#eab308";
        break;
      case 4:
        message = "Good";
        color = "#84cc16";
        break;
      case 5:
        message = "Strong";
        color = "#22c55e";
        break;
    }

    setPasswordStrength({
      level: strength,
      message,
      color
    });

    return strength >= 3;
  };

  const passwordValidation = (value) => {
    const isStrong = checkPasswordStrength(value);
    const isValid = value.length >= 8 && isStrong;

    setErrorMessage((prevError) => ({
      ...prevError,
      password: isValid ? "" : "Password must be at least 8 characters with mix of letters, numbers, and symbols.",
    }));

    return isValid;
  };

  const confirmPasswordValidation = (value, password) => {
    const isValid = value === password && value.length > 0;

    setErrorMessage((prevError) => ({
      ...prevError,
      confirmPassword: isValid ? "" : "Passwords do not match.",
    }));

    return isValid;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    const cleanedForm = {
      memberName: form.memberName.replace(/\s+/g, " ").trim(),
      businessName: form.businessName.replace(/\s+/g, " ").trim(),
      contactNumber: form.contactNumber,
      email: form.email.trim(),
      chapterName: form.chapterName.replace(/\s+/g, " ").trim(),
      city: form.city.replace(/\s+/g, " ").trim(),
      category: form.category.replace(/\s+/g, " ").trim(),
    };

    const isMemberNameValid = memberNameValidation(cleanedForm.memberName);
    const isContactValid = contactNumberValidation(cleanedForm.contactNumber);
    const isEmailValid = emailValidation(cleanedForm.email);

    if (isMemberNameValid && isContactValid && isEmailValid) {
      // Update the form state with cleaned values
      setForm(prev => ({ ...prev, ...cleanedForm }));

      // Dispatch signup action to send OTP
      dispatch({
        type: "SIGNUP",
        data: cleanedForm,
      });

      // Move to OTP step
      setCurrentStep(2);
      setOtpTimer(60);
      message.success("OTP sent to your email!");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otpValidation(form.otp)) {
      setIsVerifyingOtp(true);
      
      // Dispatch OTP verification action
      dispatch({
        type: "VERIFY_OTP",
        data: { email: form.email, otp: form.otp }
      });
      
      setTimeout(() => {
        setIsVerifyingOtp(false);
        setCurrentStep(3);
        message.success("Email verified successfully!");
      }, 1500);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    const isPasswordValid = passwordValidation(form.password);
    const isConfirmValid = confirmPasswordValidation(form.confirmPassword, form.password);
    
    if (isPasswordValid && isConfirmValid) {
      // Dispatch final registration action
      dispatch({
        type: "COMPLETE_REGISTRATION",
        data: {
          ...form,
          password: form.password
        }
      });
      
      message.success("Account created successfully!");
      // Navigation will be handled by the useEffect when isAuth becomes true
    }
  };

  const passwordRequirementsTooltip = (
    <div className="text-xs">
      <p className="font-medium mb-1">Password Requirements:</p>
      <ul className="list-disc pl-3 space-y-1">
        <li>At least 8 characters</li>
        <li>One uppercase letter</li>
        <li>One lowercase letter</li>
        <li>One number</li>
        <li>One special character</li>
      </ul>
    </div>
  );

  return (
    <div
      className={`w-full min-h-screen flex !font-primary transition-all duration-500 ${
        isMounted
          ? isExiting
            ? "exit-animation"
            : "enter-animation"
          : "opacity-0"
      }`}
    >
      {/* Left Section - BNI Privilege Login Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 overflow-auto relative transition-all duration-500 ${
          isMounted
            ? isExiting
              ? "translate-x-0 opacity-0"
              : "translate-x-full opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="w-full max-w-3xl mt-12 md:mt-16">
          <div className="mb-1 !w-full flex justify-between items-end">
            <img src={Bnilogo} alt="logo" className="h-28" />
            
            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm md:text-base"
              >
                Home <FaArrowRight className="ml-1" />
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <div className={`ml-2 text-sm ${currentStep >= 1 ? 'text-black font-medium' : 'text-gray-500'}`}>
                  Details
                </div>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-gray-200"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <div className={`ml-2 text-sm ${currentStep >= 2 ? 'text-black font-medium' : 'text-gray-500'}`}>
                  OTP
                </div>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-gray-200"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <div className={`ml-2 text-sm ${currentStep >= 3 ? 'text-black font-medium' : 'text-gray-500'}`}>
                  Password
                </div>
              </div>
            </div>
          </div>

          <Spin spinning={isLogingIn}>
            {/* Step 1: Member Details */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Submit} className="bg-white rounded-lg flex flex-col gap-3">
                {/* Member name */}
                <div className="mb-4 md:mb-6">
                  <Input
                    value={form.memberName}
                    required
                    name="memberName"
                    onChange={handleOnChange}
                    placeholder="Member Name"
                    style={{
                      fontSize: "16px",
                      border: "none",
                      borderBottom: "",
                      borderRadius: "none",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                  />
                  {errorMessage.memberName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.memberName}
                    </p>
                  )}
                </div>

                {/* Business name */}
                <div className="mb-4 md:mb-6">
                  <Input
                    value={form.businessName}
                    required
                    name="businessName"
                    onChange={handleOnChange}
                    placeholder="Enter business name"
                    style={{
                      fontSize: "16px",
                      border: "none",
                      borderBottom: "",
                      borderRadius: "none",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                  />
                </div>

                {/* Contact number */}
                <div className="mb-4 md:mb-6">
                  <Input
                    value={form.contactNumber}
                    required
                    name="contactNumber"
                    onChange={handleOnChange}
                    placeholder="Enter contact number"
                    style={{
                      fontSize: "14px",
                      border: "none",
                      borderBottom: "",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                    type="tel"
                  />
                  {errorMessage.contactNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.contactNumber}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4 md:mb-6">
                  <Input
                    value={form.email}
                    required
                    name="email"
                    onChange={handleOnChange}
                    placeholder="Enter email address"
                    style={{
                      fontSize: "14px",
                      border: "none",
                      borderBottom: "",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                    type="email"
                  />
                  {errorMessage.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.email}
                    </p>
                  )}
                </div>

                {/* Chapter Name */}
                <div className="mb-4 md:mb-6">
                  <Input
                    value={form.chapterName}
                    required
                    name="chapterName"
                    onChange={handleOnChange}
                    placeholder="Enter chapter name"
                    style={{
                      fontSize: "14px",
                      border: "none",
                      borderBottom: "",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                  />
                </div>

                {/* City */}
                <div className="mb-4 md:mb-6">
                  <Input
                    value={form.city}
                    required
                    name="city"
                    onChange={handleOnChange}
                    placeholder="Enter city"
                    style={{
                      fontSize: "14px",
                      border: "none",
                      borderBottom: "",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                  />
                </div>

                {/* Category */}
                <div className="mb-6 md:mb-8">
                  <Input
                    value={form.category}
                    required
                    name="category"
                    onChange={handleOnChange}
                    placeholder="Enter category"
                    style={{
                      fontSize: "14px",
                      border: "none",
                      borderBottom: "",
                      borderColor: "#d1d5db",
                    }}
                    className="w-full hover:border-gray-400 focus:border-black focus:shadow-none"
                  />
                </div>

                {/* Next Button */}
                <button
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  type="submit"
                >
                  Next
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="bg-white rounded-lg">
                <div className="mb-6 text-center">
                  <p className="text-gray-600 mb-2">
                    Enter the 6-digit OTP sent to
                  </p>
                  <p className="font-medium text-gray-800">{form.email}</p>
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-4 font-medium text-sm md:text-base text-center">
                    Enter 6-digit OTP *
                  </label>

                  {/* OTP Boxes Container */}
                  <div className="flex justify-center gap-2 md:gap-3 mb-2">
                    {[...Array(6)].map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={form.otp[index] || ""}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-gray-200 focus:outline-none transition duration-200"
                        ref={(el) => (otpRefs.current[index] = el)}
                      />
                    ))}
                  </div>

                  {/* Hidden input for form submission */}
                  <input
                    type="hidden"
                    name="otp"
                    value={form.otp}
                    onChange={handleOnChange}
                  />

                  {errorMessage.otp && (
                    <p className="text-red-500 text-xs mt-2 text-center">
                      {errorMessage.otp}
                    </p>
                  )}
                </div>

                <div className="mb-6 text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpTimer > 0}
                    className={`text-sm ${
                      otpTimer > 0
                        ? "text-gray-400"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200 text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    type="submit"
                    disabled={isVerifyingOtp}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Password Setup */}
            {currentStep === 3 && (
              <form
                onSubmit={handleFinalSubmit}
                className="bg-white rounded-lg"
              >
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Email Verified
                        </p>
                        <p className="text-gray-600 text-sm">{form.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 font-medium text-sm md:text-base">
                      Password *
                    </label>
                    <Tooltip
                      title={passwordRequirementsTooltip}
                      placement="topRight"
                    >
                      <span className="text-gray-400 hover:text-gray-600 cursor-help">
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
                    style={{
                      fontSize: "14px",
                      height: "44px",
                      borderRadius: "8px",
                    }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-black"
                  />

                  {/* Password Strength Indicator */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          Password strength:
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${(passwordStrength.level / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {errorMessage.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.password}
                    </p>
                  )}
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">
                    Confirm Password *
                  </label>
                  <Input.Password
                    value={form.confirmPassword}
                    required
                    name="confirmPassword"
                    onChange={handleOnChange}
                    placeholder="Confirm your password"
                    style={{
                      fontSize: "14px",
                      height: "44px",
                      borderRadius: "8px",
                    }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-black"
                  />
                  {errorMessage.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200 text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    type="submit"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}
          </Spin>

          {/* Help link */}
          <div className="mt-6 md:mt-8 text-center">
            <Link
              to="/help"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-xs md:text-sm"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/help");
              }}
            >
              <MdHelpOutline className="mr-1" /> Need help?
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - BNI Illustration */}
      <div
        className={`hidden  lg:flex lg:w-1/2 items-center justify-center p-8 fixed right-0 top-0 h-full transition-all duration-500 ${
          isMounted
            ? isExiting
              ? " translate-x-0 opacity-0"
              : "-translate-x-full opacity-100"
            : "-translate-x-full opacity-0"
        }`}
        style={{
          backgroundImage: `url(${abc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-[80%] relative z-10 text-center flex flex-col justify-between h-[80%]">
          {/* BNI Member Text */}
          <div className="w-full flex flex-col justify-start items-start">
           <img src={logo} alt="logo" className="w-[70%] h-fit z-20"/>
           <h1 className="text-6xl font-bold text-black mb-4 text-left">
              <span className="text-red-600">BNI</span> Privilege Login
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-black mb-4 text-center">
              Welcome to printe<span className="text-black">!</span>
            </h1>
            <p className="text-black text-xl leading-relaxed text-justify">
              This exclusive login grants early access to premium branding products. 
              Specially crafted for <span className="text-red-500 font-bold">BNI </span> 
               privileged members, it is designed to address challenges and deliver tailored solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BniLogin;