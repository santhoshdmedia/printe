// import React from "react";
// import { FaBoxOpen, FaRegAddressCard } from "react-icons/fa";
// import { FaUserLarge } from "react-icons/fa6";
// import { IoHeartSharp, IoSettingsSharp } from "react-icons/io5";
// import { Link, NavLink } from "react-router-dom";

// const AccountMenu = () => {
//   const menu = [
//     {
//       icon: <FaUserLarge />,
//       link: "/account/profile",
//       name: "Profile",
//     },
//     {
//       icon: <FaRegAddressCard />,
//       link: "/account/manage-addresses",
//       name: "Manage Addresses",
//     },
//     {
//       icon: <FaBoxOpen />,
//       link: "/account/my-orders",
//       name: "My Orders",
//     },
//     {
//       icon: <IoHeartSharp />,
//       link: "/account/wishlist",
//       name: "My Wishlist",
//     },
//     {
//       icon: <IoSettingsSharp />,
//       link: "/account/settings",
//       name: "Settings",
//     },
//   ];

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Account Menu</h2>
//         <p className="text-gray-500 mt-1">Manage your account settings</p>
//       </div>
      
//       <ul className="space-y-3">
//         {menu.map((data, index) => {
//           return (
//             <li key={index}>
//               <NavLink
//                 to={data.link}
//                 className={({ isActive }) =>
//                   `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group ${
//                     isActive
//                       ? "bg-gradient-to-r from-[#f9c114] to-[#f9c114] text-white shadow-lg"
//                       : "text-gray-600 hover:bg-[#f9c114] hover:text-black"
//                   }`
//                 }
//               >
//                 <span className={`text-lg mr-3 ${
//                   menu.active ? "text-white" : "text-gray-600 group-hover:text-white"
//                 }`}>
//                   {data.icon}
//                 </span>
//                 <span className="font-medium">{data.name}</span>
//                 <span className="ml-auto transform transition-transform group-hover:text-white">
//                   <svg 
//                     className="w-4 h-4" 
//                     fill="none" 
//                     stroke="currentColor" 
//                     viewBox="0 0 24 24" 
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </span>
//               </NavLink>
//             </li>
//           );
//         })}
//       </ul>
      
//     </div>
//   );
// };

// export default AccountMenu;

import React from "react";
import { FaBoxOpen, FaRegAddressCard } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import { IoHeartSharp, IoSettingsSharp, IoLogOutOutline } from "react-icons/io5";
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
      icon: <FaRegAddressCard />,
      link: "/account/manage-addresses",
      name: "Manage Addresses",
    },
    {
      icon: <FaBoxOpen />,
      link: "/account/my-orders",
      name: "My Orders",
    },
    {
      icon: <IoHeartSharp />,
      link: "/account/wishlist",
      name: "My Wishlist",
    },
    {
      icon: <IoSettingsSharp />,
      link: "/account/settings",
      name: "Settings",
    },
    {
      icon: <IoLogOutOutline />,
      link: "/",
      name: "Logout",
      action: logout,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Account Menu</h2>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>
      
      <ul className="space-y-3">
        {menu.map((data, index) => {
          if (data.action) {
            return (
              <li key={index}>
                <button
                  onClick={data.action}
                  className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                  <span className="text-lg mr-3 text-gray-600 group-hover:text-red-600">
                    {data.icon}
                  </span>
                  <span className="font-medium">{data.name}</span>
                  <span className="ml-auto transform transition-transform group-hover:text-red-600">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </li>
            );
          }
          
          return (
            <li key={index}>
              <NavLink
                to={data.link}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group ${
                    isActive
                      ? "bg-gradient-to-r from-[#f9c114] to-[#f9c114] text-white shadow-lg"
                      : "text-gray-600 hover:bg-[#f9c114] hover:text-black"
                  }`
                }
              >
                <span className={`text-lg mr-3 ${
                  menu.active ? "text-white" : "text-gray-600 group-hover:text-white"
                }`}>
                  {data.icon}
                </span>
                <span className="font-medium">{data.name}</span>
                <span className="ml-auto transform transition-transform group-hover:text-white">
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      
    </div>
  );
};

export default AccountMenu;