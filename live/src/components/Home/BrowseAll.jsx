import React, { useEffect, useState } from "react";
import { getsubcat } from "../../helper/api_helper";
import _ from "lodash";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import { Divider } from "antd";

const BrowseAll = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigate();

  const fetchData = async () => {
    try {
      const result = await getsubcat();
      const subcategories = _.get(result, "data.data", []);
      setData(subcategories);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className=" py-10 relative px-20">
      <div className="w-full flex flex-col">
        <Divider>
          <h1 className="font-bold text-primary text-center text-2xl ">Browse All <span className="text-[#f9c114]"> Categories</span></h1>
        </Divider>
        <span className="text-center -mt-3 pb-5">Discover Everything You Need!</span>
      </div>
      <Swiper
        loop={true}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        // navigation={true}
        modules={[ Autoplay]}
        spaceBetween={10}
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          425: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 4,
          },
          1440: {
            slidesPerView: 4,
          },
        }}
        className="mySwiper"
      >
        {data.map((category) => (
          <SwiperSlide key={category._id} className="flex justify-center">
            <div className="flex items-center justify-center flex-col">
              <div
                className="flex flex-col items-center bg-white shadow-md border-4 border-white cursor-pointer w-[200px] group overflow-hidden h-[200px] rounded-full"
                onClick={() => {
                  navigation(`/category/${category.main_category_details[0].main_category_name}/${_.get(category, "sub_category_name")}/${_.get(category, "select_main_category")}/${_.get(category, "_id")}`);
                }}
              >
                <img src={category.sub_category_image} alt={category.sub_category_name} className="w-full h-full group-hover:scale-125 transition-all duration-700 object-cover rounded-full" />
              </div>
              <h2 className="text-sm font-semibold capitalize w-full py-1 text-primary mt-2 text-center rounded-lg">{String(category.sub_category_name).toLowerCase()}</h2>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BrowseAll;
