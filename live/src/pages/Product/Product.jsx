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

  // Safe value getter with better error handling
  const getProductValue = useCallback((path, defaultValue = "") => {
    return _.get(product, path, defaultValue);
  }, [product]);

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
              url: typeof img === 'string' ? img : img.url || img.path
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
  }, [product]);

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

  // Get main product images
  const getProductImages = useCallback(() => {
    const images = product?.images || [];
    return images.map(img => ({
      path: typeof img === 'string' ? img : img.path,
      url: typeof img === 'string' ? img : img.url
    }));
  }, [product]);

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

  // Product data
  const categoryId = getProductValue("category_details._id");
  const mainCategoryName = getProductValue("category_details.main_category_name");
  const subCategoryName = getProductValue("sub_category_details.sub_category_name");
  const subCategoryId = getProductValue("sub_category_details._id");
  const productName = getProductValue("name", "Product");
  const productImg = getProductValue("images[0].path", "Product");
  const hasVariants = product.type === "Variable Product" && product.variants?.length > 0;
// 
  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      {/* SEO Head */}
      <Helmet>
        <title>{getProductValue("seo_title", `${productName} | Product Page`)}</title>
        <meta 
          name="description" 
          content={getProductValue("short_description", `Learn more about ${productName}`)} 
        />
        <meta 
          name="keywords" 
          content={getProductValue("seo_keywords", productName)} 
        />
        <link rel="icon" type="image/svg+xml" href={`${productImg}`} />
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