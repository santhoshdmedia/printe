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
  
  const [isAnyMegaMenuOpen,setIsAnyMegaMenuOpen] =useState(false) 
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
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
    } else {
      setActiveDropdown((prev) => ({
        ...prev,
        megaMenu: false,
        categories: {
          [categoryId]: !prev.categories[categoryId],
        },
      }));
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
      <div className="flex gap-x-4 !h-full justify-center items-center w-full relative">
        {/* All Categories Mega Menu */}
        <div className="w-[200px] center_div  rounded-md !text-white">
          <div ref={(el) => (dropdownRefs.current.megaMenu = { current: el })}>
            <Link
              to="/all-categories"
              onMouseEnter={(e) => {
                e.preventDefault();
                toggleDropdown("megaMenu");
                handleHoverState("side_category_id", "view");
                setIsAnyMegaMenuOpen(true);
              }}
              className="!text-[#fdfdfd] center_div gap-x-2 text-[16px] font-bold hover:text-[#1d1d1d]"
            >
              All categories <IconHelper.DOWNARROW_ICON />
            </Link>

            {/* Mega Menu Content */}
            <div
              className={`absolute ${
                activeDropdown.megaMenu
                  ? "animate-fade-in"
                  : "animate-fade-out hidden"
              } max-h-fit w-full z-50 top-[43px] left-0 skyslate_gradient shadow-xl rounded-lg`}
            >
              <div className="grid grid-cols-5 px-20 py-20 gap-12">
                {menu.map((result) => (
                  <div key={result._id}>
                    <div
                      // onMouseEnter={() => handleHoverState("side_category_id", result._id)}
                      className="center_div justify-between h-[200px] px-4 border-b border-b-white text-[#121621] hover:bg-slate-100/10"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-center align-middle gap-4">
                          <span
                            className="hover:text-[#68686c] cursor-pointer"
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
                            <IconHelper.LEFTARROW_ICON className="!text-sm rotate-45" />
                          ) : (
                            <IconHelper.RIGHT_ARROW_ICON className="!text-sm" />
                          )}
                        </div>
                        <div className="border-4 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#1d1d1d]">
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
                            className="size-44"
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
                        <div className="absolute min-w-[300px] min-h-full bg-transparent top-0 left-full border-l border-l-white">
                          {result.sub_categories_details?.map((subcat) => (
                            <div key={subcat._id} className="skyslate_gradient">
                              <div
                                onMouseEnter={() =>
                                  handleHoverState("sideSubcatId", subcat._id)
                                }
                                className="border-b px-2 border-b-white text-[#1d1d1d] text-sm font-medium !min-w-fit center_div justify-between h-[50px] hover:bg-slate-100/10"
                              >
                                <span
                                  className="hover:text-primary cursor-pointer"
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
                                  <IconHelper.LEFTARROW_ICON className="!text-sm" />
                                ) : (
                                  <IconHelper.RIGHT_ARROW_ICON className="!text-sm" />
                                )}
                              </div>

                              {/* Products Panel */}
                              {hoverStates.sideSubcatId === subcat._id && (
                                <div className="absolute min-w-[300px] bg-transparent !min-h-full top-0 left-full border-l border-l-white">
                                  {result.product_details
                                    ?.filter(
                                      (p) =>
                                        p.sub_category_details === subcat._id
                                    )
                                    .map((product) => (
                                      <div
  key={product._id}
  className="flex items-center justify-between p-2 border-b border-gray-200 hover:bg-gray-50 transition-colors"
>
  <div className="flex items-center gap-3 min-w-0 w-full">
    {/* Image Container - Strictly Fixed Size */}
    <div className="flex-shrink-0 relative w-16 h-16">
      <div className="absolute inset-0 rounded-md overflow-hidden border border-gray-200">
        <img
          src={_.get(product, "images[0].path", "/placeholder-product.jpg")}
          alt={product.name}
          className="w-full h-full object-cover"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            aspectRatio: '1/1'
          }}
          onError={(e) => {
            e.target.src = "/placeholder-product.jpg";
            e.target.onerror = null; // Prevent infinite loop
          }}
        />
      </div>
    </div>
    
    {/* Product Name - Takes remaining space */}
    <span 
      className="text-sm font-medium text-gray-800 truncate hover:text-primary cursor-pointer flex-grow"
      onClick={() => {
        navigation(`/product/${product.seo_url}`);
        closeAllDropdowns();
      }}
    >
      {product.name}
    </span>
  </div>
  
  {/* Arrow Icon */}
  <IconHelper.LEFTARROW_ICON className="text-gray-400 text-sm ml-2" />
</div>
                                    ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                className={`!text-[16px] items-center  ${
                  showAsMegaMenu ? "" : "relative"
                } `}
                ref={(el) =>
                  (dropdownRefs.current[`category-${category._id}`] = {
                    current: el,
                  })
                }
              >
                <div
                  className="!text-white center_div gap-x-2 text-nowrap cursor-pointer"
                  onMouseEnter={() => {
                    toggleDropdown("categories", category._id);
                    handleHoverState("category_id", category._id);
                setIsAnyMegaMenuOpen(true);

                  }}
                >
                  <span className="!center_div gap-x-2">
                    {category.main_category_name}{" "}
                    {activeDropdown.categories[category._id] ? (
                      <IconHelper.UPARROW_ICON />
                    ) : (
                      <IconHelper.DOWNARROW_ICON />
                    )}
                  </span>
                </div>

                {showAsMegaMenu ? (
                  // Mega Menu Version
                  <div
                    className={`absolute ${
                      activeDropdown.categories[category._id]
                        ? "animate-fade-in"
                        : "animate-fade-out hidden"
                    }  border border-slate-100 bg-white w-[1200px] max-h-[600px] overflow-scroll left-[10px] z-50 p-8 top-[44px] rounded-lg`}
                  >
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {subCategories.map((subcat) => (
                          <div
                            key={subcat._id}
                            className="group transition-all duration-300 hover:bg-gray-50 rounded-lg p-4 hover:shadow-md"
                          >
                            {/* Subcategory Title (Animated Underline) */}
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
                              <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">
                                {subcat.sub_category_name}
                              </h3>
                              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                            </div>

                            {/* Product List (Staggered Animation) */}
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
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-all duration-200 hover:translate-x-1"
                                    onClick={closeAllDropdowns}
                                    style={{
                                      transitionDelay: `${index * 50}ms`,
                                    }} // Staggered effect
                                  >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200 group-hover:border-primary transition-all">
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
                                    <p className="text-sm font-medium text-gray-700 truncate hover:text-primary transition-colors">
                                      {product.name}
                                    </p>
                                  </Link>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Optional: View All Button */}
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => {
                            navigation(
                              `/category/${category.main_category_name}`
                            );
                            closeAllDropdowns();
                          }}
                          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
                        >
                          View All {category.main_category_name}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Compact Dropdown Version
                  <div
                    className={`absolute ${
                      activeDropdown.categories[category._id]
                        ? "animate-fade-in"
                        : "animate-fade-out hidden"
                    } border border-slate-100 bg-white min-w-[250px] z-50 py-2 top-[44px] left-0 shadow-lg rounded-md`}
                  >
                    {subCategories.map((subcat) => (
                      <div key={subcat._id}>
                        <div
                          onClick={() => {
                            navigation(
                              `/category/${category.main_category_name}/${subcat.sub_category_name}/${category._id}/${subcat._id}`
                            );
                            closeAllDropdowns();
                          }}
                          className="px-4 py-2 hover:bg-gray-100 text-black cursor-pointer font-medium border-b border-gray-100"
                        >
                          {subcat.sub_category_name}
                        </div>
                        <div className="flex flex-col">
                          {category.product_details
                            ?.filter(
                              (p) => p.sub_category_details === subcat._id
                            )
                            .slice(0, 3)
                            .map((product) => (
                              <Link
                                to={`/product/${product.seo_url}`}
                                key={product._id}
                                className="px-6 py-1.5 text-sm hover:bg-gray-50 text-gray-700 hover:text-primary"
                                onClick={closeAllDropdowns}
                              >
                                {product.name}
                              </Link>
                            ))}
                        </div>
                      </div>
                    ))}
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
