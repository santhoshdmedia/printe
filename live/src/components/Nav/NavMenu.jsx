import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import _ from "lodash";
import { Link, useNavigate } from "react-router-dom";

const NavMenu = () => {
  const { menu } = useSelector((state) => state.publicSlice);
  const navigation = useNavigate();
  const dropdownRefs = useRef({});
  
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

  // Helper function to check if subcategory has visible products
  const hasVisibleProducts = (category, subcatId) => {
    if (!category.product_details || !Array.isArray(category.product_details)) {
      return false;
    }
    
    return category.product_details.some(
      (product) => 
        product.sub_category_details === subcatId && 
        product.is_visible === true
    );
  };

  // Helper function to get visible subcategories
  const getVisibleSubcategories = (category) => {
    if (!category.sub_categories_details || !Array.isArray(category.sub_categories_details)) {
      return [];
    }
    
    return category.sub_categories_details.filter(subcat => 
      hasVisibleProducts(category, subcat._id)
    );
  };

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
      <div className="flex gap-x-2 h-full justify-center items-center w-full relative">
        {/* All Categories Mega Menu */}
        <div className="w-fit center_div rounded-md text-white">
          <div ref={(el) => (dropdownRefs.current.megaMenu = { current: el })}>
            <Link
              to="/all-categories"
              onMouseEnter={(e) => {
                e.preventDefault();
                toggleDropdown("megaMenu");
                handleHoverState("side_category_id", "view");
              }}
              className="text-white center_div gap-x-2 text-[14px] font-bold hover:text-yellow-300 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              All categories <IconHelper.DOWNARROW_ICON />
            </Link>

            {/* Mega Menu Content */}
            {activeDropdown.megaMenu && (
              <div
                className="absolute animate-fade-in max-h-fit w-[60vw] z-50 top-16 inset-0 bg-white rounded-xl overflow-hidden border border-gray-100"
                onMouseLeave={closeAllDropdowns}
              >
                <div className="grid grid-cols-5 px-8 py-8 gap-6 mx-auto">
                  {menu.map((result) => (
                    <div key={result._id} className="p-4 transition-all duration-300 rounded-xl hover:transform hover:-translate-y-1 hover:shadow-lg bg-transparent">
                      <div
                        onMouseEnter={() =>
                          handleHoverState("side_category_id", result._id)
                        }
                        className="flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className="hover:text-yellow-500 cursor-pointer font-semibold text-gray-800 transition-colors"
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
                        <div className="rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-300 transition-colors">
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
                            className="object-fill w-full h-auto"
                            onClick={() => {
                              navigation(
                                `/category/${result.main_category_name}/${result._id}`
                              );
                              closeAllDropdowns();
                            }}
                          />
                        </div>
                      </div>

                      {/* Subcategory Panel - Only show if there are visible subcategories */}
                      {hoverStates.side_category_id === result._id && 
                       getVisibleSubcategories(result).length > 0 && (
                        <div
                          className="absolute min-w-[300px] min-h-full bg-white shadow-lg top-0 left-full border-l border-gray-200 rounded-r-xl overflow-hidden"
                          onMouseLeave={() =>
                            handleHoverState("side_category_id", null)
                          }
                        >
                          <div className="p-4">
                            <h3 className="font-bold text-gray-800 mb-3 text-lg">
                              Subcategories
                            </h3>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
                            {getVisibleSubcategories(result).map((subcat) => (
                              <div
                                key={subcat._id}
                                className="pl-3 py-2 transition-all duration-200 border-l-3 border-transparent hover:border-blue-500 hover:bg-gray-50"
                              >
                                <div
                                  onMouseEnter={() =>
                                    handleHoverState("sideSubcatId", subcat._id)
                                  }
                                  className="text-gray-700 text-sm font-medium min-w-fit flex justify-between items-center h-10 hover:text-yellow-500 transition-colors"
                                >
                                  <span
                                    className="hover:text-yellow-500 cursor-pointer truncate"
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
                                    className="absolute min-w-[300px] bg-white min-h-full top-0 left-full border-l border-gray-200 rounded-r-xl p-4"
                                    onMouseLeave={() =>
                                      handleHoverState("sideSubcatId", null)
                                    }
                                  >
                                    <h4 className="font-semibold text-gray-800 mb-3">
                                      Products
                                    </h4>
                                    <div className="h-px bg-gray-200 my-2"></div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                      {result.product_details
                                        ?.filter(
                                          (p) =>
                                            p.sub_category_details === subcat._id && 
                                            p.is_visible === true
                                        )
                                        .map((product) => (
                                          <div
                                            key={product._id}
                                            className="flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:transform hover:translate-x-1"
                                          >
                                            <div className="flex items-center gap-3 min-w-0 w-full">
                                              <div className="flex-shrink-0 relative w-12 h-12">
                                                <div className="absolute inset-0 rounded-md overflow-hidden border border-gray-200">
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
                                                className="text-sm font-medium text-gray-800 truncate hover:text-yellow-500 cursor-pointer flex-grow"
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
            const visibleSubCategories = getVisibleSubcategories(category);
            const totalProducts = _.get(category, "product_details", []);
            
            const showAsMegaMenu =
              visibleSubCategories.length > 3 || totalProducts > 10;

            // Don't show category if no visible subcategories
            if (visibleSubCategories.length === 0) {
              return null;
            }

            return (
              <div
                key={category._id}
                className={`text-[16px] items-center ${
                  showAsMegaMenu ? "" : "relative"
                }`}
                ref={(el) =>
                  (dropdownRefs.current[`category-${category._id}`] = {
                    current: el,
                  })
                }
              >
                <div
                  className="text-white center_div gap-x-2 text-nowrap cursor-pointer py-2 px-4 rounded-lg hover:text-yellow-300 transition-all duration-300"
                  onMouseEnter={() => {
                    toggleDropdown("categories", category._id);
                    handleHoverState("category_id", category._id);
                  }}
                >
                  <Link
                    to={`/category/${encodeURIComponent(
                      category.main_category_name
                    )}/${category._id}`}
                    className="center_div gap-x-2 font-bold"
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
                      className="absolute border border-gray-200 bg-white shadow-lg w-[1000px] max-h-[600px] overflow-auto left-[10px] z-50 p-8 top-[55px] rounded-xl"
                      onMouseLeave={closeAllDropdowns}
                    >
                      <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                          {category.main_category_name}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {visibleSubCategories.map((subcat) => (
                            <div
                              key={subcat._id}
                              className="group transition-all duration-300 bg-white hover:bg-gray-50 rounded-lg p-4 border border-transparent hover:border-gray-200"
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
                                    (p) => p.sub_category_details === subcat._id && p.is_visible === true
                                  )
                                  .slice(0, 5)
                                  .map((product, index) => (
                                    <Link
                                      to={`/product/${product.seo_url}`}
                                      key={product._id}
                                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-all duration-200 hover:translate-x-1 group/product"
                                      onClick={closeAllDropdowns}
                                      style={{
                                        transitionDelay: `${index * 50}ms`,
                                      }}
                                    >
                                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 group-hover/product:border-yellow-300 transition-all">
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
                            className="px-6 py-3 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors shadow-md hover:shadow-lg font-medium flex items-center justify-center mx-auto"
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
                      className="absolute border border-gray-200 bg-white shadow-lg min-w-[250px] z-50 py-3 top-[55px] left-0 rounded-xl overflow-hidden"
                      onMouseLeave={closeAllDropdowns}
                    >
                      {visibleSubCategories.map((subcat) => (
                        <div key={subcat._id} className="group">
                          <div
                            onClick={() => {
                              navigation(
                                `/category/${category.main_category_name}/${subcat.sub_category_name}/${category._id}/${subcat._id}`
                              );
                              closeAllDropdowns();
                            }}
                            className="px-4 py-3 hover:bg-gray-50 text-gray-800 cursor-pointer font-medium border-b border-gray-100 flex items-center justify-between transition-colors"
                          >
                            {subcat.sub_category_name}
                          </div>
                          <div className="flex flex-col pl-4">
                            {category.product_details
                              ?.filter(
                                (p) => p.sub_category_details === subcat._id && p.is_visible === true
                              )
                              .slice(0, 3)
                              .map((product) => (
                                <Link
                                  to={`/product/${product.seo_url}`}
                                  key={product._id}
                                  className="px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 hover:text-yellow-500 transition-colors flex items-center group/item"
                                  onClick={closeAllDropdowns}
                                >
                                  <span className="truncate">
                                    {product.name}
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