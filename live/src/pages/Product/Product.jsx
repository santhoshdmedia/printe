import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Spin } from "antd";
import _ from "lodash";

// Components
import Imageslider from "../../components/Product/ImagesSlider";
import ImagesliderVarient from "../../components/Product/ImagesliderVarient";
import ProductDetails from "../../components/Product/ProductDetails";
import ProductDetailVarient from "../../components/Product/ProductDetailVarient";
import ProductPageLoadingSkeleton from "../../components/LoadingSkeletons/ProductPageLoadingSkeleton";
import OverViewDetails from "../../components/Product/OverViewDetails";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import SimilarProducts from "./SimilarProducts";
import HistoryProducts from "./HistoryProducts";

// API
import { addTohistory } from "../../helper/api_helper";

const Product = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { id } = params;

  // Redux state selectors
  const { user } = useSelector((state) => state.authSlice);
  const { product, isGettingProduct, isUploadingFile } = useSelector(
    (state) => state.publicSlice
  );

  // State to track selected variants and variant images
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantImages, setVariantImages] = useState({});

  // Enhanced absolute URL getter with cache busting
  const getAbsoluteImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '';
    
    let absoluteUrl = '';
    
    // Handle different image path formats
    if (imagePath.startsWith('http')) {
      absoluteUrl = imagePath;
    } else if (imagePath.startsWith('/')) {
      absoluteUrl = `${window.location.origin}${imagePath}`;
    } else {
      absoluteUrl = `${window.location.origin}/${imagePath.replace(/^\/+/, '')}`;
    }
    
    // Add cache busting parameter for social media
    const timestamp = new Date().getTime();
    return `${absoluteUrl}${absoluteUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
  }, []);

  // Safe value getter with better error handling
  const getProductValue = useCallback((path, defaultValue = "") => {
    return _.get(product, path, defaultValue);
  }, [product]);

  // Get all product images for OG tags
  const getProductImages = useCallback(() => {
    const images = product?.images || [];
    const processedImages = images.map(img => {
      const imageUrl = typeof img === 'string' ? img : img.path || img.url;
      return {
        path: imageUrl,
        url: getAbsoluteImageUrl(imageUrl)
      };
    }).filter(img => img.url); // Filter out empty URLs

    return processedImages;
  }, [product, getAbsoluteImageUrl]);

  // Get main product image for OG tags with multiple fallbacks
  const getMainProductImage = useCallback(() => {
    const images = getProductImages();
    
    // Try main product images first
    if (images.length > 0) {
      return images[0].url;
    }
    
    // Try variant images
    if (product?.variants?.[0]?.options?.[0]?.image_names?.[0]) {
      const variantImage = product.variants[0].options[0].image_names[0];
      const imageUrl = typeof variantImage === 'string' ? variantImage : variantImage.path || variantImage.url;
      return getAbsoluteImageUrl(imageUrl);
    }
    
    // Try product thumbnail
    const thumbnail = getProductValue("thumbnail");
    if (thumbnail) {
      return getAbsoluteImageUrl(thumbnail);
    }
    
    // Final fallback to default image
    return getAbsoluteImageUrl('/assets/images/default-product.png');
  }, [getProductImages, getAbsoluteImageUrl, product, getProductValue]);

  // Get all available product images for multiple OG tags
  const getAllProductImages = useCallback(() => {
    const mainImages = getProductImages();
    const allImages = [...mainImages];
    
    // Add variant images if available
    if (product?.variants) {
      product.variants.forEach(variant => {
        variant.options?.forEach(option => {
          if (option.image_names && option.image_names.length > 0) {
            option.image_names.forEach(img => {
              const imageUrl = typeof img === 'string' ? img : img.path || img.url;
              allImages.push({
                path: imageUrl,
                url: getAbsoluteImageUrl(imageUrl)
              });
            });
          }
        });
      });
    }
    
    // Remove duplicates and return unique images
    const uniqueImages = allImages.filter((image, index, self) =>
      index === self.findIndex((img) => img.url === image.url)
    );
    
    return uniqueImages.slice(0, 6); // Limit to 6 images for social media
  }, [product, getProductImages, getAbsoluteImageUrl]);

  // Enhanced SEO data with better social media optimization
  const getSEOData = useCallback(() => {
    const productName = getProductValue("name", "Product");
    const productDescription = getProductValue("product_description_tittle", 
      getProductValue("short_description", "Check out this amazing product"));
    const productImage = getMainProductImage();
    const allProductImages = getAllProductImages();
    const currentUrl = window.location.href;
    
    // Clean description for meta tags
    const cleanDescription = productDescription
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 160) // Limit length
      .trim();
    
    // Clean product name
    const cleanProductName = productName.substring(0, 60).trim();
    
    return {
      title: getProductValue("seo_title", `${cleanProductName} | Prine`),
      description: cleanDescription || "Discover this amazing product at Prine",
      image: productImage,
      images: allProductImages.map(img => img.url),
      url: currentUrl,
      keywords: getProductValue("seo_keywords", cleanProductName),
      price: getProductValue("price", "0"),
      availability: getProductValue("stock_count", 0) > 0 ? "in stock" : "out of stock",
      brand: getProductValue("brand_details.name", "Prine"),
      category: getProductValue("category_details.main_category_name", "General")
    };
  }, [getProductValue, getMainProductImage, getAllProductImages]);

  // Add to history function
  const addTohistoryDb = useCallback(async () => {
    try {
      const userId = _.get(user, "_id", "");
      const productId = _.get(product, "_id", "");
      
      if (userId && productId) {
        await addTohistory({ product_id: productId });
      }
    } catch (error) {
      console.error("Failed to add to history:", error);
    }
  }, [user, product]);

  // Process variant images when product loads
  useEffect(() => {
    if (product?.variants) {
      const imagesMap = {};
      
      // Process all variants to build images map
      product.variants.forEach(variant => {
        variant.options?.forEach(option => {
          if (option.image_names && option.image_names.length > 0) {
            // Use variant value as key and store array of images
            imagesMap[option.value] = option.image_names.map(img => ({
              path: typeof img === 'string' ? img : img.path || img.url,
              url: getAbsoluteImageUrl(typeof img === 'string' ? img : img.path || img.url)
            }));
          }
        });
      });
      
      setVariantImages(imagesMap);
      
      // Set initial selected variants
      const initialVariants = {};
      product.variants.forEach(variant => {
        if (variant.options?.length > 0) {
          initialVariants[variant.variant_name] = variant.options[0].value;
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [product, getAbsoluteImageUrl]);

  // Handle variant changes from ProductDetailVarient
  const handleVariantChange = useCallback((variants) => {
    setSelectedVariants(variants);
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        await Promise.all([
          dispatch({ type: "GET_PRODUCT", data: { id } }),
          dispatch({ type: "GET_PRODUCT_REVIEW", data: { id } })
        ]);
        
        // Clean up redirect URL if exists
        localStorage.removeItem("redirect_url");
        
        // Scroll to top on product load
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      }
    };

    fetchProductData();
  }, [id, dispatch]);

  // Add to history when product is loaded
  useEffect(() => {
    if (product?._id && user?._id) {
      addTohistoryDb();
    }
  }, [product, user, addTohistoryDb]);

  // Loading state
  if (isGettingProduct) {
    return <ProductPageLoadingSkeleton />;
  }

  // Product not found state
  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Product not found</div>
      </div>
    );
  }

  // Get SEO data
  const seoData = getSEOData();
  const hasVariants = product.type === "Variable Product" && product.variants?.length > 0;

  // Product data for breadcrumbs
  const categoryId = getProductValue("category_details._id");
  const mainCategoryName = getProductValue("category_details.main_category_name");
  const subCategoryName = getProductValue("sub_category_details.sub_category_name");
  const subCategoryId = getProductValue("sub_category_details._id");
  const productName = getProductValue("name", "Product");

  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      {/* Enhanced SEO Head with Comprehensive Social Media Tags */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        
        {/* Open Graph Meta Tags - Facebook, LinkedIn, Pinterest */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Prine" />
        <meta property="og:locale" content="en_US" />
        
        {/* Multiple OG Image Tags for Better Compatibility */}
        {seoData.images.map((image, index) => (
          <React.Fragment key={index}>
            <meta property="og:image" content={image} />
            {index === 0 && (
              <>
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:alt" content={productName} />
              </>
            )}
          </React.Fragment>
        ))}
        
        {/* Ensure at least one OG image is set */}
        {seoData.images.length === 0 && (
          <>
            <meta property="og:image" content={seoData.image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:alt" content={productName} />
          </>
        )}

        {/* Product Specific OG Tags */}
        <meta property="product:price:amount" content={seoData.price} />
        <meta property="product:price:currency" content="INR" />
        <meta property="product:availability" content={seoData.availability} />
        <meta property="product:category" content={seoData.category} />
        <meta property="product:brand" content={seoData.brand} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        <meta name="twitter:image:alt" content={productName} />
        <meta name="twitter:site" content="@prine" />
        <meta name="twitter:creator" content="@prine" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={seoData.url} />
        
        {/* WhatsApp Specific Tags */}
        <meta property="og:image" content={seoData.image} />
        <meta property="og:image:secure_url" content={seoData.image} />
        
        {/* Structured Data for SEO (Schema.org) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": productName,
            "image": seoData.images.length > 0 ? seoData.images : [seoData.image],
            "description": seoData.description,
            "sku": getProductValue("sku", ""),
            "mpn": getProductValue("sku", ""),
            "brand": {
              "@type": "Brand",
              "name": seoData.brand
            },
            "offers": {
              "@type": "Offer",
              "url": seoData.url,
              "priceCurrency": "INR",
              "price": seoData.price,
              "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              "availability": seoData.availability === "in stock" 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "Prine"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": getProductValue("average_rating", "0"),
              "reviewCount": getProductValue("review_count", "0"),
              "bestRating": "5",
              "worstRating": "1"
            },
            "category": seoData.category
          })}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="pt-5 pb-0">
        <Breadcrumbs
          title3={productName}
          title={mainCategoryName}
          titleto={`/category/${mainCategoryName}/${categoryId}`}
          title2={subCategoryName}
          title2to={`/category/${mainCategoryName}/${subCategoryName}/${categoryId}/${subCategoryId}`}
        />
      </div>

      {/* Main Product Content */}
      <Spin spinning={isUploadingFile} tip="Loading product...">
        <div className="flex flex-col space-y-6">
          {/* Product Overview Section */}
          <div className="flex flex-col lg:flex-row gap-8 lg:py-4 rounded-xl py-2">
            {/* Product Images */}
            <div className="w-full lg:w-1/2">
              {hasVariants ? (
                <ImagesliderVarient
                  imageList={getProductImages()}
                  data={product}
                  selectedVariants={selectedVariants}
                  variantImages={variantImages}
                />
              ) : (
                <Imageslider
                  imageList={getProductImages()} 
                  data={product} 
                />
              )}
            </div>

            {/* Product Details */}
            <div className="w-full lg:w-1/2 lg:pl-8">
              {hasVariants ? (
                <ProductDetailVarient 
                  data={product} 
                  onVariantChange={handleVariantChange}
                  selectedVariants={selectedVariants}
                />
              ) : (
                <ProductDetails data={product} />
              )}
            </div>
          </div>

          {/* Product Overview Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <OverViewDetails data={product} />
          </div>

          {/* Spacing */}
          <div className="h-8" />

          {/* Similar Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <SimilarProducts
              left={true}
              category_id={categoryId}
            />
          </div>

          {/* Recently Viewed Products (for logged-in users) */}
          {user?._id && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <HistoryProducts left={true} />
            </div>
          )}

          {/* Bottom Spacing */}
          <div className="h-8" />
        </div>
      </Spin>
    </div>
  );
};

export default Product;