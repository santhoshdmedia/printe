import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    const cartRefreshInterval = setInterval(fetchCartData, 30000);
    return () => clearInterval(cartRefreshInterval);
  }, [fetchCartData]);

  // Handlers
  const handleSearchFocus = () => {
    setIsExpanded(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (!searchProduct) {
        setIsExpanded(false);
      }
    }, 200);
  };

  const handleSearchChange = (e) => {
    setSearchProduct(e.target.value);
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
      setIsExpanded(false);
    }
  };

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

  // Login modal handlers
  const showLoginModal = () => {
    setLoginModalVisible(true);
    setMenuStatus(false);
  };

  const handleLoginModalClose = () => {
    setLoginModalVisible(false);
  };

  // Search Results Component
  const SearchResultsDropdown = () => (
    <div
      className={`absolute top-full left-0 z-50 bg-white/95 backdrop-blur-md rounded-b-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded && searchProduct
          ? "opacity-100 max-h-96 w-full visible border-t border-gray-200"
          : "opacity-0 max-h-0 invisible"
      }`}
    >
      <div className="h-96 overflow-y-auto">
        {isSearchingProducts ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#f2c41a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {searchingProducts.length === 0 && searchProduct ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-500">No products found</span>
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
                      className="hover:bg-[#f2c41a]/5 transition-colors duration-200"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Auth Buttons Component
  const AuthButtons = () => (
    <div className="flex items-center space-x-4">
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
        className="relative text-black hover:text-black px-4 py-2 rounded-lg group overflow-hidden transition-all duration-500 hover:shadow-lg block"
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
    <div className="flex items-center justify-end gap-3">
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

  // Custom Modal Component
  const CustomModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        ></div>
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Mobile Menu Content
  const MobileMenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 mb-6">
          <div
            onClick={() => handleDestination("/")}
            className="px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 font-medium cursor-pointer text-gray-900"
          >
            Home
          </div>

          {isAuth ? (
            <>
              <div
                onClick={() => handleDestination("/account")}
                className="px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer text-gray-700"
              >
                My Account
              </div>
              <div
                onClick={() => {
                  fetchCartData();
                  handleDestination("/shopping-cart");
                }}
                className="px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer text-gray-700"
              >
                My Cart {cartCount > 0 && `(${cartCount})`}
              </div>
              <div
                onClick={() => handleDestination("/account/wishlist")}
                className="px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer text-gray-700"
              >
                My Wishlist {heartCount > 0 && `(${heartCount})`}
              </div>
            </>
          ) : (
            <>
              <div
                onClick={showLoginModal}
                className="px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer text-gray-700"
              >
                Login
              </div>
              <div
                onClick={() => handleDestination("/sign-up")}
                className="px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer text-gray-700"
              >
                Register
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="px-3 py-2 font-semibold text-gray-900">Categories</h3>
          <div className="space-y-1">
            {menu.map((res, index) => (
              <div key={index} className="border-b border-gray-100 last:border-b-0">
                <div className="px-3 py-3 font-medium text-gray-900">
                  {_.get(res, "main_category_name", "")}
                </div>
                <div className="pl-6 space-y-1 pb-2">
                  {_.get(res, "sub_categories_details", []).map(
                    (subRes, subIndex) => (
                      <div
                        key={subIndex}
                        onClick={() =>
                          handleCategoryClick(
                            _.get(res, "main_category_name", ""),
                            _.get(subRes, "sub_category_name", ""),
                            _.get(res, "_id", ""),
                            _.get(subRes, "_id", "")
                          )
                        }
                        className="px-3 py-2 text-sm text-gray-700 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer"
                      >
                        {_.get(subRes, "sub_category_name", "")}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div
          onClick={() => handleDestination("/help")}
          className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors duration-300 hover:bg-slate-100 cursor-pointer text-gray-700 mb-4"
        >
          <IconHelper.HELP_ICON className="text-xl text-[#f2c41a]" />
          <span className="font-medium">Help Center</span>
        </div>

        {/* Support Section in Mobile Menu */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm flex items-center gap-3">
            <div>
              <IconHelper.SUPPORT_ICON className="text-2xl text-[#121621]" />
            </div>
            <div>
              <h1 className="text-gray-900 font-medium">
                <a
                  href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#121621]"
                >
                  +91 95856 10000
                </a>
              </h1>
              <h1 className="text-gray-600 text-xs capitalize">Customer Support</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Custom Drawer Component
  const CustomDrawer = ({ isOpen, onClose, title, children }) => {
    return (
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={onClose}
        ></div>
        
        {/* Drawer Content */}
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#f2c41a]">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="h-8" />
              <span className="font-semibold text-gray-900">{title}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
          
          {/* Body */}
          <div className="h-[calc(100%-64px)] overflow-hidden p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

    // Search Input Component
  const SearchInput = ({ isMobile = false }) => (
    <div className={`relative ${isMobile ? 'w-full' : 'w-[280px] md:w-[350px] lg:w-[400px] xl:w-[500px]'}`}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search Product..."
          value={searchProduct}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          className={`w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-[#f2c41a] bg-white transition-all duration-300 ${
            isMobile ? 'pr-12' : 'pr-12'
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <BsSearch className="text-lg" />
        </div>
      </div>
      <SearchResultsDropdown />
    </div>
  );

  return (
    <div className="w-full">
      {/* Login Modal */}
      <CustomModal
        isOpen={loginModalVisible}
        onClose={handleLoginModalClose}
        title="Login to Your Account"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">Login component would go here</p>
          <button 
            onClick={handleLoginModalClose}
            className="px-6 py-2 bg-[#f2c41a] text-gray-900 rounded-full font-medium hover:bg-[#e6b80a] transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </CustomModal>
      {/* Desktop Navbar */}
      <div className={`w-full lg:flex hidden h-20 gap-x-10 bg-[#f2c41a] shadow-lg justify-between items-center px-4 lg:px-8 xl:px-20 sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'shadow-xl' : 'shadow-lg'
      }`}>
        <div className="flex items-center gap-x-4 xl:gap-x-32 w-auto lg:w-[100%] xl:w-[70%] justify-start">
          <Link
            to="/"
            className="text-[#121621] uppercase cursor-pointer"
          >
            <div className="flex flex-row items-center">
              <img
                src={Logo}
                alt="printee logo"
                className="w-auto h-16 bg-center bg-contain rounded-md"
              />
            </div>
          </Link>

          <SearchInput />
        </div>

        <div className="flex items-center justify-end gap-x-4 xl:gap-x-10 w-auto xl:w-[30%]">
          <SupportSection />
          {isAuth ? <UserMenu /> : <AuthButtons />}
          <HelpCenterLink />
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className={`block lg:hidden w-full fixed top-0 left-0 z-40 bg-[#f2c41a] transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      }`}>
        {/* Main Navbar Row */}
        <div className="w-full h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuStatus(true)}
              className="p-2 transition-transform duration-300 hover:scale-110 text-[#121621]"
            >
              <IoMenu className="text-2xl" />
            </button>
            <Link to="/" className="flex items-center" onClick={closeSearchBar}>
              <img
                src={Logo}
                alt="Printe Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSearchBar}
              className="p-2 transition-colors duration-300 hover:bg-[#00000010] rounded-full text-[#121621]"
            >
              {showSearchBar ? (
                <BsXLg className="text-lg" />
              ) : (
                <BsSearch className="text-lg" />
              )}
            </button>

            {isAuth ? <UserMenu /> : <AuthButtons />}
          </div>
        </div>

        {/* Expandable Search Bar */}
        <div
          className={`w-full bg-[#f2c41a] transition-all duration-300 overflow-hidden border-t border-gray-200 ${
            showSearchBar ? "max-h-20 py-4" : "max-h-0"
          }`}
        >
          <div className="px-4">
            <SearchInput isMobile={true} />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <CustomDrawer
        isOpen={menuStatus}
        onClose={() => setMenuStatus(false)}
        title="Menu"
      >
        <MobileMenuContent />
      </CustomDrawer>

      {/* Spacer for fixed mobile navbar */}
      <div className="block lg:hidden h-16"></div>
    </div>
  );
};

export default Navbar;
