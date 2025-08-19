import { Divider, Input, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { EnvHelper } from "../../helper/EnvHelper";

const Signup = () => {
  const dispatch = useDispatch();
  const { isLogingIn, isAuth } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  useEffect(() => {
    let local_item = localStorage.getItem("redirect_url");
    if (isAuth) {
      if (local_item) {
        navigate(`/product/${local_item}`);
      } else {
        navigate("/");
      }
    }
  }, [isAuth]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
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

    if (isNameValid && isEmailValid && isPasswordValid) {
      dispatch({ type: "SIGNUP", data: form });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 flex flex-col justify-between relative">
        <div className="bg-purple-50 h-[50%] w-[50%] rounded-tl-[70%]  z-0 absolute -bottom-28 -right-24"></div>
        <div className="bg-purple-50 h-[50%] w-[50%] rounded-br-[70%]  z-0 absolute -top-28 -left-24"></div>
        <nav className="flex justify-between items-center p-5 z-10 ">
          <h1 className="title text-secondary uppercase">
            Print <span className="text-primary">E</span>
          </h1>
          <h3 className="para text-gray-500">
            Already member ?{" "}
            <Link to="/login" className="text-secondary hover:text-primary sub_title">
              Login
            </Link>
          </h3>
        </nav>
        <Spin spinning={isLogingIn}>
          <div className="center_div flex-col gap-3">
            <div className="text-center z-10">
              <h1 className="title text-secondary">Welcome !</h1>
              <p className="para">Getting started is easy</p>
            </div>

            <form onSubmit={(e) => handleOnSubmit(e)} className="shadow-2xl p-10 rounded-xl lg:w-[50%] w-full flex justify-center flex-col gap-2 z-10 bg-white">
              <div className="flex flex-col gap-1">
                <label className="para">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input name="name" onChange={(e) => handleOnChange(e)} required placeholder="Enter your name" style={{ fontSize: "17px" }} className="!h-[50px]" />
                {errorMessage.name && <p className="text-red-400 text-wrap text-xs">{errorMessage.name}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="para">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input name="email" onChange={(e) => handleOnChange(e)} required placeholder="Enter your email" style={{ fontSize: "17px" }} className="!h-[50px]" />
                {errorMessage.email && <p className="text-red-400 text-wrap text-xs">{errorMessage.email}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="para">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input.Password required name="password" onChange={(e) => handleOnChange(e)} placeholder="Enter your password" className="!h-[50px] font-secondary" style={{ fontSize: "17px" }} />
                {errorMessage.password && <p className="text-red-400 text-xs text-wrap">{errorMessage.password}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="para">GST NO (Optional)</label>
                <Input name="gst_no" onChange={(e) => handleOnChange(e)} placeholder="Enter your GST No" className="!h-[50px] font-secondary" style={{ fontSize: "17px" }} />
              </div>
              <button className="button mt-5 para" type="submit">
                Create Account
              </button>
            </form>
          </div>
        </Spin>
        <div className="flex justify-between px-10 py-10 z-10 ">
          <Link to="/" className="sub_title text-secondary hover:text-secondary flex items-center gap-3 cursor-pointer">
            <FaArrowLeft />
            Explore Products
          </Link>

          <Link to="/help" className="sub_title text-gray-600 flex items-center gap-3 hover:text-secondary cursor-pointer">
            <MdHelpOutline />
            Contact Us
          </Link>
        </div>
      </div>
      <div className="flex-1 z-10 animate-swipeRight hidden sm:block">
        <img src="https://shoezero.com/cdn/shop/articles/shoezero_Create_a_vibrant_and_detailed_image_that_showcases_a_v_544f667e-9900-4778-af12-5f89273189e6.webp?v=1697995266&width=2048" className="object-cover w-full h-full" />
      </div>
    </div>
  );
};

export default Signup;
