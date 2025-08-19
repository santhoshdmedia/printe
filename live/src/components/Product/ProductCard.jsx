/* eslint-disable react/prop-types */
import { message, Rate, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { FaCartPlus, FaHeart } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";

const ProductCard = ({ data }) => {
  //config
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //redux
  const { user, isAuth } = useSelector((state) => state.authSlice);
  const [isFav, setIsFav] = useState(false);

  // const colorVariants = {
  //   teal: {
  //     bg: "bg-teal-300",
  //     text: "text-teal-700",
  //     button: "bg-teal-600",
  //     border: "border-teal-400",
  //   },
  //   red: {
  //     bg: "bg-red-300",
  //     text: "text-red-700",
  //     button: "bg-red-600",
  //     border: "border-red-400",
  //   },
  //   blue: {
  //     bg: "bg-blue-300",
  //     text: "text-blue-700",
  //     button: "bg-blue-600",
  //     border: "border-blue-400",
  //   },
  //   yellow: {
  //     bg: "bg-yellow-300",
  //     text: "text-yellow-700",
  //     button: "bg-yellow-600",
  //     border: "border-yellow-400",
  //   },
  //   green: {
  //     bg: "bg-green-300",
  //     text: "text-green-700",
  //     button: "bg-green-600",
  //     border: "border-green-400",
  //   },
  //   purple: {
  //     bg: "bg-purple-300",
  //     text: "text-purple-700",
  //     button: "bg-purple-600",
  //     border: "border-purple-400",
  //   },
  //   orange: {
  //     bg: "bg-orange-300",
  //     text: "text-orange-700",
  //     button: "bg-orange-600",
  //     border: "border-orange-400",
  //   },
  //   pink: {
  //     bg: "bg-pink-300",
  //     text: "text-pink-700",
  //     button: "bg-pink-600",
  //     border: "border-pink-400",
  //   },
  //   indigo: {
  //     bg: "bg-indigo-300",
  //     text: "text-indigo-700",
  //     button: "bg-indigo-600",
  //     border: "border-indigo-400",
  //   },
  //   gray: {
  //     bg: "bg-gray-300",
  //     text: "text-gray-700",
  //     button: "bg-gray-600",
  //     border: "border-gray-400",
  //   },
  //   brown: {
  //     bg: "bg-orange-500",
  //     text: "text-orange-900",
  //     button: "bg-orange-700",
  //     border: "border-orange-400",
  //   },
  //   cyan: {
  //     bg: "bg-cyan-300",
  //     text: "text-cyan-700",
  //     button: "bg-cyan-600",
  //     border: "border-cyan-400",
  //   },
  //   lime: {
  //     bg: "bg-lime-300",
  //     text: "text-lime-700",
  //     button: "bg-lime-600",
  //     border: "border-lime-400",
  //   },
  //   amber: {
  //     bg: "bg-amber-300",
  //     text: "text-amber-700",
  //     button: "bg-amber-600",
  //     border: "border-amber-400",
  //   },
  // };
  const price = _.get(data, "variants_price[0].price", "") || _.get(data, "single_product_price", "");

  useEffect(() => {
    setIsFav(user?.wish_list?.includes(data._id) ?? false);
  }, [user]);

  const { bg, text, button, border } = colorVariants[_.get(data, "product_card_color", "").toLowerCase()] || colorVariants.teal;

  const handleAddWishList = () => {
    if (isAuth) {
      const form = { wish_list: [...user.wish_list, data._id] };
      dispatch({
        type: "UPDATE_USER",
        data: { form, type: "custom", message: "Added to WishList" },
      });
      setIsFav(true);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className={`group ${bg} shadow-[#78c5d65b]   h-[320px] gap-4 center_div shadow-lg rounded-lg transition ease-in-out delay-150 duration-300 z-10 relative`}>
      <div className="flex-1 flex flex-col relative justify-end pb-5 gap-y-2 text-center size-full cursor-pointer" onClick={() => navigate(`/product/${data._id}`)}>
        <img src={_.get(data.images, "[0].path", "")} alt="img" className="size-52 absolute !z-20 -top-5 left-12 group-hover:-top-10 object-contain drop-shadow group-hover:scale-105 transition-all duration-700" />
        <div className="flex px-5 items-center">
          <div className="flex flex-1 flex-col items-start gap-2 ">
            <span className={`sub_title  text-left ${text} group-hover:ttle transition-all duration-700 z-10`}>{data.name}</span>
            <Rate allowHalf defaultValue={3.5} className={`${text}`} />
            <span className={`para p-1 rounded !text-base transition ease-in-out delay-150 group-hover:-translate-y-1 group-hover:scale-110 duration-300 text-white border ${border} ${button} z-10 `}>Rs. {price}/per piece</span>
          </div>
          <button className={`border-2 py-1 px-4  ${button} border-transparent rounded text-white capitalize transition ease-in-out delay-150 group-hover:-translate-y-1 group-hover:scale-110 duration-300 group-hover:animate-bounce `} onClick={() => navigate(`/product/${data._id}`)}>
            Shop
          </button>
        </div>
      </div>
      <div
        className={`absolute hidden text-slate-100 group-hover:flex flex-col gap-2 right-2 top-2 z-20 
              opacity-0 translate-y-[-10px] transition-all duration-1000 ease-in-out 
              group-hover:opacity-100 group-hover:translate-y-0 delay-500`}
      >
        <Tooltip title="Wish List" placement="rightBottom">
          <button className={`border rounded-md ${isFav && "!text-red-500 !bg-white"} ${border} ${button} p-2 hover:scale-110 transition-all duration-200 delay-300 ease-in-out`} onClick={handleAddWishList}>
            <FaHeart size={18} />
          </button>
        </Tooltip>
        {/* <Tooltip
          title='Add cart'
          placement='rightBottom'
        >
          <button
            className={`border rounded-md ${border} ${button} p-2 hover:scale-110 transition-all duration-200 delay-300 ease-in `}
          >
            <FaCartPlus size={28} />
          </button>
        </Tooltip> */}
      </div>
    </div>
  );
};

export default ProductCard;
