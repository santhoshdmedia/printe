/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import DividerCards from "../../components/cards/DividerCards";
import { getAllCategoryProducts, getRelateProducts } from "../../helper/api_helper";
import _ from "lodash";
import { Spin } from "antd";
import SwiperList from "../../components/Lists/SwiperList";

const SimilarProducts = ({ category_id, left }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAllCategoryProducts(category_id);
      const productDetails = _.get(result, "data.data[0].product", []);
      
      // Filter visible products before setting state
      const visibleProducts = productDetails.filter((p) => p.is_visible === true);
      setRelatedProducts(visibleProducts);
    } catch (error) {
      console.error("Error fetching similar products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category_id) {
      fetchData();
    }
  }, [category_id]);

  // Only render if there are visible products
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <Spin spinning={loading}>
      <SwiperList 
        left={left} 
        title={"Similar Products"} 
        to={""} 
        data={relatedProducts} 
        type="Product" 
        productCardType="Simple" 
      />
    </Spin>
  );
};

export default SimilarProducts;