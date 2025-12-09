import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import _ from "lodash";

// Icons
import {
  BsCart3,
  BsSearch,
  BsXLg,
  BsPerson,
  BsHeart,
  BsHouse,
  BsGrid,
  BsTelephone,
} from "react-icons/bs";
import { IoMenu, IoClose, IoHeartOutline } from "react-icons/io5";
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
  const location = useLocation();

  const { isSearchingProducts, searchingProducts, menu } = useSelector(
    (state) => state.publicSlice
  );

  const { isAuth, user } = useSelector((state) => state.authSlice);
  const cartCount = useSelector((state) => state.cartSlice.count);

  const heartCount = user?.wish_list?.length ?? 0;
  const profileImageName = user?.name?.[0] ?? "";
  const userName = user?.name ?? "User";

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [menuStatus, setMenuStatus] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [lastScrollY, setLastScrollY] = useState(0);

  // Refs
  const scrollTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const isClickFromResultRef = useRef(false);
  const userDropdownRef = useRef(null);
  const mobileUserDropdownRef = useRef(null);

  // Set active nav based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveNav("home");
    else if (path.includes("shopping-cart")) setActiveNav("cart");
    else if (path.includes("wishlist")) setActiveNav("wishlist");
    else if (path.includes("account")) setActiveNav("account");
    else if (path.includes("category")) setActiveNav("categories");
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

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

  // Search debounce effect
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

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click came from search result, don't close
      if (isClickFromResultRef.current) {
        isClickFromResultRef.current = false;
        return;
      }

      // Check if click is outside search input and results
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsExpanded(false);
      }

      // Check if click is outside user dropdown (desktop)
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        showUserDropdown
      ) {
        setShowUserDropdown(false);
      }

      // Check if click is outside mobile user dropdown
      if (
        mobileUserDropdownRef.current &&
        !mobileUserDropdownRef.current.contains(event.target) &&
        showUserDropdown
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  // Handlers
  const handleSearchFocus = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchProduct(value);
    if (value.trim()) {
      setIsExpanded(true);
    }
  }, []);

  const closeSearchBar = useCallback(() => {
    setShowSearchBar(false);
    setIsExpanded(false);
    setSearchProduct("");
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
    setMenuStatus(false);
    setShowUserDropdown(false);
  }, [dispatch, navigate]);

  const handleDestination = useCallback(
    (url) => {
      navigate(url);
      setMenuStatus(false);
      closeSearchBar();
      setShowUserDropdown(false);
      setIsExpanded(false);
    },
    [navigate, closeSearchBar]
  );

  const handleSearchResultClick = useCallback(
    (seoUrl) => {
      // Mark that click came from search result
      isClickFromResultRef.current = true;

      // Navigate to product
      handleDestination(`/product/${seoUrl}`);

      // Clear search
      setSearchProduct("");
    },
    [handleDestination]
  );

  const handleCategoryClick = useCallback(
    (mainId, subId) => {
      handleDestination(`/category/${mainId}/${subId}`);
    },
    [handleDestination]
  );

  // Handle dropdown item click
  const handleDropdownItemClick = useCallback(
    (url) => {
      handleDestination(url);
      setShowUserDropdown(false);
    },
    [handleDestination]
  );

  // Search Input Component
  const SearchInput = ({ isMobile = false }) => {
    const localInputRef = useRef(null);

    // Focus input when expanded
    useEffect(() => {
      if (!isMobile && isExpanded && searchProduct && localInputRef.current) {
        localInputRef.current.focus();
      }
    }, [isExpanded, searchProduct, isMobile]);

    const handleSearchSubmit = useCallback(
      (e) => {
        e.preventDefault();
        if (searchProduct.trim()) {
          navigate(`/search?q=${encodeURIComponent(searchProduct)}`);
          setIsExpanded(false);
          if (isMobile) {
            closeSearchBar();
          }
        }
      },
      [searchProduct, navigate, isMobile, closeSearchBar]
    );

    return (
      <div
        className={`relative ${
          isMobile ? "w-full" : "w-full md:w-[35vw] lg:w-[25vw]"
        }`}
        ref={searchInputRef}
      >
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              ref={localInputRef}
              type="text"
              placeholder="What are you looking for?"
              value={searchProduct}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className={`w-full px-5 py-4 rounded-2xl border-2 border-transparent focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-white/95 backdrop-blur-sm shadow-lg text-gray-800 placeholder-gray-500 transition-all duration-300 ${
                isMobile ? "pr-12 text-base" : "pr-12"
              }`}
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              style={{ zIndex: 10012 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300">
                <BsSearch className="text-white text-lg" />
              </div>
            </button>
          </div>
        </form>

        {/* Search Results */}
        {isExpanded && searchProduct && (
          <div
            ref={searchResultsRef}
            className={`absolute top-full left-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden mt-3 border border-yellow-100 transition-all duration-200 ${
              isExpanded && searchProduct
                ? "opacity-100 visible max-h-[60vh]"
                : "opacity-0 invisible max-h-0"
            } ${isMobile ? "fixed left-4 right-4 w-auto" : "w-full"}`}
            style={{
              zIndex: 10010,
              maxHeight: "60vh",
            }}
          >
            <div className="overflow-y-auto max-h-[60vh]">
              {isSearchingProducts ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600 text-sm">Searching products...</p>
                </div>
              ) : searchingProducts.length === 0 && searchProduct ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <BsSearch className="text-2xl text-yellow-600" />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">
                    No products found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try different keywords
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchingProducts.map((data) => (
                    <div
                      key={data._id}
                      className="cursor-pointer transition-all duration-200 hover:bg-yellow-50 active:bg-yellow-100"
                      onMouseDown={(e) => {
                        // Prevent default and stop propagation
                        e.preventDefault();
                        e.stopPropagation();

                        // Mark that click came from search result
                        isClickFromResultRef.current = true;

                        // Navigate to product
                        navigate(`/product/${data.seo_url || data._id}`);

                        // Clear and close search
                        setSearchProduct("");
                        setIsExpanded(false);

                        // Close mobile search bar if open
                        if (isMobile) {
                          closeSearchBar();
                        }
                      }}
                    >
                      <div className="py-4 px-4">
                        <SearchProductCard data={data} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desktop Auth Buttons Component
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
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
            {cartCount}
          </span>
        )}
        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-yellow-50 shadow-sm border border-yellow-100">
          <BsCart3 className="text-xl text-[#121621]" />
        </div>
      </Link>
      <Link
        to="/login"
        className="relative text-black hover:text-black px-4 py-2.5 rounded-xl group overflow-hidden transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm border border-yellow-200"
        onClick={closeSearchBar}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="relative z-10 flex items-center gap-2 font-semibold text-sm">
          <BsPerson className="text-lg group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:translate-x-0.5 transition-transform duration-300">
            Login
          </span>
        </span>
      </Link>
    </div>
  );

  // Desktop User Menu Component
  const UserMenu = () => (
    <div className="flex items-center justify-end gap-4">
      <Link
        to="/account/wishlist"
        className="p-2 relative"
        onClick={closeSearchBar}
      >
        {heartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
            {heartCount}
          </span>
        )}
        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-yellow-50 shadow-sm border border-yellow-100">
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
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
            {cartCount}
          </span>
        )}
        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-yellow-50 shadow-sm border border-yellow-100">
          <BsCart3 className="text-xl text-[#121621]" />
        </div>
      </Link>

      <div className="relative" ref={userDropdownRef}>
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f2c41a] to-[#e6b800] text-white flex items-center justify-center border-2 border-white shadow-md capitalize text-lg font-semibold transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105">
            {profileImageName}
          </div>
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="py-2">
              <button
                onClick={() => handleDropdownItemClick("/account")}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors duration-200 w-full text-left"
              >
                <BsPerson className="text-lg" />
                My Account
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <IoClose className="text-lg" />
                LogOut
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Support Section Component
  const SupportSection = () => (
    <div className="text-sm items-center gap-x-2 hidden lg:flex">
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

  // Custom Drawer (Mobile Menu)
  const CustomDrawer = ({ isOpen, onClose, children }) => (
    <div
      className={`fixed inset-0 z-[10000] transition-all duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div
        className={`absolute left-0 top-0 h-screen w-full bg-gradient-to-b from-white to-yellow-50 shadow-2xl transform transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 10001 }}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="h-8" />
              <span className="text-white font-bold text-lg">Menu</span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 active:scale-95"
            >
              <IoClose className="text-white text-xl" />
            </button>
          </div>

          {/* User Welcome */}
          {isAuth && (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                {profileImageName}
              </div>
              <div>
                <p className="text-white font-semibold">Hello, {userName}</p>
                <p className="text-white/80 text-sm">Welcome back!</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100vh-120px)] p-4 pb-24">
          {children}
        </div>
      </div>
    </div>
  );

  // Mobile Menu Content
  const MobileMenuContent = () => (
    <div className="flex flex-col gap-3">
      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Quick Links
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => handleDestination("/")}
            className="bg-white rounded-2xl p-4 text-center shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <BsHouse className="text-white text-xl" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Home</span>
          </div>

          {isAuth ? (
            <div
              onClick={() => handleDestination("/account")}
              className="bg-white rounded-2xl p-4 text-center shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300 active:scale-95 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <BsPerson className="text-white text-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Profile
              </span>
            </div>
          ) : (
            <div
              onClick={() => handleDestination("/login")}
              className="bg-white rounded-2xl p-4 text-center shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300 active:scale-95 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <BsPerson className="text-white text-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Login</span>
            </div>
          )}
        </div>
      </div>

      {/* Account Section for Auth Users */}
      {isAuth && (
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BsPerson className="text-yellow-600" />
            My Account
          </h3>
          <div className="space-y-2">
            <div
              onClick={() => {
                fetchCartData();
                handleDestination("/shopping-cart");
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <BsCart3 className="text-gray-600 text-lg" />
                <span className="text-gray-700">My Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <div
              onClick={() => handleDestination("/account/wishlist")}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-yellow-50 cursor-pointer transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <BsHeart className="text-gray-600 text-lg" />
                <span className="text-gray-700">My Wishlist</span>
              </div>
              {heartCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center font-bold">
                  {heartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BsGrid className="text-yellow-600" />
          Categories
        </h3>
        <div className="space-y-2">
          {menu.map((res, i) => (
            <div key={i} className="mb-3">
              <div className="font-medium text-gray-700 px-3 py-2 bg-yellow-50 rounded-lg mb-1">
                {_.get(res, "main_category_name", "")}
              </div>
              {_.get(res, "sub_categories_details", []).map((sub, j) => (
                <div
                  key={j}
                  onClick={() => handleCategoryClick(res.slug, sub.slug)}
                  className="px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-yellow-50 cursor-pointer transition-colors duration-200 ml-2"
                >
                  {sub.sub_category_name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Support Section for Mobile */}
      <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-4 mt-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BsTelephone className="text-yellow-600" />
          Support
        </h3>
        <a
          href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-50 transition-colors duration-200 text-gray-700"
        >
          <IconHelper.WHATSAPP_ICON className="text-green-500 text-xl" />
          <div>
            <p className="font-medium">+91 95856 10000</p>
            <p className="text-sm text-gray-500">Customer Support</p>
          </div>
        </a>
      </div>
    </div>
  );

  // Bottom Navigation Component - Only for Mobile
  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] w-screen block lg:hidden">
      <div className="bg-white/95 backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-white/20 p-2 mx-2">
        <div className="flex items-center justify-around">
          {/* Home */}
          <button
            onClick={() => handleDestination("/")}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
              activeNav === "home"
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-110"
                : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            <BsHouse
              className={`text-xl ${activeNav === "home" ? "scale-110" : ""}`}
            />
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>

          {/* Categories */}
          <button
            onClick={() => setMenuStatus(true)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
              activeNav === "categories"
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-110"
                : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            <BsGrid
              className={`text-xl ${
                activeNav === "categories" ? "scale-110" : ""
              }`}
            />
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>

          {/* Search */}
          <button
            onClick={() => setShowSearchBar(!showSearchBar)}
            className="flex flex-col items-center justify-center p-3 rounded-xl text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-300"
          >
            <div className="relative">
              <BsSearch className="text-xl" />
            </div>
            <span className="text-xs mt-1 font-medium">Search</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => {
              fetchCartData();
              handleDestination("/shopping-cart");
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 relative ${
              activeNav === "cart"
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-110"
                : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            <div className="relative">
              <BsCart3
                className={`text-xl ${activeNav === "cart" ? "scale-110" : ""}`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Cart</span>
          </button>

          {/* Account */}
          <button
            onClick={() => {
              if (isAuth) {
                setShowUserDropdown(!showUserDropdown);
              } else {
                handleDestination("/login");
              }
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 relative ${
              activeNav === "account"
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-110"
                : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            <BsPerson
              className={`text-xl ${
                activeNav === "account" ? "scale-110" : ""
              }`}
            />
            <span className="text-xs mt-1 font-medium">Me</span>
          </button>
        </div>
      </div>

      {/* User Dropdown for Mobile */}
      {showUserDropdown && isAuth && (
        <div
          ref={mobileUserDropdownRef}
          className="absolute bottom-full right-2 mb-4 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* User Info */}
          <div className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                {profileImageName}
              </div>
              <div>
                <p className="font-semibold">{userName}</p>
                <p className="text-white/80 text-sm">Welcome back!</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => handleDropdownItemClick("/account")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 transition-colors duration-200 w-full text-left"
            >
              <BsPerson className="text-yellow-600 text-lg" />
              <span>My Account</span>
            </button>
            <button
              onClick={() => handleDropdownItemClick("/account/wishlist")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 transition-colors duration-200 w-full text-left"
            >
              <div className="relative">
                <BsHeart className="text-yellow-600 text-lg" />
                {heartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {heartCount}
                  </span>
                )}
              </div>
              <span>My Wishlist</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 w-full text-left transition-colors duration-200"
            >
              <IoClose className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full m-0">
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

      {/* Mobile Top Bar */}
      <div
        className={`block lg:hidden w-full fixed top-0 left-0 z-[9999] bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 ${
          isScrolled ? "shadow-2xl" : "shadow-lg"
        }`}
      >
        <div className="w-full h-16 flex items-center justify-between px-4">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuStatus(true)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 active:scale-95 shadow-lg"
            >
              <IoMenu className="text-white text-xl" />
            </button>
            <Link
              to="/"
              onClick={closeSearchBar}
              className="flex items-center gap-2"
            >
              <img src={Logo} alt="Logo" className="h-7 object-contain" />
              <span className="text-white font-bold text-sm hidden sm:block">
                Store
              </span>
            </Link>
          </div>

          {/* Right: Search */}
          <button
            onClick={() => setShowSearchBar(!showSearchBar)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 active:scale-95 shadow-lg"
          >
            {showSearchBar ? (
              <BsXLg className="text-white text-lg" />
            ) : (
              <BsSearch className="text-white text-lg" />
            )}
          </button>
        </div>

        {/* Expandable Search Bar */}
        <div
          className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 overflow-hidden ${
            showSearchBar
              ? "max-h-32 py-4 border-t border-yellow-300/30"
              : "max-h-0 py-0"
          }`}
        >
          <div className="px-4 relative">
            <SearchInput isMobile />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Only on Mobile */}
      <BottomNavigation />

      {/* Mobile Menu Drawer */}
      <CustomDrawer isOpen={menuStatus} onClose={() => setMenuStatus(false)}>
        <MobileMenuContent />
      </CustomDrawer>

      {/* Spacer for mobile navbar */}
      <div
        className={`block lg:hidden transition-all duration-300 ${
          showSearchBar ? "h-32" : "h-16"
        }`}
      />
    </div>
  );
};

export default Navbar;