/* eslint-disable react/prop-types */
import React from "react";
import ProductCard from "../Product/ProductCard";
import CategoryCard from "../Category/CategoryCard";
import SimpleProductCard from "../Product/SimpleProductCard";
import DividerCards from "../cards/DividerCards";
import { Swiper, SwiperSlide } from "swiper/react";

const GridList = ({ data = [], title = "", subtitle = "", type = "Category", productCardType = "Modern", to = "" }) => {
  // const products = data;
   const filteredProducts = data.filter(
        product => product.is_visible === true
      );
 const products=filteredProducts;      
  
  return (
    <div>
      {/* {title && <DividerCards name={title} subtitle={subtitle} to={to} />} */}
      <div className="grid grid-cols-1  md:grid-cols-3  gap-4 lg:px-0 ">
        {products.map((product, index) => (
          <div key={index}>{type === "Product" ? productCardType === "Modern" ? <ProductCard data={product} /> : <SimpleProductCard data={product} /> : <CategoryCard data={product} />}</div>
        ))}
      </div>
    </div>
  );
};

export default GridList;
