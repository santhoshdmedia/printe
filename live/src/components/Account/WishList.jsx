import React, { useEffect } from "react";
import { MdDelete, MdFavorite, MdShoppingCart } from "react-icons/md";
import { Badge, Empty, Tag } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import wishlist from "../../assets/logo/color/wishlist.gif";

const WishList = () => {
  const { user, wish_list } = useSelector((state) => state.authSlice);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.wish_list?.length) return;

    dispatch({
      type: "GET_PRODUCT",
      data: { id_list: user.wish_list, type: "wish_list" },
    });
  }, [user, dispatch]);

  const generateLabel = (label) => {
    switch (label) {
      case "new":
        return <Tag color="green" className="text-xs py-1 px-2">New</Tag>;
      case "popular":
        return <Tag color="purple" className="text-xs py-1 px-2">Popular</Tag>;
      default:
        return null;
    }
  };

  const handleDeleteWishProduct = (productId) => {
    if (!user?.wish_list) return;
    
    const filteredList = user.wish_list.filter(id => id !== productId);
    const form = { wish_list: filteredList };
    
    dispatch({
      type: "UPDATE_USER",
      data: { form, type: "custom", message: "Product removed from wishlist" },
    });

    // Refresh wishlist after delete
    dispatch({
      type: "GET_PRODUCT",
      data: { id_list: filteredList, type: "wish_list" },
    });
  };

  // Safe access to wishlist data
  const wishListData = wish_list?.data || [];
  const isLoading = wish_list?.loading || false;

  return (
    <div className="w-full">
      <style jsx>{`
        .wishlist-item {
          transition: all 0.3s ease;
        }
        
        .wishlist-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .delete-btn {
          transition: all 0.2s ease;
        }
        
        .delete-btn:hover {
          color: #ef4444 !important;
          transform: scale(1.1);
        }
        
        .shop-btn {
          transition: all 0.3s ease;
          background: linear-gradient(45deg, #facc15, #eab308);
        }
        
        .shop-btn:hover {
          background: linear-gradient(45deg, #facc15, #eab308);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
          color: #0c0101 !important;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        
        .browse-products-btn {
          transition: all 0.3s ease;
          background-color: #FFD700;
          color: #000000;
        }
        
        .browse-products-btn:hover {
          background-color: #e6c200;
          color: #0c0101 !important;
        }
      `}</style>
      
      <div className="px-5 md:px-10 py-5 border shadow-md rounded-lg flex flex-col gap-6 bg-white">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-red-50 rounded-full">
            <MdFavorite className="text-red-500 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
            <p className="text-gray-500 text-sm">Your favorite items all in one place</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 h-12 w-12 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ) : wishListData.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <Empty 
              image={
                <div className="flex justify-center">
                  <img 
                    src={wishlist} 
                    alt="Empty wishlist" 
                    className="w-20 h-28 object-contain" 
                  />
                </div>
              }
              description={
                <span className="text-gray-500">Your wishlist is empty</span>
              }
            />
            <Link 
              to="/" 
              className="browse-products-btn mt-5 px-6 py-2 rounded-full transition-colors flex items-center gap-2 font-medium"
            >
              <MdShoppingCart /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {wishListData.map((data, index) => {
              // Safe data access with fallbacks
              const img = data?.images?.[0]?.path || "/placeholder-product.jpg";
              const price = _.get(data, "single_product_price", null) || 
                           _.get(data, "customer_product_price", null);
              const productName = data?.name || "Unnamed Product";
              const productId = data?._id;
              const seoUrl = _.get(data, "seo_url", "");
              const labels = Array.isArray(data?.label) ? data.label : [];

              // Skip rendering if no product ID
              if (!productId) return null;

              return (
                <div 
                  className="wishlist-item border rounded-xl overflow-hidden shadow-sm bg-white animate-fade-in"
                  key={productId}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-32 h-40 md:h-auto bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={img} 
                        alt={productName} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 pr-4">
                          {productName}
                        </h3>
                        <button
                          className="delete-btn p-1 rounded-full hover:bg-gray-100"
                          onClick={() => handleDeleteWishProduct(productId)}
                          aria-label="Remove from wishlist"
                        >
                          <MdDelete className="text-gray-400 hover:text-red-500" size={18} />
                        </button>
                      </div>
                      
                      <div className="mt-auto">
                        {/* Safe label rendering */}
                        <div className="flex items-center gap-2 mb-3">
                          {labels.length > 0 ? (
                            labels.map((label, i) => (
                              <React.Fragment key={i}>
                                {generateLabel(label)}
                              </React.Fragment>
                            ))
                          ) : null}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xl font-bold text-primary">
                            {price ? `Rs. ${price}` : "Price not available"}
                          </span>
                          
                          <Link
                            to={`/product/${seoUrl || productId}`}
                            className="shop-btn text-white text-sm py-2 px-4 rounded-full flex items-center gap-1 font-medium"
                          >
                            <MdShoppingCart size={16} />
                            <span>Shop Now</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishList;