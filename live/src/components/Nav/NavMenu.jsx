import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import _ from "lodash";
import { Link, useNavigate } from "react-router-dom";
import ExitementTag from "./ExitementTag";

const NavMenu = () => {
  const { menu } = useSelector((state) => state.publicSlice);
  const navigation = useNavigate();
  const dropdownRefs = useRef({});
  const [hoverDrop, setHoverDrop] = useState(false);
  const [mega, setMega] = useState(false);

  // State management
  const [activeDropdown, setActiveDropdown] = useState({
    megaMenu: false,
    categories: {},
  });

  const [isAnyMegaMenuOpen, setIsAnyMegaMenuOpen] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    category_id: null,
    side_category_id: null,
    sideSubcatId: null,
  });

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown({
      megaMenu: false,
      categories: {},
    });
    setHoverStates({
      category_id: null,
      side_category_id: null,
      sideSubcatId: null,
    });
    setIsAnyMegaMenuOpen(false);
  };

  // Control body overflow
  useEffect(() => {
    if (isAnyMegaMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup on unmount
    };
  }, [isAnyMegaMenuOpen]);

  // Toggle dropdowns
  const toggleDropdown = (dropdownName, categoryId = null) => {
    if (dropdownName === "megaMenu") {
      setActiveDropdown((prev) => ({
        ...prev,
        megaMenu: !prev.megaMenu,
        categories: {},
      }));
      setIsAnyMegaMenuOpen(!activeDropdown.megaMenu);
    } else {
      setActiveDropdown((prev) => ({
        ...prev,
        megaMenu: false,
        categories: {
          [categoryId]: !prev.categories[categoryId],
        },
      }));
      setIsAnyMegaMenuOpen(!activeDropdown.categories[categoryId]);
    }
  };

  // Handle hover states
  const handleHoverState = (key, value) => {
    setHoverStates((prev) => ({ ...prev, [key]: value }));
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const shouldClose = !Object.values(dropdownRefs.current).some((ref) =>
        ref?.current?.contains(event.target)
      );

      if (shouldClose) closeAllDropdowns();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hidden lg:block xl:block 2xl:block bg-primary h-full capitalize text-base lg:px-10 2xl:px-40 w-full p-4">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.2s ease forwards;
        }

        .nav-gradient {
          background: transparent;
        }

        .nav-shadow {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1),
            0 1px 8px rgba(0, 0, 0, 0.05);
        }

        .category-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
          background: transparent;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
          background: transparent;
        }

        .subcategory-item {
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .subcategory-item:hover {
          border-left-color: #3b82f6;
          background-color: rgba(241, 245, 249, 0.3);
        }

        .product-item {
          transition: all 0.2s ease;
        }

        .product-item:hover {
          background-color: rgba(248, 250, 252, 0.3);
          transform: translateX(5px);
        }

        .menu-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.3) 50%,
            transparent 100%
          );
        }

        .dropdown-panel {
          background: transparent;
          backdrop-filter: blur(5px);
        }

        .mega-menu-container {
          background: transparent;
          backdrop-filter: blur(5px);
        }

        /* Added styles for yellow hover effect */
        .nav-item-hover:hover {
          color: #ffd700 !important; /* Yellow color */
        }
      `}</style>

      <div className="flex gap-x-4 !h-full justify-center items-center w-full relative">
        {/* All Categories Mega Menu */}
        <div className="w-[200px] center_div rounded-md !text-white">
          <div ref={(el) => (dropdownRefs.current.megaMenu = { current: el })}>
            <Link
              to="/all-categories"
              onMouseEnter={(e) => {
                e.preventDefault();
                toggleDropdown("megaMenu");
                handleHoverState("side_category_id", "view");
              }}
              className="!text-[#fdfdfd] center_div gap-x-2 text-[16px] font-bold nav-item-hover transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              All categories <IconHelper.DOWNARROW_ICON />
            </Link>

            {/* Mega Menu Content */}
            {activeDropdown.megaMenu && (
              <div
                className="absolute animate-fade-in max-h-fit w-full z-50 top-[55px] left-0 bg-white rounded-xl overflow-hidden border border-gray-100 border-opacity-20"
                onMouseLeave={closeAllDropdowns}
              >
                <div className="grid grid-cols-5 px-8 py-8 gap-6">
                  {menu.map((result) => (
                    <div key={result._id} className="category-card p-4">
                      <div
                        onMouseEnter={() =>
                          handleHoverState("side_category_id", result._id)
                        }
                        className="flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className="nav-item-hover cursor-pointer font-semibold text-gray-800 transition-colors"
                            onClick={() => {
                              navigation(
                                `/category/${result.main_category_name}/${result._id}`
                              );
                              closeAllDropdowns();
                            }}
                          >
                            {result.main_category_name}
                          </span>
                          {hoverStates.side_category_id === result._id ? (
                            <IconHelper.LEFTARROW_ICON className="text-yellow-500 text-sm rotate-45" />
                          ) : (
                            <IconHelper.RIGHT_ARROW_ICON className="text-gray-400 text-sm" />
                          )}
                        </div>
                        <div className="rounded-lg overflow-hidden border border-gray-200 border-opacity-30 hover:border-yellow-300 transition-colors">
                          <img
                            src={_.get(
                              result,
                              "sub_categories_details[0].sub_category_image",
                              ""
                            )}
                            alt={_.get(
                              result,
                              "sub_categories_details[0].sub_category_name",
                              "Category"
                            )}
                            className="object-cover w-full h-32"
                            onClick={() => {
                              navigation(
                                `/category/${result.main_category_name}/${result._id}`
                              );
                              closeAllDropdowns();
                            }}
                          />
                        </div>
                      </div>

                      {/* Subcategory Panel */}
                      {hoverStates.side_category_id === result._id && (
                        <div
                          className="absolute min-w-[300px] min-h-full dropdown-panel nav-shadow top-0 left-full border-l border-gray-200 border-opacity-20 rounded-r-xl overflow-hidden animate-slide-in"
                          onMouseLeave={() =>
                            handleHoverState("side_category_id", null)
                          }
                        >
                          <div className="p-4">
                            <h3 className="font-bold text-gray-800 mb-3 text-lg">
                              Subcategories
                            </h3>
                            <div className="menu-divider my-2"></div>
                            {result.sub_categories_details?.map((subcat) => (
                              <div
                                key={subcat._id}
                                className="subcategory-item pl-3 py-2"
                              >
                                <div
                                  onMouseEnter={() =>
                                    handleHoverState("sideSubcatId", subcat._id)
                                  }
                                  className="text-gray-700 text-sm font-medium !min-w-fit flex justify-between items-center h-[40px] nav-item-hover transition-colors"
                                >
                                  <span
                                    className="nav-item-hover cursor-pointer truncate"
                                    onClick={() => {
                                      navigation(
                                        `/category/${result.main_category_name}/${subcat.sub_category_name}/${result._id}/${subcat._id}`
                                      );
                                      closeAllDropdowns();
                                    }}
                                  >
                                    {subcat.sub_category_name}
                                  </span>
                                  {hoverStates.sideSubcatId === subcat._id ? (
                                    <IconHelper.LEFTARROW_ICON className="text-yellow-500 text-xs" />
                                  ) : (
                                    <IconHelper.RIGHT_ARROW_ICON className="text-gray-400 text-xs" />
                                  )}
                                </div>

                                {/* Products Panel */}
                                {hoverStates.sideSubcatId === subcat._id && (
                                  <div
                                    className="absolute min-w-[300px] !bg-white min-h-full top-0 left-full border-l border-gray-200 border-opacity-20 rounded-r-xl p-4 animate-slide-in"
                                    onMouseLeave={() =>
                                      handleHoverState("sideSubcatId", null)
                                    }
                                  >
                                    <h4 className="font-semibold text-gray-800 mb-3">
                                      Products
                                    </h4>
                                    <div className="my-2"></div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                      {result.product_details
                                        ?.filter(
                                          (p) =>
                                            p.sub_category_details === subcat._id
                                        )
                                        .map((product) => (
                                          <div
                                            key={product._id}
                                            className="product-item flex items-center justify-between p-2 rounded-lg"
                                          >
                                            <div className="flex items-center gap-3 min-w-0 w-full">
                                              <div className="flex-shrink-0 relative w-12 h-12">
                                                <div className="absolute inset-0 rounded-md overflow-hidden border border-gray-200 border-opacity-30">
                                                  <img
                                                    src={_.get(
                                                      product,
                                                      "images[0].path",
                                                      "/placeholder-product.jpg"
                                                    )}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      e.target.src =
                                                        "/placeholder-product.jpg";
                                                      e.target.onerror = null;
                                                    }}
                                                  />
                                                </div>
                                              </div>

                                              <span
                                                className="text-sm font-medium text-gray-800 truncate nav-item-hover cursor-pointer flex-grow"
                                                onClick={() => {
                                                  navigation(
                                                    `/product/${product.seo_url}`
                                                  );
                                                  closeAllDropdowns();
                                                }}
                                              >
                                                {product.name}
                                              </span>
                                            </div>

                                            <IconHelper.RIGHT_ARROW_ICON className="text-gray-400 text-xs" />
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Dropdowns */}
        {menu
          .filter((cat) => cat.category_active_status)
          .map((category) => {
            const subCategories = _.get(category, "sub_categories_details", []);
            const totalProducts = _.get(category, "product_details", []).length;
            const showAsMegaMenu =
              subCategories.length > 3 || totalProducts > 10;

            return (
              <div
                key={category._id}
                className={`!text-[16px] items-center ${
                  showAsMegaMenu ? "" : "relative"
                }`}
                ref={(el) =>
                  (dropdownRefs.current[`category-${category._id}`] = {
                    current: el,
                  })
                }
              >
                <div
                  className="!text-white center_div gap-x-2 text-nowrap cursor-pointer py-2 px-4 rounded-lg nav-item-hover transition-all duration-300"
                  onMouseEnter={() => {
                    toggleDropdown("categories", category._id);
                    handleHoverState("category_id", category._id);
                  }}
                >
                  <Link
                    to={`/category/${encodeURIComponent(
                      category.main_category_name
                    )}/${category._id}`}
                    className="!center_div gap-x-2 font-bold"
                  >
                    {category.main_category_name}{" "}
                    {activeDropdown.categories[category._id] ? (
                      <IconHelper.UPARROW_ICON />
                    ) : (
                      <IconHelper.DOWNARROW_ICON />
                    )}
                  </Link>
                </div>

                {showAsMegaMenu ? (
                  // Mega Menu Version
                  activeDropdown.categories[category._id] && (
                    <div
                      className="absolute animate-fade-in border border-gray-200 border-opacity-20 bg-transparent backdrop-filter backdrop-blur-md nav-shadow w-[1200px] max-h-[600px] overflow-auto left-[10px] z-50 p-8 top-[55px] rounded-xl"
                      onMouseLeave={closeAllDropdowns}
                    >
                      <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                          {category.main_category_name}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {subCategories.map((subcat) => (
                            <div
                              key={subcat._id}
                              className="group transition-all duration-300 bg-white hover:bg-gray-50 hover:bg-opacity-20 rounded-lg p-4 border border-transparent hover:border-gray-200 hover:border-opacity-20"
                            >
                              {/* Subcategory Title */}
                              <div
                                onClick={() => {
                                  navigation(
                                    `/category/${encodeURIComponent(
                                      category.main_category_name
                                    )}/${encodeURIComponent(
                                      subcat.sub_category_name
                                    )}/${category._id}/${subcat._id}`
                                  );
                                  closeAllDropdowns();
                                }}
                                className="relative pb-2 mb-3 cursor-pointer"
                              >
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-yellow-600 transition-colors flex items-center justify-between">
                                  {subcat.sub_category_name}
                                  <IconHelper.RIGHT_ARROW_ICON className="text-gray-400 text-sm group-hover:text-yellow-500" />
                                </h3>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></div>
                              </div>

                              {/* Product List */}
                              <div className="flex flex-col gap-3">
                                {category.product_details
                                  ?.filter(
                                    (p) => p.sub_category_details === subcat._id
                                  )
                                  .slice(0, 5)
                                  .map((product, index) => (
                                    <Link
                                      to={`/product/${product.seo_url}`}
                                      key={product._id}
                                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 hover:bg-opacity-20 transition-all duration-200 hover:translate-x-1 group/product"
                                      onClick={closeAllDropdowns}
                                      style={{
                                        transitionDelay: `${index * 50}ms`,
                                      }}
                                    >
                                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 border-opacity-30 group-hover/product:border-yellow-300 transition-all">
                                        <img
                                          src={_.get(
                                            product,
                                            "images[0].path",
                                            "/placeholder-product.jpg"
                                          )}
                                          alt={product.name}
                                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                                          onError={(e) => {
                                            e.target.src =
                                              "/placeholder-product.jpg";
                                          }}
                                        />
                                      </div>
                                      <p className="text-sm font-medium text-gray-700 truncate group-hover/product:text-yellow-600 transition-colors">
                                        {product.name}
                                      </p>
                                      <IconHelper.RIGHT_ARROW_ICON className="text-gray-400 text-sm opacity-0 group-hover/product:opacity-100 transition-opacity ml-auto" />
                                    </Link>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View All Button */}
                        <div className="mt-8 text-center">
                          <button
                            onClick={() => {
                              navigation(
                                `/category/${category.main_category_name}`
                              );
                              closeAllDropdowns();
                            }}
                            className="px-6 py-3 bg-yellow-600 bg-opacity-90 text-white rounded-full hover:bg-opacity-100 transition-colors shadow-md hover:shadow-lg font-medium flex items-center justify-center mx-auto"
                          >
                            View All {category.main_category_name}
                            <IconHelper.RIGHT_ARROW_ICON className="ml-2 text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  // Compact Dropdown Version
                  activeDropdown.categories[category._id] && (
                    <div
                      className="absolute animate-fade-in border border-gray-200 border-opacity-20 bg-transparent backdrop-filter backdrop-blur-md nav-shadow min-w-[250px] z-50 py-3 top-[55px] left-0 rounded-xl overflow-hidden"
                      onMouseLeave={closeAllDropdowns}
                    >
                      {subCategories.map((subcat) => (
                        <div key={subcat._id} className="group">
                          <div
                            onClick={() => {
                              navigation(
                                `/category/${category.main_category_name}/${subcat.sub_category_name}/${category._id}/${subcat._id}`
                              );
                              closeAllDropdowns();
                            }}
                            className="px-4 py-3 hover:bg-gray-50 hover:bg-opacity-20 text-gray-800 cursor-pointer font-medium border-b border-gray-100 border-opacity-20 flex items-center justify-between transition-colors"
                          >
                            {subcat.sub_category_name}
                          </div>
                          <div className="flex flex-col pl-4">
                            {category.product_details
                              ?.filter(
                                (p) => p.sub_category_details === subcat._id&&p.is_visible===true
                              )
                              .slice(0, 3)
                              .map((product) => (
                                <Link
                                  to={`/product/${product.seo_url}`}
                                  key={product._id}
                                  className="px-4 py-2 text-sm hover:bg-gray-50 hover:bg-opacity-20 text-gray-700 nav-item-hover transition-colors flex items-center group/item"
                                  onClick={closeAllDropdowns}
                                >
                                  <span className="truncate">
                                    {product.is_visible ? product.name : ""}
                                  </span>
                                  <IconHelper.RIGHT_ARROW_ICON className="text-gray-400 text-xs ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </Link>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default NavMenu;