import React from "react";
import { FaBoxOpen, FaRegAddressCard } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import { IoHeartSharp, IoSettingsSharp } from "react-icons/io5";
import { Link, NavLink } from "react-router-dom";

const AccountMenu = () => {
  const menu = [
    {
      icon:<FaUserLarge />,
      link: "/account/profile",
      name: "Profile",
    },
    {
      icon:<FaRegAddressCard  />,
      link: "/account/manage-addresses",
      name: "Manage Addresses",
    },

    {
      icon:<FaBoxOpen />,
      link: "/account/my-orders",
      name: "My Orders",
    },

    {
      icon:<IoHeartSharp />,
      link: "/account/wishlist",
      name: "My Wishlist",
    },
    {
      icon:<IoSettingsSharp  />,
      link: "/account/settings",
      name: "Settings",
    },
  ];

  return (
    <>
      <ul className=' para !text-lg pb-3 divide-y divide-purple-200 flex flex-col'>
        {menu.map((data, index) => {
          return (
            <li key={index}>
              <NavLink
                to={data.link}
                className={({ isActive }) =>
                  `block rounded-t-md px-4 py-2 capitalize mt-2 transition-all duration-150 ease-in   ${
                    isActive
                      ? "bg-primary hover:text-white  text-white "
                      : "hover:text-white  hover:bg-primary "
                  }`
                }
              >
              <div className="flex gap-4 items-center">

              <span>
                
              {data.icon}
              </span>
              <span>

                {data.name}
              </span>
              </div>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default AccountMenu;
