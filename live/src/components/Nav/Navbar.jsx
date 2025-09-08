import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Avatar,
  Badge,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Input,
  Menu,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import _ from "lodash";

// Icons
import { BsCart3 } from "react-icons/bs";
import { IoHeartOutline } from "react-icons/io5";
import { IconHelper } from "../../helper/IconHelper";

// API & Redux
import { getMyShoppingCart } from "../../helper/api_helper";
import { SET_CART_COUNT } from "../../redux/slices/cart.slice";

// Components
import SearchProductCard from "../Product/SearchProductCard";
import Logo from "../../assets/logo/without_bg.png";

const Navbar = () => {
  // Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isSearchingProducts, searchingProducts, menu } = useSelector(
    (state) => state.publicSlice
  );
  const { isAuth, user } = useSelector((state) => state.authSlice);
  const cartCount = useSelector((state) => state.cartSlice.count);

  // Derived values
  const heartCount = user?.wish_list?.length ?? 0;
  const profileImageName = user?.name?.[0] ?? "";

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [menuStatus, setMenuStatus] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch cart data
  const fetchCartData = useCallback(async () => {
    try {
      const result = await getMyShoppingCart();
      const data = _.get(result, "data.data", []);
      dispatch(SET_CART_COUNT(data.length));
    } catch (err) {
      console.error("Failed to fetch cart data:", err);
    }
  }, [dispatch]);

  // Effects
  useEffect(() => {
    dispatch({ type: "MENU" });
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setShowSearch(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchProduct) {
      dispatch({
        type: "GET_PRODUCT",
        data: { type: "search_products", search: searchProduct },
      });
    }
  }, [searchProduct, dispatch]);

  useEffect(() => {
    fetchCartData();
    const cartRefreshInterval = setInterval(fetchCartData, 30000);
    return () => clearInterval(cartRefreshInterval);
  }, [fetchCartData]);

  // Handlers
  const handleSearchFocus = () => {
    setIsExpanded(true);
    setSearchProduct("");
  };

  const handleSearchBlur = () => {
    setTimeout(() => setIsExpanded(false), 200);
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleDestination = (url) => {
    navigate(url);
    setMenuStatus(false);
  };

  // Memoized values
  const dropdownItems = useMemo(() => [
    {
      key: "1",
      label: (
        <Link to="/account" className="pr-14">
          My Account
        </Link>
      ),
    },
    {
      key: "2",
      danger: true,
      label: (
        <button className="pr-14" onClick={logout}>
          LogOut
        </button>
      ),
    },
  ], [logout]);

  const supportTooltip = useMemo(() => (
    <div className="center_div gap-x-4">
      <IconHelper.WHATSAPP_ICON className="!text-green-400 !text-2xl" />
      Tap the mobile number to reach us.
    </div>
  ), []);

  // Components
  const SearchResultsDropdown = () => (
    <div
      className={`absolute top-14 z-[55] bg-white/95 backdrop-blur-md rounded-xl shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
        isExpanded
          ? "opacity-100 translate-y-0 scale-100 w-full h-[350px] visible"
          : "opacity-0 -translate-y-2 scale-95 h-0 invisible"
      }`}
      style={{
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        border: "1px solid rgba(249, 193, 20, 0.2)",
      }}
    >
      <div className={`h-full overflow-y-auto custom-scrollbar transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
        <Spin
          spinning={isSearchingProducts}
          indicator={
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#f9c114] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          {searchingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <Empty
                description={
                  <span className="text-gray-500">
                    {searchProduct ? "No products found" : "Search for products"}
                  </span>
                }
                imageStyle={{
                  height: 80,
                  filter: "grayscale(100%) opacity(50%)",
                  color: "#f9c114",
                }}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {searchingProducts.map((data) => (
                <SearchProductCard
                  data={data}
                  key={data._id}
                  className="hover:bg-[#f9c114]/5 transition-colors duration-200"
                />
              ))}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );

  const AuthButtons = () => (
    <div className="flex center_div items-center">
      <div className="center_div font-medium !text-[#121621] !text-sm !font-primary">
        <Link
          to="/login"
          className="center_div gap-x-2 !font-normal text-[#121621] py-2 px-3 transition-all duration-300 hover:text-primary hover:bg-slate-50 rounded"
        >
          <IconHelper.LOGIN_ICON className="!text-xl !text-[#121621]" />
          Login
        </Link>
        <Divider type="vertical" className="!bg-slate-400" />
        <Link
          to="/sign-up"
          className="center_div !font-normal text-[#121621] gap-x-2 py-2 px-3 transition-all duration-300 hover:text-primary hover:bg-slate-50 rounded"
        >
          <IconHelper.REGISTER_USER_ICON className="!text-xl !text-[#121621]" />
          Register
        </Link>
      </div>
    </div>
  );

  const UserMenu = () => (
    <div className="center_div justify-end gap-3">
      <Link to="/account/wishlist">
        <Badge count={heartCount} size="small" offset={[-5, 5]}>
          <div className="w-[40px] h-[40px] rounded-full bg-slate-50 text-primary flex items-center justify-center transition-all duration-300 hover:bg-slate-100 hover:scale-105">
            <IoHeartOutline className="text-[20px]" />
          </div>
        </Badge>
      </Link>

      <Link to="/shopping-cart" onClick={fetchCartData}>
        <Badge count={cartCount} size="small" color="hotpink" offset={[-5, 5]}>
          <div className="w-[40px] h-[40px] rounded-full bg-slate-50 text-primary flex items-center justify-center transition-all duration-300 hover:bg-slate-100 hover:scale-105">
            <BsCart3 className="text-[20px] text-[#121621]" />
          </div>
        </Badge>
      </Link>

      <Dropdown menu={{ items: dropdownItems }} placement="bottom" arrow>
        <Avatar
          src={user.profile_pic}
          size="large"
          shape="circle"
          className="text-white !bg-primary border capitalize text-lg title transition-all duration-300 hover:scale-105"
        >
          {profileImageName}
        </Avatar>
      </Dropdown>
    </div>
  );

  const SupportSection = () => (
    <div className="text-sm center_div gap-x-2 hidden lg:flex">
      <div>
        <IconHelper.SUPPORT_ICON className="!text-3xl text-[#121621]" />
      </div>
      <Tooltip title={supportTooltip} className="!cursor-pointer">
        <div>
          <h1 className="!text-[#121621] hover:cursor-pointer group">
            <a
              href="https://wa.me/917373610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="center_div justify-start hover:!text-[#121621] w-fit text-nowrap"
            >
              +91 7373610000
            </a>
          </h1>
          <h1 className="!text-[#121621]">24/7 Support</h1>
        </div>
      </Tooltip>
    </div>
  );

  const HelpCenterLink = () => (
    <Link
      to="/help"
      className="center_div gap-x-1 border border-[#121621] py-2 px-3 transition-all duration-300 hover:bg-[#121621] hover:text-[#f9c114] rounded group ml-2"
    >
      <IconHelper.HELP_ICON className="!text-xl !text-[#121621] group-hover:!text-[#f9c114]" />
      <h1 className="!font-normal text-[12px] text-[#121621] group-hover:text-[#f9c114] text-nowrap hidden lg:block">
        Help Center
      </h1>
    </Link>
  );

  return (
    <div>
      {/* Desktop Navbar */}
      <div className="w-full lg:flex hidden h-[90px] gap-x-10 bg-[#f9c114] shadow-2xl center_div justify-between px-4 lg:px-8 xl:px-20 sticky top-0 z-10">
        <div className="flex items-center gap-x-4 xl:gap-x-32 w-auto xl:w-[70%] justify-start">
          <Link to="/" className="title text-[#121621] uppercase cursor-pointer !line-clamp-1">
            <div className="flex flex-row items-center">
              <img
                src={Logo}
                alt="printee logo"
                className="w-auto xl:h-[70px] h-[50px] bg-center bg-contain rounded-md"
              />
            </div>
          </Link>
          
          <div className="relative w-[280px] md:w-[350px] lg:w-[400px] xl:w-[500px] group">
            <Input
              placeholder="Search Product..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              onClick={handleSearchFocus}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              suffix={
                <IconHelper.SEARCH_ICON className="text-[#1c1c1c] transition-colors duration-300" />
              }
              allowClear
              className="rounded-full hover:border-[#f9c114] focus:border-[#f9c114] bg-[#f1f1efbb] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full"
              size="large"
            />
            <SearchResultsDropdown />
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-4 xl:gap-x-10 w-auto xl:w-[50%]">
          <SupportSection />
          {isAuth ? <UserMenu /> : <AuthButtons />}
          <HelpCenterLink />
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="block lg:hidden w-full fixed top-0 left-0 z-[1001] bg-[#f9c114] shadow-md">
        <div className="w-full h-[60px] border-b center_div justify-between px-4">
          <Link to="/" className="title text-[#121621] hover:text-hot_pink uppercase cursor-pointer !line-clamp-1">
            <div className="flex flex-row items-center">
              <img src={Logo} alt="Printe Logo" className="w-auto h-[35px] bg-center bg-contain" />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {isAuth && (
              <Link to="/shopping-cart" className="relative" onClick={fetchCartData}>
                <Badge count={cartCount} size="small" offset={[-5, 5]}>
                  <BsCart3 className="text-[20px] text-[#121621]" />
                </Badge>
              </Link>
            )}
            <IconHelper.MENU_ICON2
              onClick={() => setMenuStatus(true)}
              className="!text-xl transition-transform duration-300 hover:scale-110 text-[#121621]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={menuStatus}
        title="Quick Access"
        onClose={() => setMenuStatus(false)}
        placement="left"
        className="transition-all duration-300"
      >
        <div className="w-full flex flex-col gap-y-3">
          <Tag
            onClick={() => handleDestination("/")}
            className="givemeitall transition-colors duration-300 hover:bg-slate-100"
          >
            Home
          </Tag>
          
          {isAuth ? (
            <div className="space-y-1">
              <Tag
                className="givemeitall transition-colors duration-300 hover:bg-slate-100"
                onClick={() => handleDestination("/account")}
              >
                My Account
              </Tag>
              <Tag
                className="givemeitall transition-colors duration-300 hover:bg-slate-100"
                onClick={() => {
                  fetchCartData();
                  handleDestination("/shopping-cart");
                }}
              >
                My Cart
              </Tag>
              <Tag
                className="givemeitall transition-colors duration-300 hover:bg-slate-100"
                onClick={() => handleDestination("/account/wishlist")}
              >
                My Wishlist
              </Tag>
            </div>
          ) : (
            <div className="space-y-1">
              <Tag
                className="givemeitall transition-colors duration-300 hover:bg-slate-100"
                onClick={() => handleDestination("/login")}
              >
                Login
              </Tag>
              <Tag
                className="givemeitall transition-colors duration-300 hover:bg-slate-100"
                onClick={() => handleDestination("/sign-up")}
              >
                Register
              </Tag>
            </div>
          )}
          
          <div>
            <h1>Categories</h1>
            <Menu mode="inline">
              {menu.map((res, index) => (
                <Menu.SubMenu
                  key={index}
                  title={_.get(res, "main_category_name", "")}
                  className="transition-colors duration-300"
                >
                  {_.get(res, "sub_categories_details", []).map((subRes, subIndex) => (
                    <Menu.Item
                      key={subIndex}
                      onClick={() =>
                        handleDestination(
                          `/category/${_.get(res, "main_category_name", "")}/${_.get(
                            subRes,
                            "sub_category_name",
                            ""
                          )}/${_.get(res, "_id", "")}/${_.get(subRes, "_id", "")}`
                        )
                      }
                      className="transition-colors duration-300 hover:!bg-slate-50"
                    >
                      <div>{_.get(subRes, "sub_category_name", "")}</div>
                    </Menu.Item>
                  ))}
                </Menu.SubMenu>
              ))}
            </Menu>
          </div>
          
          <div>
            <Tag
              onClick={() => handleDestination("/help")}
              className="givemeitall gap-x-2 transition-colors duration-300 hover:bg-slate-100"
            >
              <IconHelper.HELP_ICON className="!text-xl !text-primary" />
              <h1>Help Center</h1>
            </Tag>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Navbar;