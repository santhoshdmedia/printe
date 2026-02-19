import React, { useEffect, useState } from "react";
import { getsubcat } from "../../helper/api_helper";
import _ from "lodash";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useNavigate } from "react-router-dom";

const BrowseAll = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigate();

  const fetchData = async () => {
    try {
      const result = await getsubcat();
      const subcategories = _.get(result, "data.data", []);
      setData(subcategories);
      console.log(data,"subcat");
      
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterCat=data.filter((cat)=>cat.show==true)
  
  
  return (
    <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-6 md:px-16 bg-white text-black">
      {/* ---------- Heading ---------- */}
      <div className="text-center mb-12 md:mb-16 relative">
          <div className=" lg:block absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-7xl lg:text-9xl font-black text-gray-900">CATEGORIES</div>
          </div>
          <div className="relative z-10">
            <span className="inline-block text-[#f2c41a] text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
              Explore Our Collection
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3 md:mb-4">
              Browse{" "}
              <span className="bg-gradient-to-r from-[#f2c41a] to-yellow-500 bg-clip-text text-transparent">
                Categories
              </span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#f2c41a] to-yellow-500 mx-auto rounded-full"></div>
          </div>
        </div>


      {/* ---------- Swiper ---------- */}
      <Swiper
        loop={true}
        autoplay={{ delay: 2200, disableOnInteraction: false }}
        modules={[Autoplay]}
        spaceBetween={16}
        breakpoints={{
          320: { slidesPerView: 2.5 },
          480: { slidesPerView: 3 },
          640: { slidesPerView: 4 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="w-full !overflow-visible"
      >
        {filterCat.map((category) => (
          <SwiperSlide key={category._id} className="flex justify-center !overflow-visible">
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div
                onClick={() =>
                  navigation(
                    `/category/${category.main_category_details[0].slug}/${_.get(
                      category,
                      "slug"
                    )}`
                  )
                }
                className="relative flex items-center justify-center rounded-full overflow-visible
                w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] 
                group-hover:scale-110 transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
              >
                <img
                  src={category.sub_category_image}
                  alt={category.sub_category_name}
                  className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-100"
                />
              </div>
              <h2 className="text-[12px] sm:text-sm md:text-base font-semibold capitalize mt-2 sm:mt-3 text-black group-hover:text-[#f2c41a] transition-all duration-300">
                {String(category.sub_category_name).toLowerCase()}
              </h2>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ---------- Animations ---------- */}
      <style>
        {`
          @keyframes slide-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes underline {
            0% { width: 0; opacity: 0; }
            100% { width: 100%; opacity: 1; }
          }
          @keyframes fade-in-delay {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .animate-slide-up {
            animation: slide-up 1s ease forwards;
          }
          .animate-underline {
            animation: underline 1.2s ease forwards 0.8s;
          }
          .animate-fade-in-delay {
            animation: fade-in-delay 1.2s ease forwards;
          }
        `}
      </style>
    </section>
  );
};

export default BrowseAll;



