import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Spin } from "antd";
import _ from "lodash";

// Components
import ImagesSlider from "../../components/Product/ImagesSlider";
import ImagesliderVarient from "../../components/Product/ImagesliderVarient";
import ProductDetails from "../../components/Product/ProductDetails";
import ProductDetailVariant from "../../components/Product/ProductDetailVarient";
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

  // State to track selected color and its images
  const [selectedColor, setSelectedColor] = useState("");
  const [colorImages, setColorImages] = useState({});

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
      const colorVariant = product.variants.find(v => v.variant_name === "Colour");
      if (colorVariant) {
        const imagesMap = {};
        
        colorVariant.options.forEach(option => {
          if (option.image_names && option.image_names.length > 0) {
            // Convert image URLs to the format expected by ImagesliderVarient
            imagesMap[option.value] = option.image_names.map(img => ({
              path: typeof img === 'string' ? img : img.path || img.url,
              url: typeof img === 'string' ? img : img.url || img.path
            }));
          }
        });
        
        setColorImages(imagesMap);
        
        // Set initial selected color
        const firstColor = colorVariant.options[0]?.value;
        if (firstColor) {
          setSelectedColor(firstColor);
        }
      }
    }
  }, [product]);

  // Handle color change from ProductDetailVariant
  const handleColorChange = useCallback((color) => {
    console.log("Color changed to:", color);
    setSelectedColor(color);
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

  // Product data
  const categoryId = getProductValue("category_details._id");
  const mainCategoryName = getProductValue("category_details.main_category_name");
  const subCategoryName = getProductValue("sub_category_details.sub_category_name");
  const subCategoryId = getProductValue("sub_category_details._id");
  const productName = getProductValue("name", "Product");
  const hasVariants = product.variants?.[0]?.variant_type === "image_variant";

  // Get images for current selected color
  const getCurrentImages = () => {
    if (selectedColor && colorImages[selectedColor]) {
      return colorImages[selectedColor];
    }
    // Fallback to main product images
    return (product.images || []).map(img => ({
      path: typeof img === 'string' ? img : img.path,
      url: typeof img === 'string' ? img : img.url
    }));
  };

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
                  imageList={getCurrentImages()}
                  data={product}
                  selectedColor={selectedColor}
                  colorImages={colorImages}
                />
              ) : (
                <ImagesSlider 
                  imageList={product?.images || []} 
                  data={product} 
                />
              )}
            </div>

            {/* Product Details */}
            <div className="w-full lg:w-1/2 lg:pl-8">
              {hasVariants ? (
                <ProductDetailVariant 
                  data={product} 
                  onColorChange={handleColorChange} // Make sure this prop is passed
                  selectedColor={selectedColor}
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