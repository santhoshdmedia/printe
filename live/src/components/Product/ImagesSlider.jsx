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

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data._id) ?? false);
  }, [user]);

  const imageOnClickHandler = (id) => {
    setImageSelected(imageList[id].path);
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
        const filter = user.wish_list.filter((product) => product !== data._id);
        const form = { wish_list: filter };
        dispatch({
          type: "UPDATE_USER",
          data: { form, type: "custom", message: "Remove from WishList" },
        });
        setIsFav(false);
      } else {
        const form = { wish_list: [...user.wish_list, data._id] };
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
    <div className="sticky top-36">
      <div className="lg:hidden block">{<DividerCards name={data.name} />}</div>
      <div className="flex flex-row-reverse gap-2">
        <div
          className="flex-1 bg-white border lg:h-[650px] !w-[50px] h-[210px] overflow-hidden relative rounded-md z-20"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ height: '700px' }} // Fixed height
        >
          <img
            ref={imgRef}
            src={imageSelected}
            className="w-full h-full object-cover rounded-md"
            alt="product"
          />

        

          <Tooltip
            title={`${isFav ? "Remove From" : "Add To"} Wish List`}
            placement="right"
          >
            <button
              className={`rounded absolute top-3 right-3 text-red-500 hover:scale-110 p-1 transition-all duration-200 delay-300 ease-in-out`}
              onClick={handleAddWishList}
              style={{ zIndex: 40 }}
            >
              {isFav ? (
                <IconHelper.HEART_ICON_FILLED
                  className="!text-[#f9c114]"
                  size={20}
                />
              ) : (
                <IconHelper.HEART_ICON size={20} />
              )}
            </button>
          </Tooltip>
        </div>
        <div className="py-1 flex flex-col gap-y-2 flex-wrap">
          {!_.isEmpty(imageList) &&
            imageList.map((data, index) => (
              <div
                className="flex items-center justify-center bg-white border group size-[100px] overflow-hidden rounded-lg cursor-pointer"
                key={index}
                onMouseEnter={() => imageOnClickHandler(index)}
              >
                <img
                  src={data.path}
                  className="!object-cover w-full h-full rounded-lg group-hover:scale-125 transition-all duration-700"
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ImagesSlider;