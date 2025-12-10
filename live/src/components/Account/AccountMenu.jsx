import React from "react";
import { FaBoxOpen, FaRegAddressCard } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import { IoHeartSharp, IoSettingsSharp, IoLogOutOutline,IoShieldCheckmark,IoPricetagSharp } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const AccountMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const logout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const menu = [
    {
      icon: <FaUserLarge />,
      link: "/account/profile",
      name: "Profile",
    },
     {
      icon: <IoHeartSharp />,
      link: "/account/wishlist",
      name: "My Wishlist",
    },
      {
      icon: <FaBoxOpen />,
      link: "/account/my-orders",
      name: "My Orders",
    },
     {
      icon: <FaRegAddressCard />,
      link: "/account/manage-addresses",
      name: "Manage Addresses",
    },
       {
      icon: <IoPricetagSharp />,
      link: "/account/reward",
      name: "Reward",
    },
     {
      icon: <IoShieldCheckmark />,
      link: "/Warranty",
      name: "Warrenty",
    },
  
   
  
   
    {
      icon: <IoSettingsSharp />,
      link: "/account/settings",
      name: "Settings",
    },
  ];

  return (
   <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col gap-2 sm:gap-3 md:gap-[15rem]">
      
      <ul className="space-y-3">
        <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Account Menu</h2>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>
        {menu.map((data, index) => (
          <li key={index}>
            <NavLink
              to={data.link}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group ${
                  isActive
                    ? "bg-gradient-to-r from-[#fdf8f2] to-[#fdf8f2] text-[#f2c41a] shadow-lg hover:text-black"
                    : "text-gray-600 hover:bg-[#fdf8f2] hover:text-black"
                }`
              }
            >
              <span className={`text-lg mr-3 ${
                menu.active ? "!text-[#fff]" : "text-gray-600 group-hover:text-black"
              }`}>
                {data.icon}
              </span>
              <span className="font-medium ">{data.name}</span>
              {/* <span className="ml-auto transform transition-transform group-hover:text-white">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span> */}
            </NavLink>
          </li>
        ))}
      </ul>
      
      {/* Separate Logout Button */}
      <div className="mt-1 pt-1">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-lg mr-3 text-gray-600 group-hover:text-red-600">
            <IoLogOutOutline />
          </span>
          <span className="font-medium">Logout</span>
          {/* <span className="ml-auto transform transition-transform group-hover:text-red-600">
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span> */}
        </button>
      </div>
      
    </div>
  );
};

export default AccountMenu;