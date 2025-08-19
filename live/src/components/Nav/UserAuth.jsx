import { Avatar, Badge, Divider, Dropdown } from "antd";
import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

const UserAuth = () => {

  //redux
  const { isAuth, user } = useSelector((state) => state.authSlice);
  const profileImageName = user?.name[0] ?? "";
  const wishListCount = user?.wish_list?.length ?? 0

  //config
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  //function
  const logout=()=>{
    dispatch({type:"LOGOUT"});
    navigate('/')
  }
  
  //Render Data
  const items = [
    {
      key: "1",
      label: (
        <Link to="/account"
        className="pr-14"
        >
          My Account
        </Link>
      ),
    },
    {
      key: "2",
      danger: true,
      label: (
        <button
          className="pr-14"
          onClick={logout}
        >
          LogOut
        </button>
      ),
    },
  ];
  
  return (
    <div className="center_div gap-10">
      {isAuth ? (
        <div className="center_div gap-10 px-2">
          <Dropdown
            menu={{
              items,
            }}
            placement="bottom"
            arrow
            className="cursor-pointer"
          >
            {/* <Badge count={1}> */}
            <Avatar src={user.profile_pic} size="large" className="text-primary capitalize bg-purple-300 title">
              {profileImageName}
            </Avatar>
            {/* </Badge> */}
          </Dropdown>

          {/* <Link to={'/'}>
            <Badge count={5}>
              <FaShoppingCart size={28} />
            </Badge>
          </Link> */}
          <Link to={"/account/wishlist"}>
            <Badge count={wishListCount}>
              <FaRegHeart size={28} />
            </Badge>
          </Link>
        </div>
      ) : (
        <div>
          <Link to={"/login"} className="hover:text-primary">
            Login
          </Link>
          <Divider type="vertical" className="!bg-slate-500" />
          <Link to={"/sign-up"} className="hover:text-primary">
            SignUp
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserAuth;
