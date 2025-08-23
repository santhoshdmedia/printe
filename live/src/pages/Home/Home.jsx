/* eslint-disable react-hooks/exhaustive-deps */
import StepProcess from "../../components/Home/StepProcess";
import CarouselBanner from "../../components/Home/CarouselBanner";
import { useEffect, useState } from "react";
import { getCustomHomeSections } from "../../helper/api_helper";
import { Divider, Spin } from "antd";
import { IconHelper } from "../../helper/IconHelper";
import _ from "lodash";
import SwiperList from "../../components/Lists/SwiperList";
import HistoryProducts from "../Product/HistoryProducts";
import { useSelector } from "react-redux";
import BrowseAll from "../../components/Home/BrowseAll";
import { useNavigate } from "react-router-dom";
import QuickAccess from "../../config/QuickAccess";
import ThreeDSlider from "../../components/Home/ThreeDSlider";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [sectionData, setSectionData] = useState([]);
  const { user } = useSelector((state) => state.authSlice);

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
        z;
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
          console.log(res);
          return (
            <div key={index}>
              {/* <div className={`grid ${GETGRID_COUNT(res)}  grid-cols-1 gap-y-2 gap-x-2 py-2 lg:py-5`}>
                  {!_.isEmpty(_.get(res, "banner_images", [])) && (
                    <>
                      {_.get(res, "banner_images", []).map((pic, index) => {
                        return <img src={pic.path} key={index} className="w-full !h-full object-fill rounded-xl" />;
                      })}
                    </>
                  )}
                </div> */}

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
        {/* {_.get(user, "_id", "") && (
          <>
            <HistoryProducts />
          </>
        )} */}
        <QuickAccess />
      </div>
    </Spin>
  );
};

export default Home;
