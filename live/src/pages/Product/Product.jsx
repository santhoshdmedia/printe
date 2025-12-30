import React, { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import _ from "lodash";

// Lazy load heavy components
const Imageslider = React.lazy(() => import("../../components/Product/ImagesSlider"));
const ImagesliderVarient = React.lazy(() => import("../../components/Product/ImagesliderVarient"));
const ProductDetails = React.lazy(() => import("../../components/Product/ProductDetails"));
const ProductDetailVarient = React.lazy(() => import("../../components/Product/ProductDetailVarient"));
const ProductPageLoadingSkeleton = React.lazy(() => import("../../components/LoadingSkeletons/ProductPageLoadingSkeleton"));
const OverViewDetails = React.lazy(() => import("../../components/Product/OverViewDetails"));
const Breadcrumbs = React.lazy(() => import("../../components/cards/Breadcrumbs"));
const SimilarProducts = React.lazy(() => import("./SimilarProducts"));
const HistoryProducts = React.lazy(() => import("./HistoryProducts"));

import { Helmet } from "react-helmet-async";

// API
import { addTohistory } from "../../helper/api_helper";

const Product = () => {
  const params = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id } = params;

  // Refs for tracking
  const processedProductId = useRef(null);
  const hasAddedToHistory = useRef(false);
  const prevLocation = useRef(location.pathname);

  // Redux state selectors with shallow equality
  const user = useSelector((state) => state.authSlice.user);
  const { product, isGettingProduct, isUploadingFile } = useSelector(
    (state) => state.publicSlice
  );

  // Local state
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Get product data (SSR first, then Redux)
  const productData = window.__INITIAL_STATE__?.product || product;

  // Memoized values
  const hasVariants = useMemo(() => 
    productData?.type === "Variable Product" && productData?.variants?.length > 0,
    [productData]
  );

  const productId = useMemo(() => productData?._id, [productData]);
  const userId = useMemo(() => user?._id, [user]);

  // Reset component state when location changes (product ID changes)
  useEffect(() => {
    const resetComponent = () => {
      setSelectedVariants({});
      setVariantImages({});
      processedProductId.current = null;
      hasAddedToHistory.current = false;
      setIsPageLoading(true);
      
      // Clear SSR state for the new product
      if (window.__INITIAL_STATE__?.product) {
        window.__INITIAL_STATE__.product = null;
      }
      
      // Clear Redux product state if needed
      dispatch({ type: "CLEAR_CURRENT_PRODUCT" });
    };

    // Check if location actually changed (different product)
    if (location.pathname !== prevLocation.current) {
      resetComponent();
      prevLocation.current = location.pathname;
    }
  }, [location.pathname, dispatch]);

  // Get product value safely
  const getProductValue = useCallback((path, defaultValue = "") => {
    return _.get(productData, path, defaultValue);
  }, [productData]);

  // Get absolute image URL
  const getAbsoluteImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) {
      return `${window.location.origin}${imagePath}`;
    }
    
    return `${window.location.origin}/${imagePath.replace(/^\//, '')}`;
  }, []);

  // Get product images - memoized
  const productImages = useMemo(() => {
    if (!productData?.images) return [];
    
    return productData.images.map(img => {
      if (typeof img === 'string') {
        return {
          path: img,
          url: img,
          absoluteUrl: getAbsoluteImageUrl(img)
        };
      }
      return {
        path: img.path || img.url,
        url: img.url || img.path,
        absoluteUrl: getAbsoluteImageUrl(img.path || img.url)
      };
    });
  }, [productData, getAbsoluteImageUrl]);

  // Process variants - runs when product data changes
  useEffect(() => {
    if (!productData?.variants || processedProductId.current === productId) return;

    const imagesMap = {};
    const initialVariants = {};

    productData.variants.forEach(variant => {
      variant.options?.forEach(option => {
        if (option.image_names?.length > 0) {
          imagesMap[option.value] = option.image_names.map(img => ({
            path: typeof img === 'string' ? img : img.path || img.url,
            url: typeof img === 'string' ? img : img.url || img.path,
            absoluteUrl: getAbsoluteImageUrl(typeof img === 'string' ? img : img.path || img.url)
          }));
        }
      });

      if (variant.options?.length > 0) {
        initialVariants[variant.variant_name] = variant.options[0].value;
      }
    });

    setVariantImages(imagesMap);
    setSelectedVariants(initialVariants);
    processedProductId.current = productId;
  }, [productData, productId, getAbsoluteImageUrl]);

  // Add to history - runs only once per product/user
  useEffect(() => {
    const addToHistoryOnce = async () => {
      if (!productId || !userId || hasAddedToHistory.current) return;
      
      try {
        await addTohistory({ product_id: productId });
        hasAddedToHistory.current = true;
      } catch (error) {
        console.error("Failed to add to history:", error);
      }
    };

    addToHistoryOnce();
  }, [productId, userId]);

  // Fetch product data when ID changes
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      try {
        setIsPageLoading(true);
        
        await Promise.all([
          dispatch({ type: "GET_PRODUCT", data: { id } }),
          dispatch({ type: "GET_PRODUCT_REVIEW", data: { id } })
        ]);

        localStorage.removeItem("redirect_url");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      } finally {
        // Small delay to ensure smooth transition
        setTimeout(() => setIsPageLoading(false), 300);
      }
    };

    // Only fetch if we don't have SSR data for this specific product
    const hasSSRDataForCurrentProduct = window.__INITIAL_STATE__?.product && 
                                        window.__INITIAL_STATE__.product._id === id;
    
    if (!hasSSRDataForCurrentProduct) {
      fetchProductData();
    } else {
      setIsPageLoading(false);
    }
  }, [id, dispatch]);

  // Handle variant changes
  const handleVariantChange = useCallback((variants) => {
    setSelectedVariants(variants);
  }, []);

  // Memoized breadcrumb data
  const breadcrumbData = useMemo(() => ({
    title3: getProductValue("name", "Product"),
    title: getProductValue("category_details.slug"),
    titleto: `/category/${getProductValue("category_details.slug")}/`,
    title2: getProductValue("sub_category_details.slug"),
    title2to: `/category/${getProductValue("category_details.slug")}/${getProductValue("sub_category_details.slug")}`
  }), [getProductValue]);

  const categoryId = useMemo(() => getProductValue("category_details._id"), [getProductValue]);

  // Loading state
  if (isPageLoading || (isGettingProduct && !productData)) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ProductPageLoadingSkeleton />
      </React.Suspense>
    );
  }

  // If no product data after loading, show error
  if (!productData) {
    return (
      <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Product Not Found</h2>
          <p className="text-gray-500 mt-2">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      <Helmet>
        <title>{productData.seo_title}</title>
        <meta name="description" content={`${productData.seo_description}`} />
        <meta name="keywords" content={`${productData.seo_keywords}`} />
      </Helmet>
      
      {/* Breadcrumbs */}
      <div className="pt-5 pb-0">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Breadcrumbs {...breadcrumbData} />
        </React.Suspense>
      </div>

      <Spin spinning={isUploadingFile} tip="Loading product...">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:py-4 rounded-xl py-2">
            <div className="w-full lg:w-1/2">
              <React.Suspense fallback={<div>Loading images...</div>}>
                {hasVariants ? (
                  <ImagesliderVarient
                    key={`variants-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                    selectedVariants={selectedVariants}
                    variantImages={variantImages}
                  />
                ) : (
                  <Imageslider
                    key={`images-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                  />
                )}
              </React.Suspense>
            </div>

            <div className="w-full lg:w-1/2 lg:pl-8">
              <React.Suspense fallback={<div>Loading details...</div>}>
                {hasVariants ? (
                  <ProductDetailVarient
                    key={`details-variants-${productId}-${location.key}`}
                    data={productData}
                    onVariantChange={handleVariantChange}
                    selectedVariants={selectedVariants}
                  />
                ) : (
                  <ProductDetails
                    key={`details-${productId}-${location.key}`}
                    data={productData}
                  />
                )}
              </React.Suspense>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <React.Suspense fallback={<div>Loading overview...</div>}>
              <OverViewDetails data={productData} />
            </React.Suspense>
          </div>

          <div className="h-8" />

          <div className="bg-white rounded-xl shadow-sm p-6">
            <React.Suspense fallback={<div>Loading similar products...</div>}>
              <SimilarProducts
                left={true}
                category_id={categoryId}
              />
            </React.Suspense>
          </div>

          {userId && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <React.Suspense fallback={<div>Loading history...</div>}>
                <HistoryProducts left={true} />
              </React.Suspense>
            </div>
          )}

          <div className="h-8" />
        </div>
      </Spin>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Product);