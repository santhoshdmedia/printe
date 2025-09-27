import React, { useEffect, useCallback } from "react";
import ImagesSlider from "../../components/Product/ImagesSlider";
import ProductDetails from "../../components/Product/ProductDetails";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductPageLoadingSkeleton from "../../components/LoadingSkeletons/ProductPageLoadingSkeleton";
import { Spin } from "antd";
import OverViewDetails from "../../components/Product/OverViewDetails";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import _ from "lodash";
import { addTohistory } from "../../helper/api_helper";
import SimilarProducts from "./SimilarProducts";
import HistoryProducts from "./HistoryProducts";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import {
  HeartOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const Product = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { id } = params;
  const { user } = useSelector((state) => state.authSlice);
  const { product, isGettingProduct, isUploadingFile } = useSelector(
    (state) => state.publicSlice
  );

  // Safe value getter
  const getProductValue = useCallback((path, defaultValue = "") => {
    return _.get(product, path, defaultValue);
  }, [product]);

  // Add to history function
  const addToHistoryDb = useCallback(async () => {
    try {
      const userId = _.get(user, "_id", "");
      const productId = _.get(product, "_id", "");
      
      if (userId && productId) {
        await addTohistory({ product_id: productId });
      }
    } catch (error) {
      console.error("Failed to add to history:", error);
    }
  }, [user?._id, product?._id]);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        await Promise.all([
          dispatch({ type: "GET_PRODUCT", data: { id } }),
          dispatch({ type: "GET_PRODUCT_REVIEW", data: { id } })
        ]);
        localStorage.removeItem("redirect_url");
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      }
    };

    if (id) {
      fetchProductData();
      window.scrollTo(0, 0);
    }
  }, [id, dispatch]);

  // Add to history
  useEffect(() => {
    addToHistoryDb();
  }, [addToHistoryDb]);

  if (isGettingProduct) {
    return <ProductPageLoadingSkeleton />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      <Helmet>
        <title>{getProductValue("seo_title", "Product Page")}</title>
        <meta name="description" content={getProductValue("short_description", "")} />
        <meta name="keywords" content={getProductValue("seo_keywords", "")} />
      </Helmet>

      <div className="pt-5 pb-0">
        <Breadcrumbs
          title3={getProductValue("name", "Product")}
          title={getProductValue("category_details.main_category_name", "")}
          titleto={`/category/${getProductValue("category_details.main_category_name", "")}/${getProductValue("category_details._id", "")}`}
          title2={getProductValue("sub_category_details.sub_category_name", "")}
          title2to={`/category/${getProductValue("category_details.main_category_name", "")}/${getProductValue("sub_category_details.sub_category_name", "")}/${getProductValue("category_details._id", "")}/${getProductValue("sub_category_details._id", "")}`}
        />
      </div>

      <Spin spinning={isUploadingFile}>
        <div className="flex flex-col">
          {/* Main Product Container */}
          <div className="flex w-full flex-col justify-start gap-8 lg:flex-row lg:py-2 rounded-xl py-2">
            <div className="w-full lg:w-1/2 self-start">
              <ImagesSlider imageList={product?.images || []} data={product} />
            </div>

            <div className="w-full lg:w-1/2 lg:pl-8">
              <ProductDetails data={product} />
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <OverViewDetails data={product} />
          </div>

          <div className="h-8"></div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <SimilarProducts
              left={true}
              category_id={getProductValue("category_details._id", "")}
            />
          </div>

          {user?._id && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <HistoryProducts left={true} />
            </div>
          )}

          <div className="h-8"></div>
        </div>
      </Spin>
    </div>
  );
};

export default Product;