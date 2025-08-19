import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import SwiperList from "../../components/Lists/SwiperList";
import { getHistoryProducts } from "../../helper/api_helper";
import _ from "lodash";

const HistoryExplore = () => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getHistoryProducts();

      setRelatedProducts(_.get(result, "data.data[0].product_details", []));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="px-[5vw] pt-10">
      <Breadcrumbs title={"Recently Visited Products"} />
      <div>
        <SwiperList title="Recently Visited Products" to={""} data={relatedProducts} type="Product" productCardType="Simple" />
      </div>
    </div>
  );
};

export default HistoryExplore;
