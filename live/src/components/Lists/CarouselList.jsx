/* eslint-disable react/prop-types */
import React from "react";
import { Carousel, Divider } from "antd";
import ProductCard from "../Product/ProductCard";
import CategoryCard from "../Category/CategoryCard";
import SimpleProductCard from "../Product/SimpleProductCard";
import _ from "lodash";
import DividerCards from "../cards/DividerCards";

const CategoryList = ({ data = [], title = "", type = "Category", productCardType = "Modern" }) => {
  const list = type === "Category" ? _.sortBy(data, ["position"]) : data;

  return (
    <div>
      <DividerCards name={title} />
      <div className="relative z-0 custom-slider">
        <Carousel infinite={false} dots={false} slidesToShow={type == "Category" ? 7 : 4} slidesToScroll={1} draggable arrows className="">
          {list.map(
            (product, index) =>
              (type === "Product" || product.show) && (
                <div key={index} className="py-10">
                  {type === "Product" ? productCardType === "Modern" ?   <SimpleProductCard data={product} />:  <CategoryCard data={product} />:<ProductCard data={product} />}
                </div>
              )
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default CategoryList;
