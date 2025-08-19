import { Divider, Input, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdHelpOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { EnvHelper } from "../../helper/EnvHelper";

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
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 z-20 animate-swipeLeft sm:block hidden">
        <img src="https://img.freepik.com/free-photo/beautiful-bouquet-flowers-gift-bag-generated-by-artificial-intelligence_188544-113196.jpg?t=st=1738060587~exp=1738064187~hmac=b583f35b9e0157a692e17e819f31c44c3d69cff7f99a53d66cc55bdf41ed7582&w=996" className="object-cover w-full h-full" />
      </div>
      <div className="flex-1 flex flex-col justify-between relative">
        <div className="bg-sky-50 h-[50%] w-[50%] rounded-br-[70%]  z-0 absolute -top-28 -left-24"></div>
        <nav className="flex justify-between items-center p-4 z-10 ">
          <h1 className="title text-primary uppercase">
            Print <span className="text-secondary">E</span>
          </h1>
          <h3 className="para text-gray-500">
            Not a member ?{" "}
            <Link to="/sign-up" className="text-primary hover:text-secondary sub_title">
              Register Now
            </Link>
          </h3>
        </nav>
        <Spin spinning={isLogingIn}>
          <div className="center_div flex-col gap-3 z-10">
            <div className="text-center">
              <h1 className="title text-primary uppercase">Welcome Back</h1>
              <p className="para">Login into your account</p>
            </div>

            <form onSubmit={(e) => handleOnSubmit(e)} className="shadow-2xl p-10 rounded-xl lg:w-[50%] flex justify-center flex-col gap-3 z-10 bg-white">
              <div className="flex flex-col gap-1">
                <label className="para">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input value={form.email} required name="email" onChange={(e) => handleOnChange(e)} placeholder="Enter your email" style={{ fontSize: "17px" }} className="font-primary !h-[50px]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="para">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input.Password value={form.password} required name="password" onChange={(e) => handleOnChange(e)} placeholder="Enter your password" style={{ fontSize: "17px" }} className="font-primary !h-[50px]" />
                <Link to="/forget-password" className="pt-3">
                  <span className="para text-primary font-medium">Forget password?</span>
                </Link>
              </div>
              <button className="button mt-2 para" type="submit">
                Login
              </button>
              {errorMessage && <p className="text-red-400 text-wrap">{errorMessage}</p>}
            </form>
          </div>
        </Spin>
        <div className="flex justify-between px-10 py-10 z-10 ">
          <Link to="/" className="sub_title text-primary hover:text-secondary flex items-center gap-3 cursor-pointer">
            <FaArrowLeft />
            Explore Products
          </Link>

          <Link to="/help" className="sub_title text-gray-600 flex items-center gap-3 hover:text-secondary cursor-pointer">
            <MdHelpOutline />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
