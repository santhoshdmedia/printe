import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import GridList from "../../components/Lists/GridList";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { BsSearch, BsXLg } from "react-icons/bs";

const SearchProduct = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSearchingProducts, searchingProducts } = useSelector(
    (state) => state.publicSlice
  );

  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  // Trigger search via Redux whenever URL query param changes
  // mirrors exact Navbar dispatch pattern
  useEffect(() => {
    if (query) {
      const debounceTimer = setTimeout(() => {
        dispatch({
          type: "GET_PRODUCT",
          data: { type: "search_products", search: query },
        });
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, dispatch]);

  // Sync input value when URL param changes (e.g. back/forward nav)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    }
  };

  const clearSearch = () => {
    setInputValue("");
    navigate("/");
  };

  // Sort by price ascending — same logic as SubcategoryProduct
  const sortedProducts = [...searchingProducts].sort((a, b) => {
    const getCustomerPrice = (product) => {
      if (
        product.type === "Variable Product" &&
        product.variants_price?.length > 0
      ) {
        const prices = product.variants_price
          .map((v) => parseFloat(v.customer_product_price) || 0)
          .filter((p) => p > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
      }
      return parseFloat(product.customer_product_price) || 0;
    };
    return getCustomerPrice(a) - getCustomerPrice(b);
  });

  const filteredProducts = sortedProducts.filter(
    (product) => product.is_visible === true
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar Header */}
      {/* <div className="bg-[#f2c41a] py-6 px-4 lg:px-40 shadow-md">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search products..."
              className="w-full px-5 py-3 pr-24 rounded-2xl border-2 border-transparent focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white shadow-lg text-gray-800 placeholder-gray-400 transition-all duration-300 text-base"
              autoFocus
              autoComplete="off"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-14 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <BsXLg className="text-sm" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
            >
              <BsSearch className="text-white text-base" />
            </button>
          </div>
        </form>
      </div> */}

      {/* Breadcrumbs */}
      <div className="lg:px-40 px-4 py-4 w-full bg-white border-b border-gray-100">
        <Breadcrumbs title="Search Results" />
      </div>

      {/* Content */}
      <div className="lg:px-40 px-4 py-8">
        {/* Section Header */}
        <div className="mb-6">
          {query ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Results for{" "}
                <span className="text-[#c9a200]">"{query}"</span>
              </h1>
              {!isSearchingProducts && (
                <p className="text-gray-500 text-sm">
                  {filteredProducts.length > 0
                    ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`
                    : "No products found"}
                </p>
              )}
            </>
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">
              Search Products
            </h1>
          )}
        </div>

        {/* Results */}
        {!query ? (
          <div className="text-center py-20 text-gray-400">
            <BsSearch className="text-5xl mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500">
              Enter a search term above
            </p>
          </div>
        ) : isSearchingProducts ? (
          <CarouselListLoadingSkeleton type="Product" />
        ) : filteredProducts.length > 0 ? (
          <GridList
            gridItems="3"
            data={filteredProducts}
            type="Product"
            productCardType="Simple"
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-300 mb-4">
              <BsSearch className="text-6xl mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              We couldn't find anything matching "{query}". Try different
              keywords.
            </p>
            <button
              onClick={clearSearch}
              className="px-6 py-3 bg-[#f2c41a] text-gray-900 font-semibold rounded-xl hover:bg-[#e6b800] transition-colors duration-200 shadow-md"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProduct;