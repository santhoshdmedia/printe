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
      className={`relative ${
        isMobile ? "w-full" : "w-[280px] md:w-[350px] lg:w-[400px] xl:w-[500px]"
      }`}
    >
      <input
        type="text"
        placeholder="Search Product..."
        value={searchProduct}
        onChange={handleSearchChange}
        onFocus={() => setIsExpanded(true)}
        onBlur={() =>
          setTimeout(() => {
            if (!searchProduct) setIsExpanded(false);
          }, 200)
        }
        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-[#f2c41a] bg-white transition-all duration-300 pr-12"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        <BsSearch className="text-lg" />
      </div>
      {/* Search Results */}
      <div
        className={`absolute top-full left-0 z-50 bg-white rounded-b-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
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
          ) : searchingProducts.length === 0 && searchProduct ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
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
                  <SearchProductCard data={data} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Custom Drawer (Mobile Menu)
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
      <div className="flex items-center justify-between p-4 border-b bg-[#f2c41a]">
        <img src={Logo} alt="Logo" className="h-8" />
        <button onClick={onClose}>
          <IoClose className="text-xl" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto h-[calc(100vh-64px)] p-4">
        {children}
      </div>
    </div>
  </div>
);


  // Mobile Menu Content
  const MobileMenuContent = () => (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => handleDestination("/")}
        className="px-3 py-3 rounded-md hover:bg-slate-100 cursor-pointer"
      >
        Home
      </div>
      {isAuth ? (
        <>
          <div
            onClick={() => handleDestination("/account")}
            className="px-3 py-3 hover:bg-slate-100 cursor-pointer"
          >
            My Account
          </div>
          <div
            onClick={() => {
              fetchCartData();
              handleDestination("/shopping-cart");
            }}
            className="px-3 py-3 hover:bg-slate-100 cursor-pointer"
          >
            My Cart {cartCount > 0 && `(${cartCount})`}
          </div>
          <div
            onClick={() => handleDestination("/account/wishlist")}
            className="px-3 py-3 hover:bg-slate-100 cursor-pointer"
          >
            My Wishlist {heartCount > 0 && `(${heartCount})`}
          </div>
          <div
            onClick={logout}
            className="px-3 py-3 text-red-600 hover:bg-slate-100 cursor-pointer"
          >
            Logout
          </div>
        </>
      ) : (
        <>
          <div
            onClick={() => handleDestination("/login")}
            className="px-3 py-3 hover:bg-slate-100 cursor-pointer"
          >
            Login
          </div>
          <div
            onClick={() => handleDestination("/sign-up")}
            className="px-3 py-3 hover:bg-slate-100 cursor-pointer"
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
                className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer"
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
        className={`w-full lg:flex hidden h-20 gap-x-10 bg-[#f2c41a] shadow-lg justify-between items-center px-4 lg:px-8 xl:px-20 sticky top-0 z-40 ${
          isScrolled ? "shadow-xl" : "shadow-lg"
        }`}
      >
        <div className="flex items-center gap-x-4 xl:gap-x-32 w-[70%]">
          <Link to="/">
            <img src={Logo} alt="logo" className="h-16" />
          </Link>
          <SearchInput />
        </div>
        <div className="flex items-center justify-end gap-x-4 w-[30%]">
          {isAuth ? "UserMenuHere" : "AuthButtonsHere"}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div
        className={`block lg:hidden w-full fixed top-0 left-0 z-[9999] bg-[#f2c41a] ${
          isScrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="w-full h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuStatus(true)}
              className="p-2 text-[#121621]"
            >
              <IoMenu className="text-2xl" />
            </button>
            <Link to="/" onClick={closeSearchBar}>
              <img src={Logo} alt="Logo" className="h-10" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2 rounded-full text-[#121621]"
            >
              {showSearchBar ? <BsXLg /> : <BsSearch />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <div
          className={`w-full bg-[#f2c41a] transition-all duration-300 overflow-hidden border-t ${
            showSearchBar ? "max-h-24 py-3" : "max-h-0 py-0"
          }`}
        >
          <div className="px-4">
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
          showSearchBar ? "h-36" : "h-16"
        }`}
      />
    </div>
  );
};

export default Navbar;
