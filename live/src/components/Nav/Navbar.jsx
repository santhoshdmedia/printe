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
import { BsCart3, BsSearch, BsXLg } from "react-icons/bs";
import { IoHeartOutline, IoMenu } from "react-icons/io5";
import { IconHelper } from "../../helper/IconHelper";

// API & Redux
import { getMyShoppingCart } from "../../helper/api_helper";
import { SET_CART_COUNT } from "../../redux/slices/cart.slice";

// Components
import SearchProductCard from "../Product/SearchProductCard";
import Logo from "../../assets/logo/without_bg.png";
import gif from "../../assets/logo/printe_logo.gif";

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
  const [showSearchBar, setShowSearchBar] = useState(false);

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
    setShowSearchBar(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsExpanded(false);
      setShowSearchBar(false);
    }, 200);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    setIsExpanded(!showSearchBar);
    if (!showSearchBar) {
      setTimeout(() => {
        document.getElementById("mobile-search-input")?.focus();
      }, 100);
    } else {
      setSearchProduct("");
    }
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

  // Components
  const SearchResultsDropdown = () => (
    <div
      className={`absolute top-full left-0 z-[55] bg-white/95 backdrop-blur-md rounded-b-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded && searchProduct
          ? "opacity-100 max-h-96 w-full visible border-t border-gray-200"
          : "opacity-0 max-h-0 invisible"
      }`}
    >
      <div className="h-96 overflow-y-auto custom-scrollbar">
        <Spin
          spinning={isSearchingProducts}
          indicator={
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#f2c41a] border-t-transparent rounded-full animate-spin"></div>
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
                  color: "#f2c41a",
                }}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {searchingProducts.map((data) => (
                <SearchProductCard
                  data={data}
                  key={data._id}
                  className="hover:bg-[#f2c41a]/5 transition-colors duration-200"
                />
              ))}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );

  const AuthButtons = () => (
    <div className="flex items-center">
      <Link
        to="/login"
        className="text-[#121621] p-2 transition-all duration-300 hover:text-primary rounded"
      >
        <IconHelper.LOGIN_ICON className="text-xl" />
      </Link>
      <Link
        to="/sign-up"
        className="text-[#121621] p-2 transition-all duration-300 hover:text-primary rounded"
      >
        <IconHelper.REGISTER_USER_ICON className="text-xl" />
      </Link>
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
              href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="center_div justify-start hover:!text-[#121621] w-fit text-nowrap"
            >
              +91 95856 10000
            </a>
          </h1>
          <h1 className="!text-[#121621] capitalize">customer Support</h1>
        </div>
      </Tooltip>
    </div>
  );

   const supportTooltip = useMemo(() => (
    <div className="center_div gap-x-4">
      <IconHelper.WHATSAPP_ICON className="!text-green-400 !text-2xl" />
      Tap the mobile number to reach us.
    </div>
  ), []);
