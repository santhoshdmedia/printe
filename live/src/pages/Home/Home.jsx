/* eslint-disable react-hooks/exhaustive-deps */
import StepProcess from "../../components/Home/StepProcess";
import CarouselBanner from "../../components/Home/CarouselBanner";
import { useEffect, useState } from "react";
import { getCustomHomeSections, mergeCart } from "../../helper/api_helper";
import { Divider, Spin } from "antd";
import { IconHelper } from "../../helper/IconHelper";
import _ from "lodash";
import SwiperList from "../../components/Lists/SwiperList";
import HistoryProducts from "../Product/HistoryProducts";
import { useSelector } from "react-redux";
import BrowseAll from "../../components/Home/BrowseAll";
import { useNavigate } from "react-router-dom";
import { WGDesigns } from "../../config/QuickAccess";
import ThreeDSlider from "../../components/Home/ThreeDSlider";
import BeforeAfterSlider from "../../components/Home/BeforeAfter";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [sectionData, setSectionData] = useState([]);
  const { user } = useSelector((state) => state.authSlice);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  const mergeCartItems = async () => {
    const result = await mergeCart();
  };

  // Token-based refresh (runs only once)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const refreshFlag = sessionStorage.getItem("hasRefreshed");
    
    if (token && token !== "" && !refreshFlag && !hasRefreshed) {
      console.log("Token detected - refreshing page once");
      sessionStorage.setItem("hasRefreshed", "true");
      setHasRefreshed(true);
      window.location.reload();
    }
  }, []);

  const fetchData = async () => {
    try {
      const result = await getCustomHomeSections();
      setSectionData(_.get(result, "data.data", []));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [_.get(user, "_id", "")]);

  const GETGRID_COUNT = (value) => {
    switch (_.get(value, "banner_count", 2)) {
      case 1:
        return "lg:grid-cols-1";
      case 2:
        return "lg:grid-cols-2";
      case 3:
        return "lg:grid-cols-3";
      case 4:
        return "lg:grid-cols-4";
      default:
        return "lg:grid-cols-2";
    }
  };

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="!animate-spin !text-yellow-500" />
      }
      className="lg:!px-20 font-sans "
    >
      <CarouselBanner />
      <div className=" pb-10 mx-auto">
        <BrowseAll />
        {/* <StepProcess /> */}
      </div>
      <div className="flex flex-col">
        {sectionData.map((res, index) => {
          return (
            <div key={index}>
              <SwiperList
                product_type={_.get(res, "product_display", "1")}
                title={_.get(res, "section_name", "")}
                data={_.get(res, "productDetails", [])}
                subtitle={_.get(res, "sub_title", "")}
                type="Product"
                to={`/see-more/${_.get(res, "section_name", "")}/${_.get(
                  res,
                  "_id",
                  ""
                )}`}
                productCardType="Simple"
              />
            </div>
          );
        })}
      </div>
      <div className="">
        <BeforeAfterSlider />
      </div>

      <div className="">
        {/* {_.get(user, "_id", "") && (
          <>
            <HistoryProducts />
          </>
        )} */}
        <WGDesigns />
      </div>
    </Spin>
  );
};

export default Home;