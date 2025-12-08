import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

  // Use SSR data if available, otherwise use Redux
  const productData = window.__INITIAL_STATE__?.product || product;

  // Safe value getter with better error handling
  const getProductValue = useCallback((path, defaultValue = "") => {
    return _.get(productData, path, defaultValue);
  }, [productData]);

  // Get absolute URL for images
  const getAbsoluteImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return `${window.location.origin}${imagePath}`;
    }

    return `${window.location.origin}/${imagePath.replace(/^\//, '')}`;
  }, []);

  // Get product images
  const getProductImages = useCallback(() => {
    const images = productData?.images || [];
    return images.map(img => {
      if (typeof img === 'string') {
        return {
          path: img,
          url: getAbsoluteImageUrl(img),
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

  // Add to history function
  const addTohistoryDb = useCallback(async () => {
    try {
      const userId = _.get(user, "_id", "");
      const productId = _.get(productData, "_id", "");

      if (userId && productId) {
        await addTohistory({ product_id: productId });
      }
    } catch (error) {
      console.error("Failed to add to history:", error);
    }
  }, [user, productData]);

  // Process variant images when product loads
  useEffect(() => {
    if (productData?.variants) {
      const imagesMap = {};

      productData.variants.forEach(variant => {
        variant.options?.forEach(option => {
          if (option.image_names && option.image_names.length > 0) {
            imagesMap[option.value] = option.image_names.map(img => {
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
          }
        });
      });

      setVariantImages(imagesMap);

      const initialVariants = {};
      productData.variants.forEach(variant => {
        if (variant.options?.length > 0) {
          initialVariants[variant.variant_name] = variant.options[0].value;
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [productData, getAbsoluteImageUrl]);

  // Handle variant changes
  const handleVariantChange = useCallback((variants) => {
    setSelectedVariants(variants);
  }, []);

  // Fetch product data only if not provided by SSR
  useEffect(() => {
    if (!window.__INITIAL_STATE__?.product && id) {
      const fetchProductData = async () => {
        try {
          await Promise.all([
            dispatch({ type: "GET_PRODUCT", data: { id } }),
            dispatch({ type: "GET_PRODUCT_REVIEW", data: { id } })
          ]);

          localStorage.removeItem("redirect_url");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
          console.error("Failed to fetch product data:", error);
        }
      };

      fetchProductData();
    }
  }, [id, dispatch]);

  // Add to history when product is loaded
  useEffect(() => {
    if (productData?._id && user?._id) {
      addTohistoryDb();
    }
  }, [productData, user, addTohistoryDb]);

  // Loading state
  if ((isGettingProduct && !window.__INITIAL_STATE__?.product) || !productData) {
    return <ProductPageLoadingSkeleton />;
  }

  const hasVariants = productData.type === "Variable Product" && productData.variants?.length > 0;

  // Product data for breadcrumbs
  const categoryId = getProductValue("category_details._id");
  const mainCategoryName = getProductValue("category_details.slug");
  const subCategoryName = getProductValue("sub_category_details.slug");
  const subCategoryId = getProductValue("sub_category_details._id");
  const productName = getProductValue("name", "Product");

  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      {/* NO HELMET - SSR handles all OG tags */}

      {/* Breadcrumbs */}
      <div className="pt-5 pb-0">
        <Breadcrumbs
          title3={productName}
          title={mainCategoryName}
          titleto={`/category/${mainCategoryName}/`}
          title2={subCategoryName}
          title2to={`/category/${mainCategoryName}/${subCategoryName}`}
        />
      </div>

      <Spin spinning={isUploadingFile} tip="Loading product...">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:py-4 rounded-xl py-2">
            <div className="w-full lg:w-1/2">
              {hasVariants ? (
                <ImagesliderVarient
                  imageList={getProductImages()}
                  data={productData}
                  selectedVariants={selectedVariants}
                  variantImages={variantImages}
                />
              ) : (
                <Imageslider
                  imageList={getProductImages()}
                  data={productData}
                />
              )}
            </div>

            <div className="w-full lg:w-1/2 lg:pl-8">
              {hasVariants ? (
                <ProductDetailVarient
                  data={productData}
                  onVariantChange={handleVariantChange}
                  selectedVariants={selectedVariants}
                />
              ) : (
                <ProductDetails data={productData} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <OverViewDetails data={productData} />
          </div>

          <div className="h-8" />

          <div className="bg-white rounded-xl shadow-sm p-6">
            <SimilarProducts
              left={true}
              category_id={categoryId}
            />
          </div>

          {user?._id && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <HistoryProducts left={true} />
            </div>
          )}

          <div className="h-8" />
        </div>
      </Spin>
    </div>
  );
};

export default Product;