import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import _ from "lodash";
import { Helmet } from "react-helmet-async";

// Lazy load heavy components
const Imageslider = React.lazy(() =>
  import("../../components/Product/ImagesSlider")
);
const ImagesliderVarient = React.lazy(() =>
  import("../../components/Product/ImagesliderVarient")
);
const ProductDetails = React.lazy(() =>
  import("../../components/Product/ProductDetails")
);
const ProductDetailVarient = React.lazy(() =>
  import("../../components/Product/ProductDetailVarient")
);
const ProductPageLoadingSkeleton = React.lazy(() =>
  import("../../components/LoadingSkeletons/ProductPageLoadingSkeleton")
);
const OverViewDetails = React.lazy(() =>
  import("../../components/Product/OverViewDetails")
);
const Breadcrumbs = React.lazy(() =>
  import("../../components/cards/Breadcrumbs")
);
const SimilarProducts = React.lazy(() => import("./SimilarProducts"));
const HistoryProducts = React.lazy(() => import("./HistoryProducts"));

// API
import { addTohistory } from "../../helper/api_helper";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath.replace(/^\//, "")}`;
  return `${window.location.origin}${cleanPath}`;
};

const normaliseImage = (img) => {
  const raw = typeof img === "string" ? img : img?.path || img?.url || "";
  return {
    path: raw,
    url: raw,
    absoluteUrl: getAbsoluteImageUrl(raw),
  };
};

// ─── Component ──────────────────────────────────────────────────────────────

