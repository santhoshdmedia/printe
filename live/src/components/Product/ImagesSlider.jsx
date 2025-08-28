/* eslint-disable react/prop-types */
import { Carousel, Image, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useRef } from "react";
import _ from "lodash";
import { IconHelper } from "../../helper/IconHelper";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DividerCards from "../cards/DividerCards";

const ImagesSlider = ({ imageList, data }) => {
  const initialImage = _.get(imageList, "[0].path", "");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [position, setPosition] = useState({ x: 0, y: 0, showZoom: false });
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const imgRef = useRef(null);
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);
  const [imageSelected, setImageSelected] = useState(initialImage);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data.seo_url) ?? false);
  }, [user]);

  const imageOnClickHandler = (id) => {
    setImageSelected(imageList[id].path);
    setActiveIndex(id);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    setPosition({ x: e.pageX - left, y: e.pageY - top, showZoom: true });
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleMouseLeave = () => {
    setPosition((prev) => ({ ...prev, showZoom: false }));
  };

  const handleAddWishList = () => {
    if (isAuth) {
      if (isFav) {
        const filter = user.wish_list.filter((product) => product !== data.seo_url);
        const form = { wish_list: filter };
        dispatch({
          type: "UPDATE_USER",
          data: { form, type: "custom", message: "Remove from WishList" },
        });
        setIsFav(false);
      } else {
        const form = { wish_list: [...user.wish_list, data.seo_url] };
        dispatch({
          type: "UPDATE_USER",
          data: { form, type: "custom", message: "Added to WishList" },
        });
        setIsFav(true);
      }
    } else {
      navigate("/login");
    }
  };

  const handleMoveToOverView = () => {
    const element = document.getElementById("overview");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="!sticky !top-24 w-full h-full">
      <div className="lg:hidden block">
        <DividerCards name={data.name} />
      </div>
      
      {/* Main Image with Zoom Effect */}
      <div className="">
        <div
          className="w-full bg-white border rounded-xl overflow-hidden relative "
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            ref={imgRef}
            src={imageSelected}
            className="w-full object-cover rounded-xl transition-transform duration-300 hover:scale-105 lg:h-[30vh] xl:h-[40vh] 2xl:h-[70vh] 3xl:h-[60vh] 4xl:h-[50vh]"
            alt="product"
          />
          {/* Wishlist Button */}
          <Tooltip
            title={`${isFav ? "Remove From" : "Add To"} Wish List`}
            placement="left"
          >
            <button
              className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
                isFav ? "text-red-500" : "text-gray-600"
              }`}
              onClick={handleAddWishList}
              style={{ zIndex: 40 }}
            >
              {isFav ? (
                <IconHelper.HEART_ICON_FILLED className="!text-[#f9c114]" size={24} />
              ) : (
                <IconHelper.HEART_ICON size={24} />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-3 overflow-x-auto py-2 px-1">
        {!_.isEmpty(imageList) &&
          imageList.map((data, index) => (
            <div
              className={`flex-shrink-0 bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                activeIndex === index 
                  ? "border-blue-500 shadow-md" 
                  : "border-gray-200 hover:border-gray-400"
              }`}
              key={index}
              onClick={() => imageOnClickHandler(index)}
              style={{ width: '80px', height: '80px' }}
            >
              <img
                src={data.path}
                className="w-full h-full object-cover"
                alt={`Thumbnail ${index + 1}`}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ImagesSlider;