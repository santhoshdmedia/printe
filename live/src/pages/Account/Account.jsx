/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AccountMenu from "../../components/Account/AccountMenu";
import { useSelector } from "react-redux";
import { Avatar } from "antd"; // Import Avatar component

const Account = () => {
  const { isAuth, isAuthenicating, user } = useSelector((state) => state.authSlice);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    if(!isAuth && !isAuthenicating)
      navigate("/login");
  })

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Get first letter of name for avatar fallback
  const profileImageName = user?.name?.[0] || "";

  return (
    <div className="flex flex-col lg:flex-row items-start bg-[#FFFCF6] px-[6vw] md:px-[8vw] xl:px-[10vw] py-10 gap-10 my-account-bg">
      <div className="w-full lg:w-[30%] h-auto ">
        <AccountMenu />
      </div>
      <div className="w-full lg:w-[70%] h-auto ">
        <div className="mb-6">
          
          {/* User Info Section */}
          <div className="  rounded-lg  ">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-4">
              <Avatar
                src={user?.picture}
                style={{
                  width: "160px",
                  height: "155px",
                  objectFit: "cover",
                  textTransform: "capitalize",
                  borderRadius: "50%",
                  border: "3px solid #f2c41a",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                className="text-black capitalize text-2xl bg-yellow-50 font-semibold"
              >
                {profileImageName}
              </Avatar>
            </div>
            
            {/* User Details */}
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {user?.name || "User Name"}
              </h3>
              <p className="text-gray-600 text-xl mb-1">
                <span className="font-medium"></span> {user?.email || "user@example.com"}
              </p>

            </div>
          </div>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
};

export default Account;