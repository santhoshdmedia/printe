/* eslint-disable react/prop-types */
import React from "react";
import { IconHelper } from "../../helper/IconHelper";
import { Link } from "react-router-dom";
import _ from "lodash";

const SearchProductCard = ({ data, className = "", onClick }) => {
  const { images = [], name, _id, seo_url, MRP_price, customer_product_price, product_description_tittle, Point_one } = data;
  
  // Use seo_url if available, otherwise fall back to _id
  const productUrl = seo_url || _id;
  
  const product_name = name || "Unnamed Product";
  
  // Improved image URL extraction logic
  const getProductImage = () => {
    // 1. Check if there are direct product images
    if (images.length > 0 && images[0].url) {
      return images[0].url;
    }
    
    // 2. Check if there are variants with images
    if (data.variants && data.variants.length > 0) {
      const firstVariant = data.variants[0];
      
      // Check if variant has direct images
      if (firstVariant.images && firstVariant.images.length > 0 && firstVariant.images[0].url) {
        return firstVariant.images[0].url;
      }
      
      // Check if variant has options with images
      if (firstVariant.options && firstVariant.options.length > 0) {
        const firstOption = firstVariant.options[0];
        
        // Check for image_names array in option
        if (firstOption.image_names && firstOption.image_names.length > 0 && firstOption.image_names[0].url) {
          return firstOption.image_names[0].url;
        }
        
        // Check for images array in option
        if (firstOption.images && firstOption.images.length > 0 && firstOption.images[0].url) {
          return firstOption.images[0].url;
        }
      }
    }
    
    return "";
  };
  
  const product_image = getProductImage();
  const discount = MRP_price && customer_product_price 
    ? Math.round(((parseFloat(MRP_price) - parseFloat(customer_product_price)) / parseFloat(MRP_price)) * 100)
    : 0;

  return (
    <Link 
      to={`/product/${productUrl}`}
      onClick={onClick}
      className={`block group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 overflow-hidden ${className}`}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Product Image */}
        <div className="flex-shrink-0 relative">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {product_image ? (
              <img 
                src={product_image} 
                alt={product_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                      <span class="text-yellow-600 text-xs font-medium">No Image</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <span className="text-yellow-600 text-xs font-medium">No Image</span>
              </div>
            )}
          </div>
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-yellow-700 transition-colors line-clamp-2">
            {product_name}
          </h3>
          
          {/* Short Description */}
          {(product_description_tittle || Point_one) && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-1">
              {product_description_tittle || Point_one}
            </p>
          )}

          {/* Price Section */}
          <div className="flex items-center gap-2 mt-2">
            {customer_product_price ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ₹{customer_product_price}
                </span>
                {MRP_price && parseFloat(MRP_price) > parseFloat(customer_product_price) && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{MRP_price}
                  </span>
                )}
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {MRP_price ? `₹${MRP_price}` : "Price not available"}
              </span>
            )}
          </div>

          {/* Product Code */}
          {data.product_code && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Code: {data.product_code}
              </span>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-300">
          <IconHelper.SIDEARROW_ICON className="text-lg" />
        </div>
      </div>
    </Link>
  );
};

export default SearchProductCard;