/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import ImagesSlider from "../../components/Product/ImagesSlider";
import ProductDetails from "../../components/Product/ProductDetails";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductPageLoadingSkeleton from "../../components/LoadingSkeletons/ProductPageLoadingSkeleton";
import { Spin } from "antd";
import OverViewDetails from "../../components/Product/OverViewDetails";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import _ from "lodash";
import { addTohistory, getRelateProducts } from "../../helper/api_helper";
import SimilarProducts from "./SimilarProducts";
import HistoryProducts from "./HistoryProducts";

const Product = () => {
  //config
  const params = useParams();
  const dispatch = useDispatch();
  const { id } = params;
  const { user } = useSelector((state) => state.authSlice);

  //mount
  useEffect(() => {
    dispatch({ type: "GET_PRODUCT", data: { id } });
    dispatch({ type: "GET_PRODUCT_REVIEW", data: { id } });
    localStorage.removeItem("redirect_url");
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //redux
  const { product, isGettingProduct, isUploadingFile } = useSelector(
    (state) => state.publicSlice
  );

  const addToHistoryDb = async () => {
    try {
      if (_.get(user, "_id", "") && _.get(product, "_id", "")) {
        await addTohistory({ product_id: _.get(product, "_id", "") });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    addToHistoryDb();
  }, [_.get(user, "_id", ""), _.get(product, "_id", "")]);

  return (
    <div className="lg:px-8 px-4 bg-gray-50 min-h-screen">
      <div className="pt-6">
        <Breadcrumbs
          title3={_.get(product, "name", "")}
          title={_.get(product, "category_details.main_category_name", "")}
          titleto={`/category/${_.get(
            product,
            "category_details.main_category_name",
            ""
          )}/${_.get(product, "category_details._id", "")}`}
          title2={_.get(product, "sub_category_details.sub_category_name", "")}
          title2to={`/category/${_.get(
            product,
            "category_details.main_category_name",
            ""
          )}/${_.get(
            product,
            "sub_category_details.sub_category_name",
            ""
          )}/${_.get(product, "category_details._id", "")}/${_.get(
            product,
            "sub_category_details._id",
            ""
          )}`}
        />
      </div>
      <div>
        {isGettingProduct ? (
          <ProductPageLoadingSkeleton />
        ) : (
          <Spin spinning={isUploadingFile}>
            <div className="flex flex-col">
              {/* Main Product Container */}
              <div className="flex w-full flex-col justify-start gap-8 lg:flex-row lg:py-6  rounded-xl shadow-sm p-6 mt-4">
                {/* Image Slider Section - Sticky on desktop */}
                <div className="w-full lg:w-2/5 lg:sticky lg:top-24 self-start">
                  <ImagesSlider imageList={product?.images} data={product} />
                </div>

                {/* Product Details Section */}
                <div className="w-full lg:w-3/5 lg:pl-8">
                  <ProductDetails data={product} />
                </div>
              </div>

              {/* Product Overview Section */}
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                <OverViewDetails data={product} />
              </div>

              {/* Spacer */}
              <div className="h-8"></div>

              {/* Similar Products Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <SimilarProducts
                  left={true}
                  category_id={product?.category_details?._id || ""}
                />
              </div>

              {/* Recently Viewed Section (only for logged-in users) */}
              {user?._id && (
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                  <HistoryProducts left={true} />
                </div>
              )}

              {/* Bottom Spacer */}
              <div className="h-8"></div>
            </div>
          </Spin>
        )}
      </div>
    </div>
  );
};

export default Product;