/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Divider, Spin } from "antd";
import _ from "lodash";
import { getCustomHomeSections, getAllBlogs } from "../../helper/api_helper";
import { IconHelper } from "../../helper/IconHelper";
import { Helmet } from "react-helmet-async";
import DynamicHero from "../../components/Home/DynamicHero.jsx";

// ─── Lazy-loaded homepage sections ────────────────────────────────────────
// These previously loaded eagerly with every route in the app (none of them
// are needed for first paint), inflating the main JS bundle. Splitting them
// out lets the browser render the hero/above-the-fold content first while
// the rest streams in behind React.Suspense.
const StepProcess = lazy(() => import("../../components/Home/StepProcess"));
const CarouselBanner = lazy(() => import("../../components/Home/CarouselBanner").then(m => ({ default: m.default })));
const SubCategoryBannerCarousel = lazy(() => import("../../components/Home/CarouselBanner").then(m => ({ default: m.SubCategoryBannerCarousel })));
const SwiperList = lazy(() => import("../../components/Lists/SwiperList"));
const HistoryProducts = lazy(() => import("../Product/HistoryProducts"));
const BrowseAll = lazy(() => import("../../components/Home/BrowseAll"));
const WhyChooseUs = lazy(() => import("../../components/Home/WhyChooseUs"));
const WGDesigns = lazy(() => import("../../config/QuickAccess").then(m => ({ default: m.WGDesigns })));
const CustomerReviews = lazy(() => import("../../components/Home/CustomerReviews"));
const BeforeAfterSlider = lazy(() => import("../../components/Home/BeforeAfter"));
const BlogCarousel = lazy(() => import("../../components/Home/BlogCarousel"));


// changeg
const Home = () => {
    const [loading, setLoading] = useState(true);
    const [sectionData, setSectionData] = useState([]);
    const [blogsData, setBlogsData] = useState([]);
    const userId = useSelector((state) => state.authSlice?.user?._id);
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
    }, [fetchData, userId]);

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

            {/* ── Hero Section: fills viewport below fixed bars ── */}
            {/* Below lg: NavMenu hidden → subtract only fixed header (104px) */}
            {/* lg+: NavMenu visible (~52px) → subtract header (120px) + NavMenu */}
            <div className="w-full h-[calc(100vh-104px)] lg:h-[calc(100vh-120px-52px)]">
                <DynamicHero />
            </div>


            {/* {!user?._id && (
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
            )} */}


            <div className="mx-auto">
                <Suspense fallback={null}>
                    <BrowseAll />
                </Suspense>
            </div>

            <Suspense fallback={null}>
                <WhyChooseUs />
            </Suspense>

            <div className="flex flex-col">
                {sectionData.map((section, index) => (
                    <div key={`${section._id || index}`}>
                        <Suspense fallback={null}>
                            <SwiperList
                                product_type={_.get(section, "product_display", "1")}
                                title={_.get(section, "section_name") || "BEST SELLERS"}
                                data={_.get(section, "productDetails", [])}
                                subtitle={_.get(section, "sub_title") || "Most Loved Products"}
                                type="Product"
                                to={`/see-more/${encodeURIComponent(_.get(section, "section_name", "BEST SELLERS"))}/${_.get(section, "_id", "")}`}
                                productCardType="Simple"
                            />
                        </Suspense>
                    </div>
                ))}
            </div>

            <div className="">
                <Suspense fallback={null}>
                    <BeforeAfterSlider />
                </Suspense>
            </div>

            {/* Customer Reviews Section */}
            <Suspense fallback={null}>
                <CustomerReviews />
            </Suspense>

            {/* ✅ Blog Carousel — shows latest blog posts */}
            <Suspense fallback={null}>
                <BlogCarousel blogs={blogsData} />
            </Suspense>

            <div className="mt-0">
                <Suspense fallback={null}>
                    <WGDesigns />
                </Suspense>
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