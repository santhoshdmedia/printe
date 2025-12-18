/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { IconHelper } from "../../helper/IconHelper";
import { Link } from "react-router-dom";
import { get } from "lodash";
import { GST_DISCOUNT_HELPER } from "../../helper/form_validation";
import { useSelector } from "react-redux";

const SearchProductCard = ({ data, className = "", onClick }) => {
  // Early return if product is not visible
  if (data.is_visible === false) {
    return null;
  }

  const { user } = useSelector((state) => state.authSlice);
  
  const { 
    images = [], 
    name, 
    _id, 
    seo_url, 
    MRP_price, 
    product_description_tittle, 
    Point_one,
    product_code,
    variants = [],
    variants_price = [],
    quantity_discount_splitup = []
  } = data;

  // Memoize role-based field mappings
  const roleConfig = useMemo(() => {
    const role = user?.role || 'Customer';
    
    const discountFields = {
      'Dealer': 'Dealer_discount',
      'Corporate': 'Corporate_discount',
      'Customer': 'Customer_discount'
    };
    
    const priceFields = {
      'Dealer': 'Deler_product_price',
      'Corporate': 'corporate_product_price',
      'Customer': 'customer_product_price'
    };
    
    return {
      discountField: discountFields[role] || 'Customer_discount',
      priceField: priceFields[role] || 'customer_product_price',
      role
    };
  }, [user]);

  // Memoize base price calculation
  const basePrice = useMemo(() => {
    const { priceField } = roleConfig;
    
    // Check variants_price array first
    if (variants_price.length > 0) {
      return get(variants_price[0], priceField, "0");
    }
    
    // Fallback to direct price field
    return get(data, priceField, "0");
  }, [data, variants_price, roleConfig]);

  // Memoize discounted price calculation
  const customer_product_price = useMemo(() => {
    try {
      const basePriceNum = Number(basePrice);
      
      if (!quantity_discount_splitup.length) {
        return basePriceNum;
      }

      const firstQuantityTier = quantity_discount_splitup[0];
      const discountValue = get(firstQuantityTier, roleConfig.discountField, 0);
      
      // Use GST_DISCOUNT_HELPER to calculate final price
      return Math.round(GST_DISCOUNT_HELPER(discountValue, basePriceNum, 18));
    } catch (error) {
      console.error('Error calculating price:', error);
      return Number(basePrice) || 0;
    }
  }, [basePrice, quantity_discount_splitup, roleConfig]);

  // Memoize product image extraction
  const productImage = useMemo(() => {
    // 1. Check if there are direct product images
    if (images.length > 0 && images[0]?.url) {
      return images[0].url;
    }

    // 2. Check if there are variants with images
    if (variants.length > 0) {
      const firstVariant = variants[0];

      // Check if variant has direct images
      if (firstVariant.images?.length > 0 && firstVariant.images[0]?.url) {
        return firstVariant.images[0].url;
      }

      // Check if variant has options with images
      if (firstVariant.options?.length > 0) {
        const firstOption = firstVariant.options[0];

        // Check for image_names array in option
        if (firstOption.image_names?.length > 0 && firstOption.image_names[0]?.url) {
          return firstOption.image_names[0].url;
        }

        // Check for images array in option
        if (firstOption.images?.length > 0 && firstOption.images[0]?.url) {
          return firstOption.images[0].url;
        }
      }
    }

    return null;
  }, [images, variants]);

  // Memoize discount calculation
  const discount = useMemo(() => {
    if (!MRP_price || !customer_product_price) return 0;
    
    const mrp = parseFloat(MRP_price);
    const discounted = parseFloat(customer_product_price);
    
    if (mrp <= discounted || mrp === 0) return 0;
    
    return Math.round(((mrp - discounted) / mrp) * 100);
  }, [MRP_price, customer_product_price]);

  // Memoize product URL
  const productUrl = useMemo(() => seo_url || _id, [seo_url, _id]);

  // Memoize product name
  const productName = useMemo(() => name || "Unnamed Product", [name]);

  // Handle image error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
          <span class="text-yellow-600 text-xs font-medium">No Image</span>
        </div>
      `;
    }
  };

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
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <span className="text-yellow-600 text-xs font-medium">No Image</span>
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
              aria-label={`${discount}% off`}
            >
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h3 
            className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-yellow-700 transition-colors line-clamp-2"
            title={productName}
          >
            {productName}
          </h3>

          {/* Short Description */}
          {(product_description_tittle || Point_one) && (
            <p 
              className="text-gray-600 text-xs mt-1 line-clamp-1"
              title={product_description_tittle || Point_one}
            >
              {product_description_tittle || Point_one}
            </p>
          )}

          {/* Price Section */}
          <div className="flex items-center gap-2 mt-2">
            {customer_product_price ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ₹{customer_product_price.toLocaleString('en-IN')}
                </span>
                {MRP_price && parseFloat(MRP_price) > customer_product_price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{parseFloat(MRP_price).toLocaleString('en-IN')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {MRP_price ? `₹${parseFloat(MRP_price).toLocaleString('en-IN')}` : "Price not available"}
              </span>
            )}
          </div>

          {/* Product Code */}
          {product_code && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Code: {product_code}
              </span>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div 
          className="flex-shrink-0 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-300"
          aria-hidden="true"
        >
          <IconHelper.SIDEARROW_ICON className="text-lg" />
        </div>
      </div>
    </Link>
  );
};

export default React.memo(SearchProductCard);