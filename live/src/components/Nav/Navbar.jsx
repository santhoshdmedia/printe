import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import _ from "lodash";

// Icons
import { BsCart3, BsSearch, BsXLg } from "react-icons/bs";
import { IoHeartOutline, IoMenu, IoClose } from "react-icons/io5";
import { IconHelper } from "../../helper/IconHelper";

// API & Redux
import { getMyShoppingCart } from "../../helper/api_helper";
import { SET_CART_COUNT } from "../../redux/slices/cart.slice";

// Components
import SearchProductCard from "../Product/SearchProductCard";
import Logo from "../../assets/logo/without_bg.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isSearchingProducts, searchingProducts, menu } = useSelector(
    (state) => state.publicSlice
  );
  const { isAuth, user } = useSelector((state) => state.authSlice);
  const cartCount = useSelector((state) => state.cartSlice.count);

  const heartCount = user?.wish_list?.length ?? 0;
  const profileImageName = user?.name?.[0] ?? "";

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [menuStatus, setMenuStatus] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch cart
  const fetchCartData = useCallback(async () => {
    try {
      const result = await getMyShoppingCart();
      const data = _.get(result, "data.data", []);
      dispatch(SET_CART_COUNT(data.length));
    } catch (err) {
      console.error("Failed to fetch cart data:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: "MENU" });
  }, [dispatch]);

  useEffect(() => {
    if (searchProduct) {
      const debounceTimer = setTimeout(() => {
        dispatch({
          type: "GET_PRODUCT",
          data: { type: "search_products", search: searchProduct },
        });
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchProduct, dispatch]);

  useEffect(() => {
    fetchCartData();
    const interval = setInterval(fetchCartData, 30000);
    return () => clearInterval(interval);
  }, [fetchCartData]);

  // Handlers
  const handleSearchFocus = () => {
    setIsExpanded(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchProduct) setIsExpanded(false);
    }, 200);
  };

  const handleSearchChange = (e) => setSearchProduct(e.target.value);

  const closeSearchBar = () => {
    setShowSearchBar(false);
    setIsExpanded(false);
    setSearchProduct("");
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
    setMenuStatus(false);
    setShowUserDropdown(false);
  };

  const handleDestination = (url) => {
    navigate(url);
    setMenuStatus(false);
    closeSearchBar();
    setShowUserDropdown(false);
  };

  const handleCategoryClick = (mainCategory, subCategory, mainId, subId) => {
    handleDestination(
      `/category/${mainCategory}/${subCategory}/${mainId}/${subId}`
    );
  };

  // Search Input
  const SearchInput = ({ isMobile = false }) => (
    <div
      className={`relative ${isMobile ? "w-full" : "w-full max-w-[500px] md:w-[350px] lg:w-[400px]"}`}
    >
      <input
        type="text"
        placeholder="Search Product..."
        value={searchProduct}
        onChange={handleSearchChange}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        className={`w-full px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#f2c41a] bg-white transition-all duration-300 ${
          isMobile ? "pr-10 text-sm" : "pr-12"
        }`}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        <BsSearch className="text-base" />
      </div>
      {/* Search Results */}
      <div
        className={`absolute top-full left-0 z-30 bg-white/95 backdrop-blur-md rounded-b-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded && searchProduct
            ? "opacity-100 max-h-[70vh] w-full visible border-t border-gray-200"
            : "opacity-0 max-h-0 invisible"
        }`}
      >
        <div className="overflow-y-auto">
          {isSearchingProducts ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-3 border-[#f2c41a] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchingProducts.length === 0 && searchProduct ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              No products found
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {searchingProducts.map((data) => (
                <div
                  key={data._id}
                  onClick={() => {
                    handleDestination(`/product/${data._id}`);
                    closeSearchBar();
                  }}
                  className="cursor-pointer"
                >
                  <SearchProductCard
                    data={data}
                    className="hover:bg-[#f2c41a]/5 transition-colors duration-200 py-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Auth Buttons Component
  const AuthButtons = () => (
    <div className="flex items-center space-x-2">
      <Link
        to="/shopping-cart"
        onClick={() => {
          fetchCartData();
          closeSearchBar();
        }}
        className="p-2 relative"
      >
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-slate-100">
          <BsCart3 className="text-xl text-[#121621]" />
        </div>
      </Link>
      <Link
        to="/login"
        className="relative text-black hover:text-black px-3 py-2 rounded-lg group overflow-hidden transition-all duration-300 hover:shadow-lg"
        onClick={closeSearchBar}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="relative z-10 flex items-center gap-2 font-bold">
          <IconHelper.REGISTER_USER_ICON className="text-xl group-hover:scale-110 transition-transform duration-300" />
          <span className="hidden sm:block group-hover:translate-x-1 transition-transform duration-300">
            Login
          </span>
        </span>
      </Link>
    </div>
  );

  // Support Section Component
  const SupportSection = () => (
    <div className="text-sm flex items-center gap-x-2 hidden lg:flex">
      <div>
        <IconHelper.SUPPORT_ICON className="text-3xl text-[#121621]" />
      </div>
      <div className="relative group">
        <div>
          <h1 className="text-[#121621] hover:cursor-pointer">
            <a
              href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-start hover:text-[#121621] w-fit text-nowrap"
            >
              +91 95856 10000
            </a>
          </h1>
          <h1 className="text-[#121621] capitalize">Customer Support</h1>
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
          <div className="flex items-center gap-x-2">
            <IconHelper.WHATSAPP_ICON className="text-green-400 text-xl" />
            Tap the mobile number to reach us.
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );

  // Help Center Link Component
  const HelpCenterLink = () => (
    <Link
      to="/help"
      className="flex items-center gap-x-1 border border-[#121621] py-2 px-3 transition-all duration-300 hover:bg-[#121621] hover:text-[#f2c41a] rounded group ml-2"
      onClick={closeSearchBar}
    >
      <IconHelper.HELP_ICON className="text-xl text-[#121621] group-hover:text-[#f2c41a]" />
      <h1 className="font-normal text-[12px] text-[#121621] group-hover:text-[#f2c41a] text-nowrap hidden lg:block">
        Help Center
      </h1>
    </Link>
  );

  // User Menu Component
  const UserMenu = () => (
    <div className="flex items-center justify-end gap-2">
      <Link
        to="/account/wishlist"
        className="p-2 relative"
        onClick={closeSearchBar}
      >
        {heartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {heartCount}
          </span>
        )}
        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-slate-100">
          <IoHeartOutline className="text-xl text-[#121621]" />
        </div>
      </Link>

      <Link
        to="/shopping-cart"
        onClick={() => {
          fetchCartData();
          closeSearchBar();
        }}
        className="p-2 relative"
      >
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-slate-100">
          <BsCart3 className="text-xl text-[#121621]" />
        </div>
      </Link>

      <div className="relative">
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-[#f2c41a] text-white flex items-center justify-center border border-gray-300 capitalize text-lg transition-all duration-300 cursor-pointer hover:opacity-80">
            {profileImageName}
          </div>
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="py-1">
              <Link
                to="/account"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setShowUserDropdown(false)}
              >
                My Account
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors duration-200"
              >
                LogOut
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Custom Drawer (Mobile Menu)
  const CustomDrawer = ({ isOpen, onClose, children }) => (
    <div
    className={`fixed inset-0 z-[10000] transition-all duration-300 ${
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div
      className={`absolute left-0 top-0 h-screen w-72 bg-white shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      style={{ zIndex: 10001 }} // ensure panel is always above navbar
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-[#f2c41a]">
          <img src={Logo} alt="Logo" className="h-8" />
        <button onClick={onClose}>
          <IoClose className="text-xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100vh-56px)] p-3">
          {children}
        </div>
      </div>
    </div>
  );

  // Mobile Menu Content
  const MobileMenuContent = () => (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => handleDestination("/")}
        className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-gray-900"
      >
        Home
      </div>
      {isAuth ? (
        <>
          <div
            onClick={() => handleDestination("/account")}
            className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-gray-700"
          >
            My Account
          </div>
          <div
            onClick={() => {
              fetchCartData();
              handleDestination("/shopping-cart");
            }}
            className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-gray-700"
          >
            My Cart {cartCount > 0 && `(${cartCount})`}
          </div>
          <div
            onClick={() => handleDestination("/account/wishlist")}
            className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-gray-700"
          >
            My Wishlist {heartCount > 0 && `(${heartCount})`}
          </div>
          <div
            onClick={logout}
            className="px-3 py-2 rounded-md text-red-600 hover:bg-slate-100 cursor-pointer"
          >
            Logout
          </div>
        </>
      ) : (
        <>
          <div
            onClick={() => handleDestination("/login")}
            className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-gray-700"
          >
            Login
          </div>
          <div
            onClick={() => handleDestination("/sign-up")}
            className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer text-gray-700"
          >
            Register
          </div>
        </>
      )}

      <div className="border-t pt-4">
        <h3 className="px-3 font-semibold">Categories</h3>
        {menu.map((res, i) => (
          <div key={i} className="pl-4">
              {_.get(res, "main_category_name", "")}
            {_.get(res, "sub_categories_details", []).map((sub, j) => (
              <div
                key={j}
                onClick={() =>
                  handleCategoryClick(
                    res.main_category_name,
                    sub.sub_category_name,
                    res._id,
                    sub._id
                  )
                }
                className="px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                {sub.sub_category_name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Desktop Navbar */}
      <div
        className={`w-full hidden lg:flex h-20 gap-x-10 bg-[#f2c41a] justify-between items-center px-4 lg:px-8 xl:px-20 sticky top-0 z-40 ${
          isScrolled ? "shadow-xl" : "shadow-lg"
        }`}
      >
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-x-8 xl:gap-x-32 w-[70%]">
          <Link to="/">
            <img src={Logo} alt="logo" className="h-16" />
          </Link>
          <SearchInput />
        </div>

        {/* Right: User Section */}
        <div className="flex items-center justify-end gap-x-4 w-[30%]">
          {isAuth ? <UserMenu /> : <AuthButtons />}
          <SupportSection />
          <HelpCenterLink />
        </div>
      </div>

      {/* Mobile Navbar */}
      <div
        className={`block lg:hidden w-full fixed top-0 left-0 z-[9999] bg-[#f2c41a] ${
          isScrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="w-full h-14 flex items-center justify-between px-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuStatus(true)}
              className="p-2 text-[#121621]"
            >
              <IoMenu className="text-2xl" />
            </button>
            <Link to="/" onClick={closeSearchBar}>
              <img src={Logo} alt="Logo" className="h-8 object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2 rounded-full text-[#121621]"
            >
              {showSearchBar ? <BsXLg /> : <BsSearch />}
            </button>
            {isAuth ? <UserMenu /> : <AuthButtons />}
          </div>
        </div>

        {/* Expandable Search Bar */}
        <div
          className={`w-full bg-[#f2c41a] transition-all duration-300 overflow-hidden border-t border-gray-200 ${
            showSearchBar ? "max-h-20 py-3" : "max-h-0 py-0"
          }`}
        >
          <div className="px-3">
            <SearchInput isMobile />
          </div>
        </div>
      </div>

      {/* Drawer */}
      <CustomDrawer isOpen={menuStatus} onClose={() => setMenuStatus(false)}>
        <MobileMenuContent />
      </CustomDrawer>

      {/* Spacer for mobile navbar */}
      <div
        className={`block lg:hidden transition-all duration-300 ${
          showSearchBar ? "h-32" : "h-14"
        }`}
      />
    </div>
  );
};

export default Navbar;