const Product = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // ── Redux ──────────────────────────────────────────────────────────────
  const user = useSelector((state) => state.authSlice.user);
  const { product, isGettingProduct, isUploadingFile } = useSelector(
    (state) => state.publicSlice
  );

  // ── Local state ────────────────────────────────────────────────────────
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);

  // ── Refs (do NOT drive rendering) ─────────────────────────────────────
  const hasAddedToHistory = useRef(false);
  const processedProductId = useRef(null);

  // ── Derived data ───────────────────────────────────────────────────────
  // Prefer SSR data on first load; fall back to Redux.
  const productData = window.__INITIAL_STATE__?.product || product;

  const hasVariants = useMemo(
    () =>
      productData?.type === "Variable Product" &&
      productData?.variants?.length > 0,
    [productData]
  );

  const productId = useMemo(() => productData?._id, [productData]);
  const userId = useMemo(() => user?._id, [user]);

  const productImages = useMemo(
    () => (productData?.images ?? []).map(normaliseImage),
    [productData]
  );

  const getProductValue = useCallback(
    (path, defaultValue = "") => _.get(productData, path, defaultValue),
    [productData]
  );

  const breadcrumbData = useMemo(
    () => ({
      title3: getProductValue("name", "Product"),
      title: getProductValue("category_details.slug"),
      titleto: `/category/${getProductValue("category_details.slug")}/`,
      title2: getProductValue("sub_category_details.slug"),
      title2to: `/category/${getProductValue(
        "category_details.slug"
      )}/${getProductValue("sub_category_details.slug")}`,
    }),
    [getProductValue]
  );

  const categoryId = useMemo(
    () => getProductValue("category_details._id"),
    [getProductValue]
  );

  // ── Effect 1: Reset state whenever the product ID changes ──────────────
  // `id` from useParams() is the single source of truth for "which product".
  // No need to diff location.pathname manually.
  useEffect(() => {
    setSelectedVariants({});
    setVariantImages({});
    setIsPageLoading(true);
    hasAddedToHistory.current = false;
    processedProductId.current = null;

    // Clear stale SSR state so the next product doesn't flash the old one.
    if (window.__INITIAL_STATE__?.product) {
      window.__INITIAL_STATE__.product = null;
    }

    dispatch({ type: "CLEAR_CURRENT_PRODUCT" });
  }, [id, dispatch]);

  // ── Effect 2: Fetch product data whenever ID changes ───────────────────
  useEffect(() => {
    if (!id) return;

    const hasSSRData =
      window.__INITIAL_STATE__?.product?._id === id;

    if (hasSSRData) {
      setIsPageLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch({ type: "GET_PRODUCT", data: { id } }),
          dispatch({ type: "GET_PRODUCT_REVIEW", data: { id } }),
        ]);

        if (!cancelled) {
          localStorage.removeItem("redirect_url");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (err) {
        console.error("Failed to fetch product data:", err);
      } finally {
        if (!cancelled) {
          // Small delay ensures a smooth skeleton → content transition.
          setTimeout(() => setIsPageLoading(false), 300);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  // ── Effect 3: Process variant images once per product ──────────────────
  useEffect(() => {
    if (!productData?.variants || processedProductId.current === productId) {
      return;
    }

    const imagesMap = {};
    const initialVariants = {};

    productData.variants.forEach((variant) => {
      variant.options?.forEach((option) => {
        if (option.image_names?.length > 0) {
          imagesMap[option.value] = option.image_names.map(normaliseImage);
        }
      });

      if (variant.options?.length > 0) {
        initialVariants[variant.variant_name] = variant.options[0].value;
      }
    });

    setVariantImages(imagesMap);
    setSelectedVariants(initialVariants);
    processedProductId.current = productId;
  }, [productData, productId]);

  // ── Effect 4: Add to browsing history once per product + user ──────────
  useEffect(() => {
    if (!productId || !userId || hasAddedToHistory.current) return;

    const record = async () => {
      try {
        await addTohistory({ product_id: productId });
        hasAddedToHistory.current = true;
      } catch (err) {
        console.error("Failed to add to history:", err);
      }
    };

    record();
  }, [productId, userId]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleVariantChange = useCallback((variants) => {
    setSelectedVariants(variants);
  }, []);

  // ── Render: loading ────────────────────────────────────────────────────
  if (isPageLoading || (isGettingProduct && !productData)) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ProductPageLoadingSkeleton />
      </React.Suspense>
    );
  }

  // ── Render: not found ──────────────────────────────────────────────────
  if (!productData) {
    return (
      <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">
            Product Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // ── Render: product page ───────────────────────────────────────────────
  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      <Helmet>
        <title>{productData.seo_title}</title>
        <meta name="description" content={productData.seo_description} />
        <meta name="keywords" content={productData.seo_keywords} />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="pt-5 pb-0">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Breadcrumbs {...breadcrumbData} />
        </React.Suspense>
      </div>

      <Spin spinning={isUploadingFile} tip="Loading product...">
        <div className="flex flex-col space-y-6">
          {/* Images + Details */}
          <div className="flex flex-col lg:flex-row gap-8 lg:py-4 rounded-xl py-2">
            {/* Image slider */}
            <div className="w-full lg:w-1/2">
              <React.Suspense fallback={<div>Loading images...</div>}>
                {hasVariants ? (
                  <ImagesliderVarient
                    key={`variants-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                    selectedVariants={selectedVariants}
                    variantImages={variantImages}
                  />
                ) : (
                  <Imageslider
                    key={`images-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                  />
                )}
              </React.Suspense>
            </div>

            {/* Product details */}
            <div className="w-full lg:w-1/2 lg:pl-8">
              <React.Suspense fallback={<div>Loading details...</div>}>
                {hasVariants ? (
                  <ProductDetailVarient
                    key={`details-variants-${productId}-${location.key}`}
                    data={productData}
                    onVariantChange={handleVariantChange}
                    selectedVariants={selectedVariants}
                  />
                ) : (
                  <ProductDetails
                    key={`details-${productId}-${location.key}`}
                    data={productData}
                  />
                )}
              </React.Suspense>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <React.Suspense fallback={<div>Loading overview...</div>}>
              <OverViewDetails data={productData} />
            </React.Suspense>
          </div>

          <div className="h-8" />

          {/* Similar products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <React.Suspense fallback={<div>Loading similar products...</div>}>
              <SimilarProducts left category_id={categoryId} />
            </React.Suspense>
          </div>

          {/* History — only for logged-in users */}
          {userId && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <React.Suspense fallback={<div>Loading history...</div>}>
                <HistoryProducts left />
              </React.Suspense>
            </div>
          )}

          <div className="h-8" />
        </div>
      </Spin>
    </div>
  );
};

export default React.memo(Product);