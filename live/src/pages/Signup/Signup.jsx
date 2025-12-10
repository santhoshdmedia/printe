// import { Divider, Input, Spin, Tooltip } from "antd";
// import React, { useEffect, useState } from "react";
// import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";
// import { MdHelpOutline } from "react-icons/md";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { EnvHelper } from "../../helper/EnvHelper";
// import abc from "../../assets/logo/ABC.jpg";
// import logo from "../../assets/logo/without_bg.png"

// const Signup = () => {
//   const dispatch = useDispatch();
//   const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
//   const navigate = useNavigate();
//   const [isExiting, setIsExiting] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
  
//   useEffect(() => {
//     // Trigger enter animation after component mounts
//     setIsMounted(true);
    
//     let local_item = localStorage.getItem("redirect_url");
//     if (isAuth) {
//       if (local_item) {
//         // Add exit animation before navigation
//         setIsExiting(true);
//         setTimeout(() => {
//           navigate(`/product/${local_item}`);
//         }, 500);
//       } else {
//         setIsExiting(true);
//         setTimeout(() => {
//           navigate("/");
//         }, 500);
//       }
//     }
//   }, [isAuth]);
  
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [errorMessage, setErrorMessage] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [passwordStrength, setPasswordStrength] = useState({
//     level: 0,
//     message: "",
//     color: "transparent"
//   });

//   const handleNavigation = (path) => {
//     setIsExiting(true);
//     setTimeout(() => {
//       navigate(path);
//     }, 500);
//   };

//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prevForm) => ({ ...prevForm, [name]: value }));
    
//     // Check password strength in real-time
//     if (name === "password") {
//       checkPasswordStrength(value);
//       // Also validate confirm password when password changes
//       if (form.confirmPassword) {
//         confirmPasswordValidation(form.confirmPassword, value);
//       }
//     }
    
//     // Validate confirm password in real-time
//     if (name === "confirmPassword") {
//       confirmPasswordValidation(value, form.password);
//     }
//   };

//   const checkPasswordStrength = (password) => {
//     let strength = 0;
//     let message = "";
//     let color = "transparent";

//     if (password.length === 0) {
//       setPasswordStrength({ level: 0, message: "", color });
//       return;
//     }

//     // Check for minimum length
//     if (password.length >= 8) strength += 1;

//     // Check for uppercase letters
//     if (/[A-Z]/.test(password)) strength += 1;

//     // Check for lowercase letters
//     if (/[a-z]/.test(password)) strength += 1;

//     // Check for numbers
//     if (/[0-9]/.test(password)) strength += 1;

//     // Check for special characters
//     if (/[\W_]/.test(password)) strength += 1;

//     // Determine strength level and message
//     switch (strength) {
//       case 0:
//       case 1:
//         message = "Very Weak";
//         color = "#ff4d4f"; // red
//         break;
//       case 2:
//         message = "Weak";
//         color = "#ff7a45"; // orange
//         break;
//       case 3:
//         message = "Medium";
//         color = "#ffa940"; // golden orange
//         break;
//       case 4:
//         message = "Strong";
//         color = "#73d13d"; // green
//         break;
//       case 5:
//         message = "Very Strong";
//         color = "#52c41a"; // dark green
//         break;
//       default:
//         message = "";
//         color = "transparent";
//     }

//     setPasswordStrength({ level: strength, message, color });
//   };

//   const emailValidation = (value) => {
//     const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const isValid = pattern.test(value);

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       email: isValid ? "" : "Invalid email address.",
//     }));

//     return isValid;
//   };

//   const passwordValidation = (value) => {
//     const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
//     const isValid = pattern.test(value);

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       password: isValid ? "" : "Password must be at least 8 characters long, including 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.",
//     }));

//     return isValid;
//   };

//   const confirmPasswordValidation = (confirmPassword, password = form.password) => {
//     const isValid = confirmPassword === password;

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       confirmPassword: isValid ? "" : "Passwords do not match.",
//     }));

//     return isValid;
//   };

//   const nameValidation = (value) => {
//     const pattern = /^[a-zA-Z]+([ ][a-zA-Z]+)*$/;
//     const isValid = pattern.test(value) && value.length >= 3 && value.length <= 50;

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       name: isValid ? "" : "Name must be at least 3 characters long and contain only alphabets.",
//     }));

//     return isValid;
//   };

//   const handleOnSubmit = (e) => {
//     e.preventDefault();

//     const isNameValid = nameValidation(form.name);
//     const isEmailValid = emailValidation(form.email);
//     const isPasswordValid = passwordValidation(form.password);
//     const isConfirmPasswordValid = confirmPasswordValidation(form.confirmPassword);

//     if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
//       dispatch({ type: "SIGNUP", data: form });
//     }
//   };

//   const passwordRequirementsTooltip = (
//     <div className="text-xs">
//       <p>Password must contain:</p>
//       <ul className="list-disc pl-4 mt-1">
//         <li>At least 8 characters</li>
//         <li>One uppercase letter (A-Z)</li>
//         <li>One lowercase letter (a-z)</li>
//         <li>One digit (0-9)</li>
//         <li>One special character (!@#$%^&* etc.)</li>
//       </ul>
//     </div>
//   );

//   return (
//     <div className={`w-full h-screen flex !font-primary transition-all duration-500 ${isMounted ? (isExiting ? "exit-animation" : "enter-animation") : "opacity-0"}`}>
//       {/* Left Section - Signup Form */}
//       <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 overflow-hidden relative transition-all duration-500 ${isMounted ? (isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100") : "translate-x-full opacity-0"}`}>
//         {/* Logo in top left corner with gold background */}
//         <div className="absolute top-6 left-6">
//           <div className=" p-3 bg-yellow-400 flex items-center justify-center rounded-md">
//             <img 
//               src={logo} 
//               alt="Logo" 
//               className="h-8 w-auto object-contain"
//             />
//           </div>
//         </div>

//         <div className="w-full max-w-md mt-16">
//           <div className="mb-8 flex justify-end">
//             <button 
//               onClick={() => handleNavigation("/")} 
//               className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
//             >
//               Home <FaArrowRight className="ml-1" /> 
//             </button>
//           </div>

//           <Spin spinning={isLogingIn}>
//             <form onSubmit={handleOnSubmit} className="bg-white rounded-lg">
//               <div className="mb-6">
//                 <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
//                 <Input 
//                   value={form.name} 
//                   required 
//                   name="name" 
//                   onChange={handleOnChange} 
//                   placeholder="Enter your full name" 
//                   style={{ fontSize: "16px", height: "48px", borderRadius: "8px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                 />
//                 {errorMessage.name && <p className="text-red-500 text-xs mt-1">{errorMessage.name}</p>}
//               </div>
              
//               <div className="mb-6">
//                 <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
//                 <Input 
//                   value={form.email} 
//                   required 
//                   name="email" 
//                   onChange={handleOnChange} 
//                   placeholder="Enter your email" 
//                   style={{ fontSize: "16px", height: "48px", borderRadius: "8px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                   type="email"
//                 />
//                 {errorMessage.email && <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>}
//               </div>
              
//               <div className="mb-6">
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="block text-gray-700 font-medium">Password</label>
//                   <Tooltip title={passwordRequirementsTooltip} placement="topRight">
//                     <span className="text-gray-400 hover:text-gray-600 cursor-help">
//                       <FaInfoCircle />
//                     </span>
//                   </Tooltip>
//                 </div>
//                 <Input.Password 
//                   value={form.password} 
//                   required 
//                   name="password" 
//                   onChange={handleOnChange} 
//                   placeholder="Create a strong password" 
//                   style={{ fontSize: "16px", height: "48px", borderRadius: "8px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                 />
                
//                 {/* Password Strength Indicator */}
//                 {form.password && (
//                   <div className="mt-2">
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-xs text-gray-500">Password strength:</span>
//                       <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
//                         {passwordStrength.message}
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-1.5">
//                       <div 
//                         className="h-1.5 rounded-full transition-all duration-300" 
//                         style={{ 
//                           width: `${(passwordStrength.level / 5) * 100}%`, 
//                           backgroundColor: passwordStrength.color 
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
                
//                 {errorMessage.password && <p className="text-red-500 text-xs mt-1">{errorMessage.password}</p>}
//               </div>
              
//               <div className="mb-6">
//                 <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
//                 <Input.Password 
//                   value={form.confirmPassword} 
//                   required 
//                   name="confirmPassword" 
//                   onChange={handleOnChange} 
//                   placeholder="Confirm your password" 
//                   style={{ fontSize: "16px", height: "48px", borderRadius: "8px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                 />
//                 {errorMessage.confirmPassword && <p className="text-red-500 text-xs mt-1">{errorMessage.confirmPassword}</p>}
//               </div>
              
//               <button 
//                 className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg" 
//                 type="submit"
//               >
//                 Create Account
//               </button>
              
//               <Divider className="my-6">Or</Divider>
              
//               <button
//                 type="button"
//                 className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 rounded-lg py-3 px-4 text-gray-700 hover:text-gray-900 transition duration-200 font-medium mb-6"
//               >
//                 <FcGoogle className="text-lg" />
//                 Sign in with Google
//               </button>

//               <div className="text-center">
//                 <p className="text-gray-600 text-sm">
//                   Already have an account?{" "}
//                   <Link 
//                     to="/login" 
//                     className="text-blue-600 hover:text-blue-800 font-medium"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleNavigation("/login");
//                     }}
//                   >
//                     Login here
//                   </Link>
//                 </p>
//               </div>
//             </form>
//           </Spin>
          
//           <div className="mt-8 text-center">
//             <Link 
//               to="/help" 
//               className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleNavigation("/help");
//               }}
//             >
//               <MdHelpOutline className="mr-1" /> Need help?
//             </Link>
//           </div>
//         </div>
//       </div>
      
//       {/* Right Section - Illustration (Fixed position, won't expand) */}
//       <div 
//         className={`hidden lg:flex lg:w-1/2 items-center justify-center p-12 fixed right-0 top-0 h-full transition-all duration-500 ${isMounted ? (isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100") : "-translate-x-full opacity-0"}`}
//         style={{
//           backgroundImage: `url(${abc})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center'
//         }}
//       >
//         {/* Overlay for better readability */}
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
//         <div className="max-w-md relative z-10">
//           <div className="mb-8">
//             <h1 className="text-4xl font-bold text-white mb-4">Create Your Account</h1>
//             <p className="text-white text-lg">
//               Join us today and unlock a world of possibilities. Start your journey with our platform.
//             </p>
//           </div>
//           <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg">
//             <div className="flex items-center mb-4">
//               <div className="bg-black p-2 rounded-full mr-3">
//                 <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <h3 className="text-black font-semibold">Benefits of Joining</h3>
//             </div>
//             <ul className="text-black text-sm space-y-2">
//               <li>• Access exclusive features and content</li>
//               <li>• Save your preferences and history</li>
//               <li>• Faster checkout process</li>
//               <li>• Personalized recommendations</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;
// Updated with OTP verification flow
import { Divider, Form, Input, Spin, Tooltip, message } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { EnvHelper } from "../../helper/EnvHelper";
import abc from "../../assets/logo/ABC.jpg";
import logo from "../../assets/logo/without_bg.png";
import axios from "axios";
import { sendOtp, verifyOtp, resendOtp } from "../../helper/api_helper";

const Signup = () => {
  const dispatch = useDispatch();
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Step state for multi-step form
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Info, 2: OTP Verification, 3: Password Setup

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  // Timer for OTP resend
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
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

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  // OTP handling functions
  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = form.otp.split('');
    newOtp[index] = value;
    const updatedOtp = newOtp.join('');
    setForm({ ...form, otp: updatedOtp });
    
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
    // Handle backspace
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
    const pastedData = e.clipboardData.getData('text');
    const otpDigits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (otpDigits.length === 6) {
      setForm({ ...form, otp: otpDigits });
      
      // Focus the last input
      setTimeout(() => {
        otpRefs.current[5]?.focus();
      }, 0);
      
      // Validate OTP
      otpValidation(otpDigits);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    // Clean input values
    if (name === "name") {
      const cleanedName = value.replace(/\s+/g, " ").trimStart();
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedName }));
    } else if (name === "phone") {
      // Allow only numbers for phone
      const cleanedPhone = value.replace(/\D/g, "");
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedPhone }));
    } else if (name === "otp") {
      // Handle OTP from hidden input (fallback)
      const cleanedOtp = value.replace(/\D/g, "").slice(0, 6);
      setForm((prevForm) => ({ ...prevForm, [name]: cleanedOtp }));
      otpValidation(cleanedOtp);
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }

    // Validate inputs
    if (name === "name") {
      nameValidation(value);
    } else if (name === "phone") {
      phoneValidation(value);
    } else if (name === "email") {
      emailValidation(value);
    } else if (name === "password") {
      checkPasswordStrength(value);
      if (form.confirmPassword) {
        confirmPasswordValidation(form.confirmPassword, value);
      }
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

    setErrorMessage((prevError) => ({
      ...prevError,
      name: isValid
        ? ""
        : "Name must be at least 3 characters long and contain only alphabets.",
    }));

    return isValid;
  };

  const phoneValidation = (value) => {
    const isValid = value.length >= 10 && value.length <= 15;

    setErrorMessage((prevError) => ({
      ...prevError,
      phone: isValid ? "" : "Phone number must be 10-15 digits.",
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
    const isValid = value.length === 6;

    setErrorMessage((prevError) => ({
      ...prevError,
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

    setErrorMessage((prevError) => ({
      ...prevError,
      password: isValid
        ? ""
        : "Password must be at least 8 characters long, including 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.",
    }));

    return isValid;
  };

  const confirmPasswordValidation = (
    confirmPassword,
    password = form.password
  ) => {
    const isValid = confirmPassword === password;

    setErrorMessage((prevError) => ({
      ...prevError,
      confirmPassword: isValid ? "" : "Passwords do not match.",
    }));

    return isValid;
  };

  // Handle step 1 submission - Send OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault();

    // Clean the name
    const cleanedName = form.name.replace(/\s+/g, " ").trim();
    const cleanedForm = {
      ...form,
      name: cleanedName,
    };

    const isNameValid = nameValidation(cleanedName);
    const isPhoneValid = phoneValidation(cleanedForm.phone);
    const isEmailValid = emailValidation(cleanedForm.email);

    if (isNameValid && isPhoneValid && isEmailValid) {
      setIsSendingOtp(true);
      try {
        // Send OTP to email
        const response = await sendOtp({
          email: cleanedForm.email,
          phone: cleanedForm.phone,
        });

        if (response.data.success) {
          message.success("OTP sent to your email!");
          setIsOtpSent(true);
          setOtpTimer(60); // 60 seconds timer
          setCurrentStep(2); // Move to OTP verification step
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

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const isOtpValid = otpValidation(form.otp);

    if (isOtpValid) {
      setIsVerifyingOtp(true);
      try {
        const response = await verifyOtp({
          email: form.email,
          otp: form.otp,
        });

        if (response.data.success) {
          message.success("OTP verified successfully!");
          setIsOtpVerified(true);
          setCurrentStep(3); // Move to password setup step
        } else {
          message.error(response.data.message || "Invalid OTP");
        }
      } catch (error) {
        message.error(error.response?.data?.message || "Failed to verify OTP");
      } finally {
        setIsVerifyingOtp(false);
      }
    }
  };

  // Handle resend OTP
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

  // Handle final submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Clean the name field
    const cleanedName = form.name.replace(/\s+/g, " ").trim();
    const cleanedForm = {
      ...form,
      name: cleanedName,
    };

    const isPasswordValid = passwordValidation(cleanedForm.password);
    const isConfirmPasswordValid = confirmPasswordValidation(
      cleanedForm.confirmPassword
    );

    if (isPasswordValid && isConfirmPasswordValid) {
      // Update the form state with cleaned name
      setForm(cleanedForm);

      // Dispatch signup action with all data
      dispatch({
        type: "SIGNUP",
        data: {
          name: cleanedForm.name,
          phone: cleanedForm.phone,
          email: cleanedForm.email,
          password: cleanedForm.password,
          otp: cleanedForm.otp,
        },
      });
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
        {/* Logo in top left corner with gold background */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6">
          <div className=" flex items-center justify-center rounded-md">
            <a
              className="p-2 md:p-3 bg-yellow-400 flex items-center justify-center rounded-md cursor-pointer"
              href="/"
              data-discover="true"
            >
              <img
                src={logo}
                alt="Logo"
                className="h-6 md:h-8 w-auto object-contain"
              />
            </a>
          </div>
        </div>

        <div className="w-full max-w-md mt-12 md:mt-16">
          <div className="mb-6 md:mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentStep === 1 && "Create Account"}
                {currentStep === 2 && "Verify OTP"}
                {currentStep === 3 && "Set Password"}
              </h2>
            </div>
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm md:text-base"
            >
              Home <FaArrowRight className="ml-1" />
            </button>
          </div>

          <Spin spinning={isLogingIn || isSendingOtp || isVerifyingOtp}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <form
                onSubmit={handleStep1Submit}
                className="bg-white rounded-lg"
              >
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
                    style={{
                      fontSize: "14px",
                      height: "44px",
                      borderRadius: "8px",
                    }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                  />
                  {errorMessage.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.name}
                    </p>
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
                    placeholder="Enter your phone number"
                    style={{
                      fontSize: "14px",
                      height: "44px",
                      borderRadius: "8px",
                    }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                    type="tel"
                  />
                  {errorMessage.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.phone}
                    </p>
                  )}
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
                    style={{
                      fontSize: "14px",
                      height: "44px",
                      borderRadius: "8px",
                    }}
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
                    type="email"
                  />
                  {errorMessage.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errorMessage.email}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    A verification OTP will be sent to this email
                  </p>
                </div>

                <button
                  className="w-full mb-4 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  type="submit"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? "Sending OTP..." : "Send OTP"}
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
                        className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition duration-200"
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
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
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
                          Email Verified
                        </p>
                        <p className="text-black text-sm">{form.email}</p>
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
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
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
                    className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
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
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

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

// import { Divider, Input, Spin, Tooltip } from "antd";
// import React, { useEffect, useState } from "react";
// import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";
// import { MdHelpOutline } from "react-icons/md";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { EnvHelper } from "../../helper/EnvHelper";
// import abc from "../../assets/logo/ABC.jpg";
// import logo from "../../assets/logo/without_bg.png"

// const Signup = () => {
//   const dispatch = useDispatch();
//   const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
//   const navigate = useNavigate();
//   const [isExiting, setIsExiting] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
  
//   useEffect(() => {
//     // Trigger enter animation after component mounts
//     setIsMounted(true);
    
//     let local_item = localStorage.getItem("redirect_url");
//     if (isAuth) {
//       if (local_item) {
//         // Add exit animation before navigation
//         setIsExiting(true);
//         setTimeout(() => {
//           navigate(`/product/${local_item}`);
//         }, 500);
//       } else {
//         setIsExiting(true);
//         setTimeout(() => {
//           navigate("/");
//         }, 500);
//       }
//     }
//   }, [isAuth]);
  
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [errorMessage, setErrorMessage] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: ""
//   });

//   const [passwordStrength, setPasswordStrength] = useState({
//     level: 0,
//     message: "",
//     color: "transparent"
//   });

//   const handleNavigation = (path) => {
//     setIsExiting(true);
//     setTimeout(() => {
//       navigate(path);
//     }, 500);
//   };

//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prevForm) => ({ ...prevForm, [name]: value }));
    
//     // Check password strength in real-time
//     if (name === "password") {
//       checkPasswordStrength(value);
//       // Also validate confirm password when password changes
//       if (form.confirmPassword) {
//         confirmPasswordValidation(form.confirmPassword, value);
//       }
//     }
    
//     // Validate confirm password in real-time
//     if (name === "confirmPassword") {
//       confirmPasswordValidation(value, form.password);
//     }
//   };

//   const checkPasswordStrength = (password) => {
//     let strength = 0;
//     let message = "";
//     let color = "transparent";

//     if (password.length === 0) {
//       setPasswordStrength({ level: 0, message: "", color });
//       return;
//     }

//     // Check for minimum length
//     if (password.length >= 8) strength += 1;

//     // Check for uppercase letters
//     if (/[A-Z]/.test(password)) strength += 1;

//     // Check for lowercase letters
//     if (/[a-z]/.test(password)) strength += 1;

//     // Check for numbers
//     if (/[0-9]/.test(password)) strength += 1;

//     // Check for special characters
//     if (/[\W_]/.test(password)) strength += 1;

//     // Determine strength level and message
//     switch (strength) {
//       case 0:
//       case 1:
//         message = "Very Weak";
//         color = "#ff4d4f"; // red
//         break;
//       case 2:
//         message = "Weak";
//         color = "#ff7a45"; // orange
//         break;
//       case 3:
//         message = "Medium";
//         color = "#ffa940"; // golden orange
//         break;
//       case 4:
//         message = "Strong";
//         color = "#73d13d"; // green
//         break;
//       case 5:
//         message = "Very Strong";
//         color = "#52c41a"; // dark green
//         break;
//       default:
//         message = "";
//         color = "transparent";
//     }

//     setPasswordStrength({ level: strength, message, color });
//   };

//   const emailValidation = (value) => {
//     const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const isValid = pattern.test(value);

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       email: isValid ? "" : "Invalid email address.",
//     }));

//     return isValid;
//   };

//   const passwordValidation = (value) => {
//     const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
//     const isValid = pattern.test(value);

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       password: isValid ? "" : "Password must be at least 8 characters long, including 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.",
//     }));

//     return isValid;
//   };

//   const confirmPasswordValidation = (confirmPassword, password = form.password) => {
//     const isValid = confirmPassword === password;

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       confirmPassword: isValid ? "" : "Passwords do not match.",
//     }));

//     return isValid;
//   };

//   const nameValidation = (value) => {
//     const pattern = /^[a-zA-Z]+([ ][a-zA-Z]+)*$/;
//     const isValid = pattern.test(value) && value.length >= 3 && value.length <= 50;

//     setErrorMessage((prevError) => ({
//       ...prevError,
//       name: isValid ? "" : "Name must be at least 3 characters long and contain only alphabets.",
//     }));

//     return isValid;
//   };

//   const handleOnSubmit = (e) => {
//     e.preventDefault();

//     const isNameValid = nameValidation(form.name);
//     const isEmailValid = emailValidation(form.email);
//     const isPasswordValid = passwordValidation(form.password);
//     const isConfirmPasswordValid = confirmPasswordValidation(form.confirmPassword);

//     if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
//       dispatch({ type: "SIGNUP", data: form });
//     }
//   };

//   const passwordRequirementsTooltip = (
//     <div className="text-xs">
//       <p>Password must contain:</p>
//       <ul className="list-disc pl-4 mt-1">
//         <li>At least 8 characters</li>
//         <li>One uppercase letter (A-Z)</li>
//         <li>One lowercase letter (a-z)</li>
//         <li>One digit (0-9)</li>
//         <li>One special character (!@#$%^&* etc.)</li>
//       </ul>
//     </div>
//   );

//   return (
//     <div className={`w-full min-h-screen flex !font-primary transition-all duration-500 ${isMounted ? (isExiting ? "exit-animation" : "enter-animation") : "opacity-0"}`}>
//       {/* Left Section - Signup Form */}
//       <div className={`w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto relative transition-all duration-500 ${isMounted ? (isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100") : "translate-x-full opacity-0"}`}>
//         {/* Logo in top left corner with gold background */}
//         <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10">
//           <div className="p-1.5 sm:p-2 md:p-3 bg-yellow-400 flex items-center justify-center rounded-md">
//             <img 
//               src={logo} 
//               alt="Logo" 
//               className="h-5 sm:h-6 md:h-8 w-auto object-contain"
//             />
//           </div>
//         </div>

//         <div className="w-full max-w-md mt-10 sm:mt-12 md:mt-16">
//           <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex justify-end">
//             <button 
//               onClick={() => handleNavigation("/")} 
//               className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 text-xs sm:text-sm md:text-base"
//             >
//               Home <FaArrowRight className="ml-1" /> 
//             </button>
//           </div>

//           <Spin spinning={isLogingIn}>
//             <form onSubmit={handleOnSubmit} className="bg-white rounded-lg">
//               <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
//                 <label className="block text-gray-700 mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm md:text-base">Full Name</label>
//                 <Input 
//                   value={form.name} 
//                   required 
//                   name="name" 
//                   onChange={handleOnChange} 
//                   placeholder="Enter your full name" 
//                   style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                 />
//                 {errorMessage.name && <p className="text-red-500 text-xs mt-1">{errorMessage.name}</p>}
//               </div>
              
//               <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
//                 <label className="block text-gray-700 mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm md:text-base">Email Address</label>
//                 <Input 
//                   value={form.email} 
//                   required 
//                   name="email" 
//                   onChange={handleOnChange} 
//                   placeholder="Enter your email" 
//                   style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                   type="email"
//                 />
//                 {errorMessage.email && <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>}
//               </div>
              
//               <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
//                 <div className="flex items-center justify-between mb-1.5 sm:mb-2">
//                   <label className="block text-gray-700 font-medium text-xs sm:text-sm md:text-base">Password</label>
//                   <Tooltip title={passwordRequirementsTooltip} placement="topRight">
//                     <span className="text-gray-400 hover:text-gray-600 cursor-help text-sm">
//                       <FaInfoCircle />
//                     </span>
//                   </Tooltip>
//                 </div>
//                 <Input.Password 
//                   value={form.password} 
//                   required 
//                   name="password" 
//                   onChange={handleOnChange} 
//                   placeholder="Create a strong password" 
//                   style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                 />
                
//                 {/* Password Strength Indicator */}
//                 {form.password && (
//                   <div className="mt-1.5 sm:mt-2">
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-xs text-gray-500">Password strength:</span>
//                       <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
//                         {passwordStrength.message}
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-1.5">
//                       <div 
//                         className="h-1.5 rounded-full transition-all duration-300" 
//                         style={{ 
//                           width: `${(passwordStrength.level / 5) * 100}%`, 
//                           backgroundColor: passwordStrength.color 
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
                
//                 {errorMessage.password && <p className="text-red-500 text-xs mt-1">{errorMessage.password}</p>}
//               </div>
              
//               <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-6">
//                 <label className="block text-gray-700 mb-1.5 sm:mb-2 font-medium text-xs sm:text-sm md:text-base">Confirm Password</label>
//                 <Input.Password 
//                   value={form.confirmPassword} 
//                   required 
//                   name="confirmPassword" 
//                   onChange={handleOnChange} 
//                   placeholder="Confirm your password" 
//                   style={{ fontSize: "14px", height: "40px", borderRadius: "6px" }} 
//                   className="w-full border-gray-300 hover:border-gray-400 focus:border-yellow-400"
//                 />
//                 {errorMessage.confirmPassword && <p className="text-red-500 text-xs mt-1">{errorMessage.confirmPassword}</p>}
//               </div>
              
//               <button 
//                 className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base" 
//                 type="submit"
//               >
//                 Create Account
//               </button>
              
//               <Divider className="my-3 sm:my-4 md:my-5 lg:my-6 text-xs sm:text-sm">Or</Divider>
              
//               <button
//                 type="button"
//                 className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 rounded-lg py-2.5 sm:py-3 px-4 text-gray-700 hover:text-gray-900 transition duration-200 font-medium mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-xs sm:text-sm md:text-base"
//               >
//                 <FcGoogle className="text-base sm:text-lg" />
//                 Sign in with Google
//               </button>

//               <div className="text-center">
//                 <p className="text-gray-600 text-xs sm:text-sm">
//                   Already have an account?{" "}
//                   <Link 
//                     to="/login" 
//                     className="text-blue-600 hover:text-blue-800 font-medium"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleNavigation("/login");
//                     }}
//                   >
//                     Login here
//                   </Link>
//                 </p>
//               </div>
//             </form>
//           </Spin>
          
//           <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-center">
//             <Link 
//               to="/help" 
//               className="inline-flex items-center text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleNavigation("/help");
//               }}
//             >
//               <MdHelpOutline className="mr-1 text-xs sm:text-sm" /> Need help?
//             </Link>
//           </div>
//         </div>
//       </div>
      
//       {/* Right Section - Illustration (Hidden on mobile, shown on larger screens) */}
//       <div 
//         className={`hidden lg:flex lg:w-1/2 items-center justify-center p-6 lg:p-8 fixed right-0 top-0 h-full transition-all duration-500 ${isMounted ? (isExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100") : "-translate-x-full opacity-0"}`}
//         style={{
//           backgroundImage: `url(${abc})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center'
//         }}
//       >
//         {/* Overlay for better readability */}
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
//         <div className="max-w-md relative z-10">
//           <div className="mb-6 lg:mb-8">
//             <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4">Create Your Account</h1>
//             <p className="text-white text-base lg:text-lg">
//               Join us today and unlock a world of possibilities. Start your journey with our platform.
//             </p>
//           </div>
//           <div className="bg-white bg-opacity-90 p-4 lg:p-6 rounded-xl shadow-lg">
//             <div className="flex items-center mb-3 lg:mb-4">
//               <div className="bg-black p-1.5 lg:p-2 rounded-full mr-3">
//                 <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <h3 className="text-black font-semibold text-sm lg:text-base">Benefits of Joining</h3>
//             </div>
//             <ul className="text-black text-xs lg:text-sm space-y-1.5 lg:space-y-2">
//               <li>• Access exclusive features and content</li>
//               <li>• Save your preferences and history</li>
//               <li>• Faster checkout process</li>
//               <li>• Personalized recommendations</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;