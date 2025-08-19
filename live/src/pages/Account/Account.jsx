/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AccountMenu from "../../components/Account/AccountMenu";
import { useSelector } from "react-redux";

const Account = () => {
  const { isAuth, isAuthenicating } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    if(!isAuth && !isAuthenicating)
      navigate("/login");
  })

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col lg:flex-row items-start px-[6vw] md:px-[8vw] xl:px-[10vw] py-10 gap-10">
      <div className="w-full lg:w-[30%] h-auto ">
        <AccountMenu />
      </div>
      <div className="w-full lg:w-[70%] h-auto ">
        <Outlet />
      </div>
    </div>
  );
};

export default Account;
