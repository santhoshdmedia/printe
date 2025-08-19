/* eslint-disable react/prop-types */
import React from "react";
import img from "../../assets/Arcylic Reverse Light Boards/IMG-20241203-WA0006.jpg";
import { useNavigate } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
import _ from "lodash";
const SearchProductCard = ({ data }) => {
  const { images = [], name, _id } = data;
  const product_image = images[0].path ?? "";
  const product_name = name ?? "";

  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/product/${_.get(data, "seo_url", "")}`)} className="center_div justify-between cursor-pointer hover:bg-slate-200 px-2 h-[50px] border-b border-slate-100">
      <div className="center_div gap-x-2">
        <img src={product_image} className="size-[20px] rounded-lg" />
        <h1>{product_name}</h1>
      </div>
      <IconHelper.SIDEARROW_ICON />
    </div>
  );
};

export default SearchProductCard;