const HelpCenterLink = () => (
    <Link
      to="/help"
      className="center_div gap-x-1 border border-[#121621] py-2 px-3 transition-all duration-300 hover:bg-[#121621] hover:text-[#f2c41a] rounded group ml-2"
    >
      <IconHelper.HELP_ICON className="!text-xl !text-[#121621] group-hover:!text-[#f2c41a]" />
      <h1 className="!font-normal text-[12px] text-[#121621] group-hover:text-[#f2c41a] text-nowrap hidden lg:block">
        Help Center
      </h1>
    </Link>
  );

  const UserMenu = () => (
    <div className="flex items-center justify-end gap-3">
      <Link to="/account/wishlist" className="p-1">
        <Badge count={heartCount} size="small" offset={[-5, 5]}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 lg:hover:bg-slate-100">
            <IoHeartOutline className="text-xl text-[#121621]" />
          </div>
        </Badge>
      </Link>

      <Link to="/shopping-cart" onClick={fetchCartData} className="p-1">
        <Badge count={cartCount} size="small" color="hotpink" offset={[-5, 5]}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 lg:hover:bg-slate-100">
            <BsCart3 className="text-xl text-[#121621]" />
          </div>
        </Badge>
      </Link>

      <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow trigger={['click']}>
        <Avatar
          src={user.profile_pic}
          size="default"
          shape="circle"
          className="w-8 h-8 text-white bg-primary border capitalize text-lg transition-all duration-300"
        >
          {profileImageName}
        </Avatar>
      </Dropdown>
    </div>
  );

  return (
    <div>
      {/* Desktop Navbar  */}
      <div className="w-full lg:flex hidden h-[90px] gap-x-10 bg-[#f2c41a] shadow-2xl center_div justify-between px-4 lg:px-8 xl:px-20 sticky top-0 z-10 overflow-hidden">
        <div className="flex items-center gap-x-4 xl:gap-x-32 w-auto xl:w-[70%] justify-start">
          <Link to="/" className="title text-[#121621] uppercase cursor-pointer !line-clamp-1">
            <div className="flex flex-row items-center">
              <img
                src={gif}
                alt="printee logo"
                className="w-auto xl:h-[150px] h-[50px] bg-center bg-contain rounded-md"
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
              className="rounded-full hover:border-[#f2c41a] focus:border-[#f2c41a] bg-[#f1f1efbb] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full"
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

      {/* Mobile Navbar - Redesigned */}
      <div className="block lg:hidden w-full fixed top-[40px] left-0 z-[1001] !bg-[#f2c41a] shadow-md overflow-hidden">
        {/* Main Navbar Row */}
        <div className="w-full h-14 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuStatus(true)}
              className="p-2 transition-transform duration-300 hover:scale-110 text-[#121621]"
            >
              <IoMenu className="text-xl" />
            </button>
            <Link to="/" className="flex items-center">
              <img 
                src={gif} 
                alt="Printe Logo" 
                className="h-20 w-auto object-contain" 
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleSearchBar}
              className="p-2 transition-colors duration-300 hover:bg-[#00000010] rounded-full"
            >
              {showSearchBar ? <BsXLg className="text-md" /> : <BsSearch className="text-md" />}
            </button>
            
            {isAuth ? <UserMenu /> : <AuthButtons />}
          </div>
        </div>

        {/* Expandable Search Bar */}
        <div className={`w-full bg-[#f2c41a] transition-all duration-300 overflow-hidden ${showSearchBar ? 'max-h-16 py-2' : 'max-h-0'}`}>
          <div className="px-3">
            <Input
              id="mobile-search-input"
              placeholder="Search Product..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              suffix={
                <IconHelper.SEARCH_ICON className="text-[#1c1c1c] transition-colors duration-300" />
              }
              allowClear
              className="rounded-full bg-white border-none"
              size="large"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="relative w-full">
          <SearchResultsDropdown />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={menuStatus}
        title={
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="h-6" />
            <span className="font-medium">Menu</span>
          </div>
        }
        onClose={() => setMenuStatus(false)}
        placement="left"
        className="mobile-nav-drawer"
        bodyStyle={{ padding: '16px' }}
        width={280}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div 
              onClick={() => handleDestination("/")}
              className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100 font-medium"
            >
              Home
            </div>
            
            {isAuth ? (
              <>
                <div 
                  onClick={() => handleDestination("/account")}
                  className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100"
                >
                  My Account
                </div>
                <div 
                  onClick={() => {
                    fetchCartData();
                    handleDestination("/shopping-cart");
                  }}
                  className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100"
                >
                  My Cart
                </div>
                <div 
                  onClick={() => handleDestination("/account/wishlist")}
                  className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100"
                >
                  My Wishlist
                </div>
              </>
            ) : (
              <>
                <div 
                  onClick={() => handleDestination("/login")}
                  className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100"
                >
                  Login
                </div>
                <div 
                  onClick={() => handleDestination("/sign-up")}
                  className="px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100"
                >
                  Register
                </div>
              </>
            )}
          </div>
          
          <Divider className="my-2" />
          
          <div>
            <h3 className="px-3 py-1 font-medium text-gray-700">Categories</h3>
            <Menu mode="inline" className="border-none">
              {menu.map((res, index) => (
                <Menu.SubMenu
                  key={index}
                  title={_.get(res, "main_category_name", "")}
                  className="font-medium"
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
                      className="text-sm"
                    >
                      {_.get(subRes, "sub_category_name", "")}
                    </Menu.Item>
                  ))}
                </Menu.SubMenu>
              ))}
            </Menu>
          </div>
          
          <Divider className="my-2" />
          
          <div 
            onClick={() => handleDestination("/help")}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-300 hover:bg-slate-100"
          >
            <IconHelper.HELP_ICON className="text-lg text-[#f2c41a]" />
            <span>Help Center</span>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Navbar;