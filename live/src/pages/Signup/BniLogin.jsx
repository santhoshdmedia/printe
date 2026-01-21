import React, { useEffect, useState, useRef } from "react";
import { Input, Form, Spin, message, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { MdHelpOutline } from "react-icons/md";
import logo from "../../assets/logo/without_bg.png";
import Bnilogo from "../../assets/BNI/bni.png";
import abc from "../../assets/BNI/Group.png";
import { sendOtp, verifyOtp, resendOtp } from "../../helper/api_helper";

const BniLogin = () => {
  const dispatch = useDispatch();
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
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
    } else if (name === "otp") {
      const cleanedOtp = value.replace(/\D/g, "").slice(0, 6);
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedOtp }));
      otpValidation(cleanedOtp);
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
    const updatedOtp = newOtp.join('');
    setForm(prev => ({ ...prev, otp: updatedOtp }));

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Validate OTP
    if (updatedOtp.length === 6) {
      otpValidation(updatedOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !form.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const otpDigits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (otpDigits.length === 6) {
      setForm(prev => ({ ...prev, otp: otpDigits }));

      // Focus the last input
      setTimeout(() => {
        otpRefs.current[5]?.focus();
      }, 0);

      // Validate OTP
      otpValidation(otpDigits);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) {
      message.warning(`Please wait ${otpTimer} seconds before resending OTP`);
      return;
    }

    try {
      const response = await resendOtp({
        email: form.email,
      });

      if (response.data.success) {
        message.success("OTP resent successfully!");
        setOtpTimer(60);
      } else {
        message.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to resend OTP");
    }
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

    if (password.length === 0) {
      setPasswordStrength({ level: 0, message: "", color: "transparent" });
      return;
    }

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
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const isValid = pattern.test(value);

    setErrorMessage((prevError) => ({
      ...prevError,
      password: isValid
        ? ""
        : "Password must be at least 8 characters with mix of uppercase, lowercase, numbers, and symbols.",
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
      setIsSendingOtp(true);
      try {
        // Send OTP to email using API
        const response = await sendOtp({
          email: cleanedForm.email,
          phone: cleanedForm.contactNumber,
        });

        if (response.data.success) {
          // Update the form state with cleaned values
          setForm(prev => ({ ...prev, ...cleanedForm }));

          // Move to OTP step
          setCurrentStep(2);
          setOtpTimer(60);
          message.success("OTP sent to your email!");
        } else {
          message.error(response.data.message || "Failed to send OTP");
        }
      } catch (error) {
        message.error(
          error.response?.data?.message ||
          "Failed to send OTP. Please try again."
        );
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otpValidation(form.otp)) {
      setIsVerifyingOtp(true);

      try {
        // Verify OTP using API
        const response = await verifyOtp({
          email: form.email,
          otp: form.otp,
        });

        if (response.data.success) {
          setIsVerifyingOtp(false);
          setCurrentStep(3);
          message.success("Email verified successfully!");
        } else {
          message.error(response.data.message || "Invalid OTP");
          setIsVerifyingOtp(false);
        }
      } catch (error) {
        message.error(error.response?.data?.message || "Failed to verify OTP");
        setIsVerifyingOtp(false);
      }
    }
  };


  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const isPasswordValid = passwordValidation(form.password);
    const isConfirmValid = confirmPasswordValidation(form.confirmPassword, form.password);

    if (isPasswordValid && isConfirmValid) {
      // Dispatch final registration action with all BNI-specific data
      dispatch({
        type: "BNISIGNUP",
        data: {
          name: form.memberName,
          phone: form.contactNumber,
          email: form.email,
          password: form.password,
          otp: form.otp,
          businessName: form.businessName,
          chapterName: form.chapterName,
          city: form.city,
          category: form.category,
        }
      });

      message.success("BNI account created successfully!");
      // Navigation will be handled by the useEffect when isAuth becomes true
    }
  };

  const passwordRequirementsTooltip = (
    <div className="text-xs">
      <p className="font-medium mb-1">Password Requirements:</p>
      <ul className="list-disc pl-3 space-y-1">
        <li>At least 8 characters</li>
        <li>One uppercase letter (A-Z)</li>
        <li>One lowercase letter (a-z)</li>
        <li>One number (0-9)</li>
        <li>One special character (!@#$%^&* etc.)</li>
      </ul>
    </div>
  );

  return (
    <div
      className={`w-full min-h-screen flex flex-col lg:flex-row !font-primary transition-all duration-500 ${isMounted
          ? isExiting
            ? "exit-animation"
            : "enter-animation"
          : "opacity-0"
        }`}
    >
      {/* Left Section - BNI Privilege Login Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center lg:px-4 py-6 sm:p-6 lg:p-8 overflow-auto transition-all duration-500 
                    translate-x-0 bg-gradient-to-br from-gray-50 to-white relative
                    ${isMounted
            ? isExiting
              ? "opacity-0"
              : "opacity-100"
            : "opacity-0"
          }
                    ${isMounted
            ? isExiting
              ? "lg:translate-x-0 lg:opacity-0"
              : "lg:translate-x-full lg:opacity-100"
            : "lg:translate-x-full lg:opacity-0"
          }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-red-100 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-1/4 right-20 w-32 h-32 bg-yellow-100 rounded-full opacity-20 animate-float-delay-1"></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-blue-100 rounded-full opacity-25 animate-float-delay-2"></div>
          <div className="absolute bottom-20 right-1/3 w-16 h-16 bg-purple-100 rounded-full opacity-30 animate-float-delay-3"></div>

          {/* Gradient orbs */}
          <div className="absolute top-1/3 left-0 w-40 h-40 bg-gradient-to-br from-red-200 to-yellow-200 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-0 w-48 h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20 animate-pulse-slow-delay"></div>

          {/* Geometric shapes */}
          <div className="absolute top-20 right-1/4 w-12 h-12 border-2 border-gray-300 opacity-20 rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-40 left-1/3 w-16 h-16 border-2 border-red-300 opacity-20 animate-spin-slow-reverse"></div>
        </div>

        <div className="w-full -top-6 relative z-10">
          {/* Mobile Header with Logo and Title */}
          <div className="mb-6 lg:mb-8 text-center lg:hidden">
            <div className="flex justify-center mb-2 bg-[#facc15] relative">
              <div
                className="absolute w-full top-0 h-32 bg-[#facc15] rounded-full -z-10"
                style={{ clipPath: "ellipse(50% 40% at 50% 50%)" }}
              ></div>

              <img src={logo} alt="Logo" className="h-16 sm:h-24 drop-shadow-md" />
            </div>
            <h1 className="text-2xl  sm:text-3xl font-bold text-gray-900 mb-2">
              <span className="text-red-600">BNI</span> Privilege Login
            </h1>
            <div className="flex justify-center my-4">
              <img src={Bnilogo} alt="BNI Logo" className="h-20 sm:h-24 drop-shadow-md" />
            </div>

          </div>

          {/* Desktop Logo */}
          <div className="hidden lg:flex mb-6 justify-center">
            <img src={Bnilogo} alt="BNI Logo" className="h-24 lg:h-28 drop-shadow-md" />
          </div>

          <div className="px-4">
            <Spin spinning={isLogingIn || isSendingOtp || isVerifyingOtp}>
              {/* Step 1: Member Details */}
              {currentStep === 1 && (
                <form onSubmit={handleStep1Submit} className="bg-transparent rounded-2xl shadow-xl p-3 md:p-5 sm:p-6 lg:p-8 border border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 text-center">
                    Member Information
                  </h2>

                  {/* Member name */}
                  <div className="flex gap-2 md:block lg:block">
                    <div className="mb-4">
                      <Input
                        value={form.memberName}
                        required
                        name="memberName"
                        onChange={handleOnChange}
                        placeholder="Member Name *"
                        style={{
                          fontSize: "15px",
                          height: "48px",
                          border: "none",
                          borderBottom: "2px solid #d1d5db",
                          borderRadius: "0",
                          boxShadow: "none",
                          background: "transparent"
                        }}
                        className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                      />
                      {errorMessage.memberName && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <span className="mr-1">⚠</span> {errorMessage.memberName}
                        </p>
                      )}
                    </div>

                    {/* Business name */}
                    <div className="mb-4">
                      <Input
                        value={form.businessName}
                        required
                        name="businessName"
                        onChange={handleOnChange}
                        placeholder="Business Name *"
                        style={{
                          fontSize: "15px",
                          height: "48px",
                          border: "none",
                          borderBottom: "2px solid #d1d5db",
                          borderRadius: "0",
                          boxShadow: "none",
                          background: "transparent"

                        }}
                        className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 md:block lg:block">
                    {/* Contact number */}
                    <div className="mb-4">
                      <Input
                        value={form.contactNumber}
                        required
                        name="contactNumber"
                        onChange={handleOnChange}
                        placeholder="Contact Number *"
                        style={{
                          fontSize: "15px",
                          height: "48px",
                          border: "none",
                          borderBottom: "2px solid #d1d5db",
                          borderRadius: "0",
                          boxShadow: "none",
                          background: "transparent"

                        }}
                        className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                        type="tel"
                      />
                      {errorMessage.contactNumber && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <span className="mr-1">⚠</span> {errorMessage.contactNumber}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                      <Input
                        value={form.email}
                        required
                        name="email"
                        onChange={handleOnChange}
                        placeholder="Email Address *"
                        style={{
                          fontSize: "15px",
                          height: "48px",
                          border: "none",
                          borderBottom: "2px solid #d1d5db",
                          borderRadius: "0",
                          boxShadow: "none",
                          background: "transparent"

                        }}
                        className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                        type="email"
                      />
                      {errorMessage.email && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <span className="mr-1">⚠</span> {errorMessage.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chapter Name & City in Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Input
                        value={form.chapterName}
                        required
                        name="chapterName"
                        onChange={handleOnChange}
                        placeholder="Chapter Name *"
                        style={{
                          fontSize: "15px",
                          height: "48px",
                          border: "none",
                          borderBottom: "2px solid #d1d5db",
                          borderRadius: "0",
                          boxShadow: "none",
                          background: "transparent"
                        }}
                        className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                      />
                    </div>

                    <div>
                      <Input
                        value={form.city}
                        required
                        name="city"
                        onChange={handleOnChange}
                        placeholder="City *"
                        style={{
                          fontSize: "15px",
                          height: "48px",
                          border: "none",
                          borderBottom: "2px solid #d1d5db",
                          borderRadius: "0",
                          boxShadow: "none",
                          background: "transparent"

                        }}
                        className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <Input
                      value={form.category}
                      required
                      name="category"
                      onChange={handleOnChange}
                      placeholder="Business Category *"
                      style={{
                        fontSize: "15px",
                        height: "48px",
                        border: "none",
                        borderBottom: "2px solid #d1d5db",
                        borderRadius: "0",
                        boxShadow: "none",
                        background: "transparent"

                      }}
                      className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-semibold py-3.5 sm:py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? (
                      <>
                        <span className="animate-spin">⏳</span> Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP <FaArrowRight />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 border border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
                    Verify Your Email
                  </h2>

                  <div className="mb-6 text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-gray-600 text-sm mb-1">
                      We've sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-gray-900 text-base break-all">{form.email}</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-4 font-medium text-base text-center">
                      Enter Verification Code
                    </label>

                    {/* OTP Boxes Container */}
                    <div className="flex justify-center gap-2 sm:gap-3 mb-3">
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
                          className="w-11 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-black focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 shadow-sm"
                          ref={(el) => (otpRefs.current[index] = el)}
                        />
                      ))}
                    </div>

                    <input
                      type="hidden"
                      name="otp"
                      value={form.otp}
                      onChange={handleOnChange}
                    />

                    {errorMessage.otp && (
                      <p className="text-red-500 text-xs mt-2 text-center flex items-center justify-center">
                        <span className="mr-1">⚠</span> {errorMessage.otp}
                      </p>
                    )}
                  </div>

                  <div className="mb-6 text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpTimer > 0}
                      className={`text-sm font-medium transition-all ${otpTimer > 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800 hover:underline"
                        }`}
                    >
                      {otpTimer > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="animate-pulse">⏱</span> Resend in {otpTimer}s
                        </span>
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all duration-200 text-base"
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
                      type="submit"
                      disabled={isVerifyingOtp}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <span className="animate-spin">⏳</span> Verifying...
                        </>
                      ) : (
                        <>
                          Verify <FaArrowRight />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Password Setup */}
              {currentStep === 3 && (
                <form
                  onSubmit={handleFinalSubmit}
                  className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8 border border-gray-100"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
                    Create Your Password
                  </h2>

                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-6 shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-green-500 p-2 rounded-full mr-3 shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
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
                          <p className="font-semibold text-gray-900 text-base">
                            ✅ Email Verified
                          </p>
                          <p className="text-gray-600 text-sm break-all">{form.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 hover:text-gray-600 cursor-help">
                        <Tooltip
                          title={passwordRequirementsTooltip}
                          placement="topRight"
                        >
                          <FaInfoCircle className="text-lg" />
                        </Tooltip>
                      </span>
                    </div>
                    <Input.Password
                      value={form.password}
                      required
                      name="password"
                      onChange={handleOnChange}
                      placeholder="Create Password *"
                      style={{
                        fontSize: "15px",
                        height: "48px",
                        border: "none",
                        borderBottom: "2px solid #d1d5db",
                        borderRadius: "0",
                        boxShadow: "none",
                        background: "transparent"

                      }}
                      className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                    />

                    {/* Password Strength Indicator */}
                    {form.password && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Password Strength:
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{
                              color: passwordStrength.color,
                              backgroundColor: `${passwordStrength.color}20`
                            }}
                          >
                            {passwordStrength.message}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                          <div
                            className="h-2 rounded-full transition-all duration-500 shadow-sm"
                            style={{
                              width: `${(passwordStrength.level / 5) * 100}%`,
                              backgroundColor: passwordStrength.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {errorMessage.password && (
                      <p className="text-red-500 text-xs mt-2 flex items-center">
                        <span className="mr-1">⚠</span> {errorMessage.password}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <Input.Password
                      value={form.confirmPassword}
                      required
                      name="confirmPassword"
                      onChange={handleOnChange}
                      placeholder="Confirm Password *"
                      style={{
                        fontSize: "15px",
                        height: "48px",
                        border: "none",
                        borderBottom: "2px solid #d1d5db",
                        borderRadius: "0",
                        boxShadow: "none",
                        background: "transparent"

                      }}
                      className="w-full hover:border-b-gray-400 focus:border-b-black focus:shadow-none px-0"
                    />
                    {errorMessage.confirmPassword && (
                      <p className="text-red-500 text-xs mt-2 flex items-center">
                        <span className="mr-1">⚠</span> {errorMessage.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all duration-200 text-base"
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
                      type="submit"
                    >
                      Create Account <FaArrowRight />
                    </button>
                  </div>
                </form>
              )}
            </Spin>

          </div>
          {/* Help link */}
          <div className="mt-6 text-center">
            <Link
              to="/help"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium hover:underline transition-all"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/help");
              }}
            >
              <MdHelpOutline className="mr-2 text-lg" /> Need help?
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - BNI Illustration */}
      <div
        className={`hidden lg:flex lg:w-1/2 items-center justify-center p-6 lg:p-8 transition-all duration-500 ${isMounted
            ? isExiting
              ? "translate-x-0 opacity-0"
              : "-translate-x-full opacity-100"
            : "-translate-x-full opacity-0"
          }`}
        style={{
          backgroundImage: `url(${abc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-[90%] xl:max-w-[80%] relative z-10 text-center flex flex-col justify-between gap-10 h-[80vh]">
          <div className="w-full flex flex-col justify-center items-center">
            <img src={logo} alt="logo" className="w-[60%] lg:w-[70%] xl:w-[80%] h-fit z-20" />
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-black mt-4 lg:mt-6 text-center">
              <span className="text-red-600">BNI</span> Privilege Login
            </h1>
          </div>

          <div className="mb-4 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 lg:mb-6 text-center">
              Welcome to printe<span className="text-black">!</span>
            </h1>
            <p className="text-black text-base lg:text-lg xl:text-xl leading-relaxed text-justify">
              This exclusive login grants early access to premium branding products.
              Specially crafted for <span className="text-red-500 font-bold">BNI </span>
              privileged members, it is designed to address challenges and deliver tailored solutions.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-delay-1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-25px) translateX(-15px);
          }
        }

        @keyframes float-delay-2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(30px) translateX(20px);
          }
        }

        @keyframes float-delay-3 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(-10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-slow-delay {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delay-1 {
          animation: float-delay-1 7s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-delay-2 {
          animation: float-delay-2 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-delay-3 {
          animation: float-delay-3 5s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 5s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BniLogin;