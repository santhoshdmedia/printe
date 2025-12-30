/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCustomHomeSections } from "../../helper/api_helper";
import GridList from "../../components/Lists/GridList";
import _ from "lodash";
import { Breadcrumb, Spin } from "antd";
import Breadcrumbs from "../../components/cards/Breadcrumbs";

const SectionExplore = () => {
  const { id, section_name } = useParams();
  const [loading, setLoading] = useState(false);
  const [productDetails, setproductDetails] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getCustomHomeSections(id);
      setproductDetails(_.get(result, "data.data.[0]", []));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="px-[5vw] pt-10">
        <Breadcrumbs title={section_name} />
      </div>
      <div className="px-[5vw] pb-10">
        <GridList title={section_name} gridItems="3" subtitle={_.get(productDetails, "sub_title", [])} data={_.get(productDetails, "productDetails", [])} type="Product" productCardType="Simple" />
      </div>
    </Spin>
  );
};

export default SectionExplore;
