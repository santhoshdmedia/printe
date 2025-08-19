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
      setRelatedProducts(_.get(result, "data.data[0].product", []));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Spin spinning={loading}>
      <SwiperList left={left} title={"Similar Products"} to={""} data={relatedProducts} type="Product" productCardType="Simple" />
    </Spin>
  );
};

export default SimilarProducts;
