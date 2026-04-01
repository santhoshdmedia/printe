import { Spin, Tooltip, message } from "antd";
import { Input } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import abc from "../../assets/logo/ABC.webp";
import logo from "../../assets/logo/without_bg.png";
import {
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  resendWhatsAppOtp,
} from "../../helper/api_helper";

const Signup = () => {
  const dispatch = useDispatch();
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Step state for multi-step form
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  // Timer for OTP resend (5 minutes = 300 seconds)
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    phone: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    level: 0,
    message: "",
    color: "transparent",
  });

  // OTP Refs for handling multiple inputs
  const otpRefs = useRef([]);

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
  }, [isAuth]);

  // OTP Timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Format timer as MM:SS
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  // OTP handling functions
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = form.otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("");
    setForm({ ...form, otp: updatedOtp });

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Validate OTP
    if (updatedOtp.replace(/\s/g, "").length === 6) {
      otpValidation(updatedOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !form.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const otpDigits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (otpDigits.length === 6) {
      setForm({ ...form, otp: otpDigits });
      setTimeout(() => {
        otpRefs.current[5]?.focus();
      }, 0);
      otpValidation(otpDigits);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const cleanedName = value.replace(/\s+/g, " ").trimStart();
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedName }));
    } else if (name === "phone") {
      const cleanedPhone = value.replace(/\D/g, "");
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedPhone }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }

    if (name === "name") nameValidation(value);
    else if (name === "phone") phoneValidation(value);
    else if (name === "email") emailValidation(value);
    else if (name === "password") {
      checkPasswordStrength(value);
      if (form.confirmPassword) confirmPasswordValidation(form.confirmPassword, value);
    } else if (name === "confirmPassword") {
      confirmPasswordValidation(value, form.password);
    }
  };

  // Validation functions
  const nameValidation = (value) => {
    const cleanedName = value.replace(/\s+/g, " ").trim();
    const pattern = /^[a-zA-Z]+([ ][a-zA-Z]+)*$/;
    const isValid =
      pattern.test(cleanedName) &&
      cleanedName.length >= 3 &&
      cleanedName.length <= 50;

    setErrorMessage((prev) => ({
      ...prev,
      name: isValid
        ? ""
        : "Name must be at least 3 characters and contain only alphabets.",
    }));
    return isValid;
  };

  const phoneValidation = (value) => {
    const isValid = value.length >= 10 && value.length <= 15;
    setErrorMessage((prev) => ({
      ...prev,
      phone: isValid ? "" : "Phone number must be 10-15 digits.",
    }));
    return isValid;
  };

  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = pattern.test(value);
    setErrorMessage((prev) => ({
      ...prev,
      email: isValid ? "" : "Invalid email address.",
    }));
    return isValid;
  };

  const otpValidation = (value) => {
    const isValid = value.length === 6;
    setErrorMessage((prev) => ({
      ...prev,
      otp: isValid ? "" : "OTP must be 6 digits.",
    }));
    return isValid;
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
      case 0:
      case 1:
        message = "Very Weak";
        color = "#ff4d4f";
        break;
      case 2:
        message = "Weak";
        color = "#ff7a45";
        break;
      case 3:
        message = "Medium";
        color = "#ffa940";
        break;
      case 4:
        message = "Strong";
        color = "#73d13d";
        break;
      case 5:
        message = "Very Strong";
        color = "#52c41a";
        break;
      default:
        message = "";
        color = "transparent";
    }

    setPasswordStrength({ level: strength, message, color });
  };

  const passwordValidation = (value) => {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const isValid = pattern.test(value);
    setErrorMessage((prev) => ({
      ...prev,
      password: isValid
        ? ""
        : "Password must be at least 8 characters, including 1 uppercase, 1 lowercase, 1 digit, and 1 special character.",
    }));
    return isValid;
  };

  const confirmPasswordValidation = (confirmPassword, password = form.password) => {
    const isValid = confirmPassword === password;
    setErrorMessage((prev) => ({
      ...prev,
      confirmPassword: isValid ? "" : "Passwords do not match.",
    }));
    return isValid;
  };

  // ─────────────────────────────────────────────
  // Step 1: Send WhatsApp OTP
  // ─────────────────────────────────────────────
  const handleStep1Submit = async (e) => {
    e.preventDefault();

    const cleanedName = form.name.replace(/\s+/g, " ").trim();

    const isNameValid = nameValidation(cleanedName);
    const isPhoneValid = phoneValidation(form.phone);
    const isEmailValid = emailValidation(form.email);

    if (!isNameValid || !isPhoneValid || !isEmailValid) return;

    setIsSendingOtp(true);
    try {
      const response = await sendWhatsAppOtp({ phoneNumber: form.phone });

      if (response.data.success) {
        message.success("OTP sent to your WhatsApp!");
        setIsOtpSent(true);
        setOtpTimer(300); // 5 minutes
        setForm((prev) => ({ ...prev, otp: "", name: cleanedName }));
        setCurrentStep(2);
      } else {
        message.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      message.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ─────────────────────────────────────────────
  // Step 2: Verify WhatsApp OTP
  // ─────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const isOtpValid = otpValidation(form.otp);
    if (!isOtpValid) return;

    setIsVerifyingOtp(true);
    try {
      const response = await verifyWhatsAppOtp({
        phoneNumber: form.phone,
        otp: form.otp,
      });

      if (response.data.success) {
        message.success("OTP verified successfully!");
        setCurrentStep(3);
      } else {
        message.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      message.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to verify OTP"
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ─────────────────────────────────────────────
  // Resend WhatsApp OTP
  // ─────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (otpTimer > 0) {
      message.warning(`Please wait ${formatTimer(otpTimer)} before resending OTP`);
      return;
    }

    try {
      const response = await resendWhatsAppOtp({ phoneNumber: form.phone });

      if (response.data.success) {
        message.success("OTP resent to your WhatsApp!");
        setOtpTimer(300); // 5 minutes
        setForm((prev) => ({ ...prev, otp: "" }));
      } else {
        message.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      message.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to resend OTP"
      );
    }
  };

  // ─────────────────────────────────────────────
  // Step 3: Final Submit
  // ─────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const cleanedName = form.name.replace(/\s+/g, " ").trim();
    const isPasswordValid = passwordValidation(form.password);
    const isConfirmPasswordValid = confirmPasswordValidation(form.confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) return;

    dispatch({
      type: "SIGNUP",
      data: {
        name: cleanedName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        otp: form.otp,
      },
    });
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
    <div
      className={`w-full min-h-screen flex !font-primary transition-all duration-500 ${
        isMounted
          ? isExiting
            ? "exit-animation"
            : "enter-animation"
          : "opacity-0"
      }`}
    >
      {/* Left Section - Signup Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 overflow-auto relative transition-all duration-500 ${
          isMounted
            ? isExiting
              ? "translate-x-full opacity-0"
              : "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6">
          <a
            className="p-2 md:p-3 bg-yellow-400 flex items-center justify-center rounded-md cursor-pointer"
            href="/"
          >
            <img
              fetchpriority="high"
              loading="eager"
              src={logo}
              alt="Logo"
              className="h-6 md:h-8 w-auto object-contain"
            />
          </a>
        </div>

        <div className="w-full max-w-md mt-12 md:mt-16">
          <div className="mb-6 md:mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentStep === 1 && "Create Account"}
              {currentStep === 2 && "Verify WhatsApp OTP"}
              {currentStep === 3 && "Set Password"}
            </h2>
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm md:text-base"
            >
              Home <FaArrowRight className="ml-1" />
            </button>
          </div>

          <Spin spinning={isLogingIn || isSendingOtp || isVerifyingOtp}>

            {/* ── Step 1: Basic Information ── */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Submit} className="bg-white rounded-lg">

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">
                    Full Name *
                  </label>
                  <Input
                    value={form.name}
                    required
                    name="name"
                    onChange={handleOnChange}
                    placeholder="Enter your full name"
                    style={{ fontSize: "14px", height: "44px", borderRadius: "8px" }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  />
                  {errorMessage.name && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage.name}</p>
                  )}
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">
                    Phone Number *
                  </label>
                  <Input
                    value={form.phone}
                    required
                    name="phone"
                    onChange={handleOnChange}
                    placeholder="Enter your phone number (with country code)"
                    style={{ fontSize: "14px", height: "44px", borderRadius: "8px" }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                    type="tel"
                  />
                  {errorMessage.phone && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage.phone}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    A 6-digit OTP will be sent to this WhatsApp number
                  </p>
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">
                    Email Address *
                  </label>
                  <Input
                    value={form.email}
                    required
                    name="email"
                    onChange={handleOnChange}
                    placeholder="Enter your email"
                    style={{ fontSize: "14px", height: "44px", borderRadius: "8px" }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                    type="email"
                  />
                  {errorMessage.email && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>
                  )}
                </div>

                <button
                  className="w-full mb-4 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isSendingOtp}
                >
                  {/* WhatsApp icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 13.8642 2.51413 15.6053 3.40622 17.0942L2.04297 21.9571L7.03564 20.6194C8.48773 21.4329 10.1901 21.9 12.001 21.9C17.5239 21.9 22.001 17.4229 22.001 11.9C22.001 6.37714 17.5239 2 12.001 2ZM16.9383 15.8571C16.7095 16.4714 15.7955 16.9857 15.1383 17.1C14.7098 17.1714 14.1669 17.2 13.5812 17.0143C13.224 16.9 12.7669 16.7571 12.1812 16.5C9.66668 15.4429 8.05241 12.9143 7.92384 12.7429C7.79527 12.5714 6.87241 11.3571 6.87241 10.1C6.87241 8.84286 7.52384 8.22857 7.76668 7.97143C8.00955 7.71429 8.29527 7.65714 8.48098 7.65714C8.6669 7.65714 8.85241 7.65714 9.01527 7.66429C9.19384 7.67143 9.43241 7.6 9.66668 8.17143C9.90952 8.75714 10.4812 10.0143 10.5526 10.1571C10.624 10.3 10.674 10.4714 10.5669 10.6571C10.4598 10.8429 10.4098 10.9571 10.2669 11.1143C10.124 11.2714 9.96668 11.4643 9.83812 11.5929C9.69527 11.7357 9.54812 11.8929 9.71527 12.1857C9.88241 12.4786 10.474 13.4357 11.3526 14.2143C12.474 15.2143 13.4097 15.5286 13.7097 15.6714C14.0097 15.8143 14.1812 15.7857 14.3526 15.5857C14.524 15.3857 15.0955 14.7143 15.2955 14.4143C15.4955 14.1143 15.6955 14.1643 15.9669 14.2571C16.2383 14.35 17.4955 14.9643 17.7955 15.1143C18.0955 15.2643 18.2955 15.3357 18.3669 15.4571C18.4383 15.5786 18.4383 16.1 16.9383 15.8571Z" />
                  </svg>
                  {isSendingOtp ? "Sending OTP..." : "Send OTP via WhatsApp"}
                </button>
              </form>
            )}

            {/* ── Step 2: WhatsApp OTP Verification ── */}
            {currentStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="bg-white rounded-lg">

                {/* WhatsApp info banner */}
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="bg-green-500 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-4 h-4"
                    >
                      <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 13.8642 2.51413 15.6053 3.40622 17.0942L2.04297 21.9571L7.03564 20.6194C8.48773 21.4329 10.1901 21.9 12.001 21.9C17.5239 21.9 22.001 17.4229 22.001 11.9C22.001 6.37714 17.5239 2 12.001 2ZM16.9383 15.8571C16.7095 16.4714 15.7955 16.9857 15.1383 17.1C14.7098 17.1714 14.1669 17.2 13.5812 17.0143C13.224 16.9 12.7669 16.7571 12.1812 16.5C9.66668 15.4429 8.05241 12.9143 7.92384 12.7429C7.79527 12.5714 6.87241 11.3571 6.87241 10.1C6.87241 8.84286 7.52384 8.22857 7.76668 7.97143C8.00955 7.71429 8.29527 7.65714 8.48098 7.65714C8.6669 7.65714 8.85241 7.65714 9.01527 7.66429C9.19384 7.67143 9.43241 7.6 9.66668 8.17143C9.90952 8.75714 10.4812 10.0143 10.5526 10.1571C10.624 10.3 10.674 10.4714 10.5669 10.6571C10.4598 10.8429 10.4098 10.9571 10.2669 11.1143C10.124 11.2714 9.96668 11.4643 9.83812 11.5929C9.69527 11.7357 9.54812 11.8929 9.71527 12.1857C9.88241 12.4786 10.474 13.4357 11.3526 14.2143C12.474 15.2143 13.4097 15.5286 13.7097 15.6714C14.0097 15.8143 14.1812 15.7857 14.3526 15.5857C14.524 15.3857 15.0955 14.7143 15.2955 14.4143C15.4955 14.1143 15.6955 14.1643 15.9669 14.2571C16.2383 14.35 17.4955 14.9643 17.7955 15.1143C18.0955 15.2643 18.2955 15.3357 18.3669 15.4571C18.4383 15.5786 18.4383 16.1 16.9383 15.8571Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-medium text-sm">
                      OTP sent via WhatsApp
                    </p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Sent to{" "}
                      <span className="font-semibold">+{form.phone}</span>
                      . Check your WhatsApp messages.
                    </p>
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-gray-700 mb-4 font-medium text-sm md:text-base text-center">
                    Enter 6-digit OTP *
                  </label>

                  {/* OTP Boxes */}
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
                        className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition duration-200"
                        ref={(el) => (otpRefs.current[index] = el)}
                      />
                    ))}
                  </div>

                  {errorMessage.otp && (
                    <p className="text-red-500 text-xs mt-2 text-center">
                      {errorMessage.otp}
                    </p>
                  )}
                </div>

                {/* Timer & Resend */}
                <div className="mb-6 text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      OTP expires in{" "}
                      <span className="font-semibold text-yellow-600">
                        {formatTimer(otpTimer)}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Resend OTP via WhatsApp
                    </button>
                  )}
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
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    type="submit"
                    disabled={isVerifyingOtp}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Password Setup ── */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalSubmit} className="bg-white rounded-lg">

                <div className="mb-6">
                  <div className="bg-[#facc152c] border border-[#facc15] rounded-lg p-4 mb-4">
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
                        <p className="font-medium text-black">
                          WhatsApp Verified
                        </p>
                        <p className="text-black text-sm">+{form.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 font-medium text-sm md:text-base">
                      Password *
                    </label>
                    <Tooltip title={passwordRequirementsTooltip} placement="topRight">
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
                    style={{ fontSize: "14px", height: "44px", borderRadius: "8px" }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  />

                  {/* Password Strength Indicator */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Password strength:</span>
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
                        />
                      </div>
                    </div>
                  )}

                  {errorMessage.password && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage.password}</p>
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
                    style={{ fontSize: "14px", height: "44px", borderRadius: "8px" }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  />
                  {errorMessage.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage.confirmPassword}</p>
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
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    type="submit"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* Login link for step 1 only */}
            {currentStep === 1 && (
              <div className="text-center mt-4">
                <p className="text-gray-600 text-xs md:text-sm">
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
            )}
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
              <MdHelpOutline className="mr-1" /> Need help?
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div
        className={`hidden lg:flex lg:w-1/2 items-center justify-center p-8 fixed right-0 top-0 h-full transition-all duration-500 ${
          isMounted
            ? isExiting
              ? "-translate-x-full opacity-0"
              : "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
        style={{
          backgroundImage: `url(${abc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="max-w-md relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Create Your Account
            </h1>
            <p className="text-white text-lg">
              Join us today and unlock a world of possibilities. Start your
              journey with our platform.
            </p>
          </div>
          <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-black p-2 rounded-full mr-3">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-black font-semibold">Benefits of Joining</h3>
            </div>
            <ul className="text-black text-sm space-y-2">
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