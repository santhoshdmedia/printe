/* eslint-disable react/prop-types */
import { Divider } from "antd";
import React from "react";
import CategoryCardLoadingSkeleton from "./CategoryCardLoadingSkeleton";
import ProductCardLoadingSkeleton from "./ProductCardLoadingSkeleton";
import DividerCards from "../cards/DividerCards";

const CarouselListLoadingSkeleton = ({ title = "", type = "Category", to = "" }) => {
  const list = new Array(type === "Category" ? 7 : 4).fill(0);
  return (
    <>
      {title && <DividerCards name={title} to={to} />}
      <div className="grid grid-cols-4">
        {list.map((_, index) => (
          <div key={index}>{type === "Category" ? <CategoryCardLoadingSkeleton /> : <ProductCardLoadingSkeleton />}</div>
        ))}
      </div>
    </>
  );
};

export default CarouselListLoadingSkeleton;
