import React, { useEffect, useState } from "react";
import { IconHelper } from "../../helper/IconHelper";
import { Empty, Progress, Rate, Spin } from "antd";
// import { reviewData } from "../../../data";
import ReviewCard from "./ReviewCard";
import TextArea from "antd/es/input/TextArea";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { updateMyReview } from "../../helper/api_helper";
import { SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
const swiperConfig = {
  slidesPerView: {
    default: 1,
    640: 1,
    768: 1,
    1024: 1,
    1440: 1
  },
  spaceBetween: 20,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
    pauseOnMouseEnter: true
  }
};

const RatingAndReviews = () => {
  //config
  const dispatch = useDispatch();

  //redux
  const { productRateAndReview, product, addingRateAndReviewSuccess } = useSelector((state) => state.publicSlice);
  const { user } = useSelector((state) => state.authSlice);
  // const reviewData = ;
  const loadingStatus = productRateAndReview?.loading || false;

  const [dummy, setDummy] = useState(true);

  //state
  const [reviewData, setReviewData] = useState([]);
  const [averageRatingCount, setAverageRatingCount] = useState(0);
  const [fiveStarCount, setFiveStarCount] = useState(0);
  const [fourStarCount, setFourStarCount] = useState(0);
  const [threeStarCount, setThreeStarCount] = useState(0);
  const [twoStarCount, setTwotarCount] = useState(0);
  const [oneStarCount, setOneStarCount] = useState(0);
  const [productRateAndReviewFormData, setProductRateAndReviewFormData] = useState({
    product_id: null,
    review: "",
    rating: 0,
  });
  const [reviewAlreadyTakenStatus, setReviewAlreadyTakenStatus] = useState(false);
  const [review, setReview] = useState([]);
  const [rate, setRate] = useState([]);
  const [id, setId] = useState([]);

  //mount
  useEffect(() => {
    if (productRateAndReview.data.length > 0) setReviewData(productRateAndReview?.data || []);
  }, [productRateAndReview]);

  useEffect(() => {
    if (reviewData.length > 0) {
      setReview(reviewData?.filter((data) => data.review.length > 0) || []);
      setRate(reviewData?.filter((data) => data.rating > 0) || []);
    }
  }, [reviewData]);

  useEffect(() => {
    if (id) {
      setProductRateAndReviewFormData({
        product_id: product._id,
        review: _.get(id, "review", ""),
        rating: _.get(id, "rating", ""),
      });
    }
  }, [id]);

  useEffect(() => {
    const fiveStar = rate.filter((data) => Math.round(data.rating) === 5);
    const fourStar = rate.filter((data) => Math.round(data.rating) === 4);
    const threeStar = rate.filter((data) => Math.round(data.rating) === 3);
    const twoStar = rate.filter((data) => Math.round(data.rating) === 2);
    const oneStar = rate.filter((data) => Math.round(data.rating) === 1);
    setFiveStarCount(fiveStar.length);
    setFourStarCount(fourStar.length);
    setThreeStarCount(threeStar.length);
    setTwotarCount(twoStar.length);
    setOneStarCount(oneStar.length);
    const ratingSum = rate.reduce((totalSum, num) => totalSum + Math.round(num.rating), 0);

    const averageRating = ratingSum === 0 ? 0 : ratingSum / rate.length;
    setAverageRatingCount(parseFloat(averageRating.toFixed(1)));
  }, [rate]);

  useEffect(() => {
    if (product._id) {
      setProductRateAndReviewFormData((prev) => ({
        ...prev,
        product_id: product._id,
      }));
    }
  }, [product]);

  useEffect(() => {
    if (reviewData.length > 0) {
      const index = reviewData.findIndex((data) => data.user_id === user._id);
      setReviewAlreadyTakenStatus(index > -1 ? true : false);
    }
  }, [reviewData]);

  useEffect(() => {
    if (addingRateAndReviewSuccess || dummy) dispatch({ type: "GET_PRODUCT_REVIEW", data: { id: product._id } });
  }, [addingRateAndReviewSuccess, dummy]);

  //function
  const handleOnChangeReview = (e) => {
    const { value } = e.target;
    setProductRateAndReviewFormData((prev) => ({ ...prev, review: value }));
  };

  const handleSubmitProductRateAndReview = async () => {
    if (!_.isEmpty(id)) {
      const result = await updateMyReview(_.get(id, "_id", ""), productRateAndReviewFormData);
      SUCCESS_NOTIFICATION(result);
      setDummy(!dummy);
    } else {
      dispatch({
        type: "ADD_PRODUCT_REVIEW",
        data: productRateAndReviewFormData,
      });
    }
    handleCancel();
  };

  const handleCancel = () => {
    setProductRateAndReviewFormData({
      product_id: product._id,
      review: "",
      rating: 0,
    });
    setId([]);
  };

  const rateData = [
    {
      startNumber: 1,
      percent: (oneStarCount / rate.length) * 100,
      color: "#f80202",
      count: oneStarCount,
    },
    {
      startNumber: 2,
      percent: (twoStarCount / reviewData.length) * 100,
      color: "#f8aa02",
      count: twoStarCount,
    },
    {
      startNumber: 3,
      percent: (threeStarCount / reviewData.length) * 100,
      color: "#008000",
      count: threeStarCount,
    },
    {
      startNumber: 4,
      percent: (fourStarCount / reviewData.length) * 100,
      color: "#008000",
      count: fourStarCount,
    },
    {
      startNumber: 5,
      percent: (fiveStarCount / reviewData.length) * 100,
      color: "#008000",
      count: fiveStarCount,
    },
  ];

  return (
    <Spin spinning={loadingStatus}>
      <div className="flex gap-2  flex-col-reverse">
        <div className={`flex-1 ${review.length >= 5 && "h-[40rem]"} p-2 flex flex-col gap-2`}>
          <h1 className="sub_title">
            Reviews <span className="text-gray-500 !para">{review.length}</span>
          </h1>
          <div className="overflow-auto  pr-2 flex-1 flex flex-col gap-2">
            {_.isEmpty(review) ? (
              <Empty />
            ) : (
              <Swiper
              spaceBetween={swiperConfig.spaceBetween}
              breakpoints={{
                0: { slidesPerView: swiperConfig.slidesPerView.default },
                640: { slidesPerView: swiperConfig.slidesPerView[640] },
                768: { slidesPerView: swiperConfig.slidesPerView[768] },
                1024: { slidesPerView: swiperConfig.slidesPerView[1024] },
                1440: { slidesPerView: swiperConfig.slidesPerView[1440] }
              }}
              modules={[Autoplay, Navigation]}
              autoplay={swiperConfig.autoplay}
            >
              {review.map((review) => (
                <SwiperSlide key={review._id}>
                  <ReviewCard data={review} />
                </SwiperSlide>
              ))}
            </Swiper>
            )}
          </div>
        </div>

        <div className={` w-full bg-tr ${review.length >= 5 && " sticky top-24"}  p-2`}>
          <h1 className="sub_title capitalize">Rating</h1>
          <div className="p-2 flex gap-2 lg:flex-row flex-col">
            <div className="flex-1">
              {rateData.reverse().map((data) => {
                return (
                  <div className="flex gap-3 w-full" key={data.startNumber}>
                    <span className="flex items-center flex-grow gap-1 w-[15%] center_div justify-between">
                      {data.startNumber}
                      <IconHelper.STAR_FULL_ICON className="!text-[#f7db11]" />
                    </span>
                    <Progress percent={data.percent} showInfo={false} strokeColor={"#f7db11"} />
                    <span className="text-gray-500 w-[15%] center_div justify-between">{data.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="flex items-center title gap-1">
                {averageRatingCount} <IconHelper.STAR_FULL_ICON className="!text-[#f7db11]" />
              </span>
              <span className="text-wrap">
                {rate.length} Ratings & {review.length} Reviews
              </span>
            </div>
          </div>
{/* 
          <div className="flex flex-col gap-3  py-5 mt-4   rounded-lg">
            <h5 className="text-sm"> Rate the product</h5>
            <Rate
              allowHalf
              value={productRateAndReviewFormData.rating}
              onChange={(val) =>
                setProductRateAndReviewFormData((prev) => ({
                  ...prev,
                  rating: val,
                }))
              }
            />
            <h5 className="text-sm">Your Review</h5>
            <TextArea placeholder="Write your review" value={productRateAndReviewFormData.review} onChange={handleOnChangeReview} />
            <div className="flex items-center gap-x-2 lg:flex-row flex-col">
              <button type="button" className="button !bg-[#f2c41a] hover:bg-black " onClick={handleSubmitProductRateAndReview}>
                {_.isEmpty(id) ? "Submit" : "Update"} Rate & Review
              </button>

              {!_.isEmpty(id) && (
                <>
                  <button type="button" className="button !bg-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </Spin>
  );
};

export default RatingAndReviews;
