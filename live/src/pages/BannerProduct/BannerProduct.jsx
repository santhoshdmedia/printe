/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { getBannerProducts } from "../../helper/api_helper";
import _ from "lodash";
import { Spin } from "antd";
import SwiperList from "../../components/Lists/SwiperList";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import Bannear from "../../components/Lists/SwiperList"

const BannerProduct = () => {
  const [bannerProducts, setBannerProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getBannerProducts(id);
      setBannerProducts(_.get(result, "data.data[0]", []));
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
      <div className="lg:!px-20 py-10 px-4">
        <Breadcrumbs title={_.get(bannerProducts, "banner_name", "")} />

        <SwiperList title={_.get(bannerProducts, "banner_name", "")} to={""} data={_.get(bannerProducts, "product_details", [])} type="Product" productCardType="Simple" />
      </div>
      <Bannear/>
    </Spin>
  );
};

export default BannerProduct;
