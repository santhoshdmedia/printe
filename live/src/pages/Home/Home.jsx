/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Divider, Spin } from "antd";
import _ from "lodash";
import StepProcess from "../../components/Home/StepProcess";
import CarouselBanner, { SubCategoryBannerCarousel } from "../../components/Home/CarouselBanner";
import { getCustomHomeSections, getAllBlogs } from "../../helper/api_helper";
import { IconHelper } from "../../helper/IconHelper";
import SwiperList from "../../components/Lists/SwiperList";
import HistoryProducts from "../Product/HistoryProducts";
import BrowseAll from "../../components/Home/BrowseAll";
import { WGDesigns } from "../../config/QuickAccess";
import BeforeAfterSlider from "../../components/Home/BeforeAfter";
import BlogCarousel from "../../components/Home/BlogCarousel"; // ✅ new import
import { Helmet } from "react-helmet-async";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [sectionData, setSectionData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const { user } = useSelector((state) => state.authSlice);
  const hasRefreshedRef = useRef(false);
  const navigate = useNavigate();

  // Token-based refresh (runs only once per session)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const refreshFlag = sessionStorage.getItem("hasRefreshed");

    if (token && token.trim() !== "" && !refreshFlag && !hasRefreshedRef.current) {
      sessionStorage.setItem("hasRefreshed", "true");
      hasRefreshedRef.current = true;
      window.location.reload();
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCustomHomeSections();
      setSectionData(_.get(result, "data.data", []));
    } catch (err) {
      console.error("Error fetching home sections:", err);
      setSectionData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const FetchBlogs = async () => {
    try {
      const result = await getAllBlogs();
      setBlogsData(_.get(result, "data.data", []));
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  useEffect(() => {
    fetchData();
    FetchBlogs();
  }, [fetchData, _.get(user, "_id", "")]);

  const getGridCount = useCallback((value) => {
    const bannerCount = _.get(value, "banner_count", 2);
    switch (bannerCount) {
      case 1: return "lg:grid-cols-1";
      case 2: return "lg:grid-cols-2";
      case 3: return "lg:grid-cols-3";
      case 4: return "lg:grid-cols-4";
      default: return "lg:grid-cols-2";
    }
  }, []);

  const handelSignSecure = () => {
    navigate('/login');
  };

  const renderContent = () => (
    <>
      <Helmet>
        <title>Printe – Online Printing Services | Custom Prints & Fast Delivery</title>
        <meta name="description" content="Get high-quality printing services at Printe — custom business cards, flyers, posters, brochures, photo prints and more with easy online ordering and fast delivery across India. Shop professional print services now!" />
        <meta name="keywords" content="online printing services, custom printing, business cards, flyers, posters, brochures, photo prints, print delivery India, digital print services, personalized printing" />
      </Helmet>

      <div className="hidden lg:block">
        <CarouselBanner />
      </div>
      <div className="">
        <SubCategoryBannerCarousel />
      </div>

      {!user?._id && (
        <div className="pt-8 block lg:hidden">
          <h2 className="text-center pb-5 text-2xl font-bold">
            Sign in for the best Experience
          </h2>
          <div className="flex justify-center">
            <button
              onClick={handelSignSecure}
              className="w-full rounded-full bg-[#ffe477] mx-10 p-2 font-semibold capitalize"
            >
              Sign in securely
            </button>
          </div>
        </div>
      )}

      <div className="pb-10 mx-auto">
        <BrowseAll />
      </div>

      <div className="flex flex-col">
        {sectionData.map((section, index) => (
          <div key={`${section._id || index}`}>
            <SwiperList
              product_type={_.get(section, "product_display", "1")}
              title={_.get(section, "section_name", "")}
              data={_.get(section, "productDetails", [])}
              subtitle={_.get(section, "sub_title", "")}
              type="Product"
              to={`/see-more/${encodeURIComponent(_.get(section, "section_name", ""))}/${_.get(section, "_id", "")}`}
              productCardType="Simple"
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <BeforeAfterSlider />
      </div>

      {/* ✅ Blog Carousel — shows latest blog posts */}
      <BlogCarousel blogs={blogsData} />

      <div className="mt-0">
        <WGDesigns />
      </div>
    </>
  );

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="!animate-spin !text-yellow-500" />
      }
      className="lg:!px-20 font-sans"
    >
      {renderContent()}
    </Spin>
  );
};

export default Home;