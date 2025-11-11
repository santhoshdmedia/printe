/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

import { getHistoryProducts } from "../../helper/api_helper";
import _ from "lodash";
import { Spin } from "antd";
import SwiperList from "../../components/Lists/SwiperList";

const HistoryProducts = ({ left }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getHistoryProducts();

      const productDetails = _.get(result, "data.data[0].product_details", []);

      // Filter BEFORE setting state
      const visibleProducts = productDetails.filter((p) => p.is_visible === true);

      setRelatedProducts(visibleProducts);

    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Spin spinning={loading}>
      <SwiperList subtitle={"Products You Recently Viewed"} left={left} title={"Recently Visited"} to={"/recent-Products"} data={relatedProducts} type="Product" productCardType="Simple" />
    </Spin>
  );
};

export default HistoryProducts;
