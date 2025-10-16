import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import _ from "lodash";
import { Link, useNavigate } from "react-router-dom";

// Safe icon component with fallback
const SafeIcon = ({ icon: IconComponent, className, fallback = "→", ...props }) => {
  if (!IconComponent || typeof IconComponent !== 'function') {
    return <span className={className}>{fallback}</span>;
  }
  return <IconComponent className={className} {...props} />;
};

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
            <div
              onMouseEnter={() => {
                toggleDropdown("megaMenu");
              }}
              className="text-white center_div gap-x-2 text-[14px] font-bold hover:text-yellow-300 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 cursor-pointer"
            >
              All categories <SafeIcon icon={IconHelper.DOWNARROW_ICON} />
            </div>

            {/* Mega Menu Content */}
            {activeDropdown.megaMenu && (
              <div
                className="absolute animate-fade-in w-[80vw] max-w-6xl z-50 top-16 left-0 transform -translate-x-1/2 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xl"
                onMouseLeave={closeAllDropdowns}
              >
                <div className="p-8">
                  <div className="grid grid-cols-4 gap-8">
                    {/* Main Categories Column */}
                    <div className="col-span-1 border-r border-gray-200 pr-6">
                      <h3 className="font-bold text-gray-800 text-lg mb-6 pb-3 border-b border-gray-200">
                        All Categories
                      </h3>
                      <div className="space-y-2">
                        {menu.map((category) => (
                          <div
                            key={category._id}
                            onMouseEnter={() =>
                              handleHoverState("side_category_id", category._id)
                            }
                            className={`p-3 rounded-lg cursor-pointer transition-all  duration-200 ${
                              hoverStates.side_category_id === category._id
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800 text-sm">
                                {category.main_category_name}
                              </span>
                              <SafeIcon 
                                icon={IconHelper.RIGHT_ARROW_ICON}
                                className={`text-xs ${
                                  hoverStates.side_category_id === category._id
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                }`} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subcategories Column - Show when a category is hovered */}
                    <div className="col-span-3">
                      {hoverStates.side_category_id ? (
                        (() => {
                          const selectedCategory = menu.find(
                            (cat) => cat._id === hoverStates.side_category_id
                          );
                          const visibleSubcategories = getVisibleSubcategories(selectedCategory);

                          if (!selectedCategory) return null;

                          return (
                            <div className="animate-fade-in">
                              <h3 className="font-bold text-gray-800 text-lg mb-6 pb-3 border-b border-gray-200">
                                {selectedCategory.main_category_name} - Subcategories
                              </h3>
                              
                              {visibleSubcategories.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                  {visibleSubcategories.map((subcat) => (
                                    <div
                                      key={subcat._id}
                                      onMouseEnter={() =>
                                        handleHoverState("sideSubcatId", subcat._id)
                                      }
                                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                                        hoverStates.sideSubcatId === subcat._id
                                          ? "border-yellow-300 bg-yellow-50 shadow-md"
                                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                      }`}
                                    >
                                      {/* Subcategory Image and Name */}
                                      <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                          <img
                                            src={subcat.sub_category_image || "/placeholder-image.jpg"}
                                            alt={subcat.sub_category_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.src = "/placeholder-image.jpg";
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-gray-800 text-sm">
                                            {subcat.sub_category_name}
                                          </h4>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {selectedCategory.product_details?.filter(
                                              p => p.sub_category_details === subcat._id && p.is_visible
                                            ).length || 0} products
                                          </p>
                                        </div>
                                      </div>

                                      {/* Products Preview */}
                                      <div className="space-y-2">
                                        {selectedCategory.product_details
                                          ?.filter(
                                            p => p.sub_category_details === subcat._id && p.is_visible
                                          )
                                          .slice(0, 3)
                                          .map((product) => (
                                            <div
                                              key={product._id}
                                              className="flex items-center gap-3 p-2 rounded-md hover:bg-white transition-colors group"
                                              onClick={() => {
                                                navigation(`/product/${product.seo_url}`);
                                                closeAllDropdowns();
                                              }}
                                            >
                                              <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                <img
                                                  src={_.get(product, "images[0].path", "/placeholder-product.jpg")}
                                                  alt={product.name}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    e.target.src = "/placeholder-product.jpg";
                                                  }}
                                                />
                                              </div>
                                              <span className="text-xs text-gray-700 truncate group-hover:text-yellow-600 transition-colors">
                                                {product.name}
                                              </span>
                                            </div>
                                          ))}
                                      </div>

                                      {/* View All Products Link */}
                                      {selectedCategory.product_details?.filter(
                                        p => p.sub_category_details === subcat._id && p.is_visible
                                      ).length > 3 && (
                                        <div className="mt-3 pt-2 border-t border-gray-100">
                                          <div
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center gap-1"
                                            onClick={() => {
                                              navigation(
                                                `/category/${selectedCategory.main_category_name}/${subcat.sub_category_name}/${selectedCategory._id}/${subcat._id}`
                                              );
                                              closeAllDropdowns();
                                            }}
                                          >
                                            View all products
                                            <SafeIcon icon={IconHelper.RIGHT_ARROW_ICON} className="text-xs" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <p className="text-gray-500">No subcategories available</p>
                                </div>
                              )}

                              {/* View All Category Button */}
                              <div className="mt-8 pt-6 border-t border-gray-200">
                                <button
                                  onClick={() => {
                                    navigation(`/category/${selectedCategory.main_category_name}/${selectedCategory._id}`);
                                    closeAllDropdowns();
                                  }}
                                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center gap-2 mx-auto"
                                >
                                  View All {selectedCategory.main_category_name}
                                  <SafeIcon icon={IconHelper.RIGHT_ARROW_ICON} className="text-sm" />
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        // Default view when no category is hovered
                        <div className="flex flex-col items-center justify-center h-full py-16">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <div className="text-3xl text-gray-400">📁</div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Browse Categories
                          </h3>
                          <p className="text-gray-500 text-center max-w-md">
                            Hover over a category on the left to see available subcategories and products
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Individual Category Dropdowns */}
        {menu
          .filter((cat) => cat.category_active_status)
          .map((category) => {
            const visibleSubCategories = getVisibleSubcategories(category);
            
            // Don't show category if no visible subcategories
            if (visibleSubCategories.length === 0) {
              return null;
            }

            return (
              <div
                key={category._id}
                className="text-[16px] items-center relative"
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
                      <SafeIcon icon={IconHelper.UPARROW_ICON} />
                    ) : (
                      <SafeIcon icon={IconHelper.DOWNARROW_ICON} />
                    )}
                  </Link>
                </div>

                {/* Individual Category Mega Menu */}
                {activeDropdown.categories[category._id] && (
                  <div
                    className="absolute border border-gray-200 bg-white shadow-lg w-[500px] max-h-[600px] overflow-auto left-1/2 transform -translate-x-1/2 z-50 p-8 top-[55px] rounded-xl"
                    onMouseLeave={closeAllDropdowns}
                  >
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {category.main_category_name}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Browse all subcategories and products
                      </p>
                      
                      <div className="grid grid-cols-3 gap-6">
                        {visibleSubCategories.map((subcat) => (
                          <div
                            key={subcat._id}
                            className="group transition-all duration-300 bg-white hover:bg-gray-50 rounded-lg p-4 border border-transparent hover:border-gray-200"
                          >
                            {/* Subcategory Header */}
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
                              className="flex items-center gap-3 mb-3 cursor-pointer"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                <img
                                  src={subcat.sub_category_image || "/placeholder-image.jpg"}
                                  alt={subcat.sub_category_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/placeholder-image.jpg";
                                  }}
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800 group-hover:text-yellow-600 transition-colors text-sm">
                                  {subcat.sub_category_name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {category.product_details?.filter(
                                    p => p.sub_category_details === subcat._id && p.is_visible
                                  ).length || 0} products
                                </p>
                              </div>
                            </div>

                            {/* Product List */}
                            <div className="space-y-2">
                              {category.product_details
                                ?.filter(
                                  (p) => p.sub_category_details === subcat._id && p.is_visible === true
                                )
                                .slice(0, 4)
                                .map((product) => (
                                  <Link
                                    to={`/product/${product.seo_url}`}
                                    key={product._id}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-white transition-all duration-200 group/product"
                                    onClick={closeAllDropdowns}
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 rounded border border-gray-200 overflow-hidden">
                                      <img
                                        src={_.get(
                                          product,
                                          "images[0].path",
                                          "/placeholder-product.jpg"
                                        )}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover/product:scale-105 transition-transform"
                                        onError={(e) => {
                                          e.target.src = "/placeholder-product.jpg";
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 truncate group-hover/product:text-yellow-600 transition-colors flex-1">
                                      {product.name}
                                    </p>
                                  </Link>
                                ))}
                            </div>

                            {/* View All Link */}
                            {category.product_details?.filter(
                              p => p.sub_category_details === subcat._id && p.is_visible
                            ).length > 4 && (
                              <div className="mt-3 pt-2 border-t border-gray-100">
                                <div
                                  onClick={() => {
                                    navigation(
                                      `/category/${category.main_category_name}/${subcat.sub_category_name}/${category._id}/${subcat._id}`
                                    );
                                    closeAllDropdowns();
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center gap-1"
                                >
                                  View all products
                                  <SafeIcon icon={IconHelper.RIGHT_ARROW_ICON} className="text-xs" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* View All Button */}
                      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <button
                          onClick={() => {
                            navigation(`/category/${category.main_category_name}/${category._id}`);
                            closeAllDropdowns();
                          }}
                          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg font-medium flex items-center justify-center mx-auto gap-2"
                        >
                          View All {category.main_category_name}
                          <SafeIcon icon={IconHelper.RIGHT_ARROW_ICON} className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default NavMenu;