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

// ─── Lazy-loaded components ───────────────────────────────────────────────────
const Imageslider = React.lazy(
  () => import("../../components/Product/ImagesSlider"),
);
const AImageSlider = React.lazy(
  () => import("../../components/Product/AImageSlider"),
);
const ImagesliderVarient = React.lazy(
  () => import("../../components/Product/ImagesliderVarient"),
);
const ProductDetails = React.lazy(
  () => import("../../components/Product/ProductDetails"),
);
const AProductDetails = React.lazy(
  () => import("../../components/Product/AProductDetails"),
);
const ProductDetailVarient = React.lazy(
  () => import("../../components/Product/ProductDetailVarient"),
);
const ProductPageLoadingSkeleton = React.lazy(
  () => import("../../components/LoadingSkeletons/ProductPageLoadingSkeleton"),
);
const OverViewDetails = React.lazy(
  () => import("../../components/Product/OverViewDetails"),
);
const Breadcrumbs = React.lazy(
  () => import("../../components/cards/Breadcrumbs"),
);
const SimilarProducts = React.lazy(() => import("./SimilarProducts"));
const HistoryProducts = React.lazy(() => import("./HistoryProducts"));

// ─── API ──────────────────────────────────────────────────────────────────────
import { addTohistory } from "../../helper/api_helper";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_OG_IMAGE =
  "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";
const DOMAIN = "https://printe.in";
const S3_BUCKET = "https://printe.s3.ap-south-1.amazonaws.com";
const DEFAULT_KEYWORDS = "Printe, products, online shopping";
const DEFAULT_DESCRIPTION = "Check out this amazing product on Printe";
const DEFAULT_TITLE = "Printe Product";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely unwrap product from Redux store.
 * Your API returns { data: [ {...productObject} ] }.
 * Depending on how the reducer stores it, `product` could be:
 *   - the plain object   → use as-is
 *   - the array [obj]    → unwrap [0]
 *   - null / undefined   → return null
 */
const unwrapProduct = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
};

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

const getOgImageUrl = (productData) => {
  if (!productData) return DEFAULT_OG_IMAGE;

  const candidates = [
    productData?.seo_img,
    productData?.images?.[0]?.url,
    productData?.images?.[0]?.path,
  ];

  for (const src of candidates) {
    const raw =
      typeof src === "string"
        ? src.trim()
        : src
          ? (src.url || src.path || "").trim()
          : "";

    if (!raw) continue;
    const clean = raw.split("?")[0];
    if (clean.startsWith("https://")) return clean;
    if (clean.startsWith("http://"))
      return clean.replace("http://", "https://");
    return `${S3_BUCKET}/${clean.replace(/^\//, "")}`;
  }

  return DEFAULT_OG_IMAGE;
};

/**
 * Resolve is_acrylic for a product object.
 *
 * Priority order:
 *  1. Backend boolean flag `is_acrylic: true/false`  ← most reliable
 *  2. Name-based heuristic for old products that predate the flag
 */
const resolveIsAcrylic = (productData) => {
  if (!productData) return false;

  // 1. Explicit backend flag — truthy check handles both true and "true"
  const flag = productData.is_acrylic;
  if (flag === true || flag === "true") return true;
  if (flag === false || flag === "false") return false;

  // 2. Name-based fallback
  const name = (productData.name || "").toLowerCase();
  return name.includes("acrylic") || name.includes("wall photo");
};

// ─── Component ────────────────────────────────────────────────────────────────
const Product = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // ── Redux ──────────────────────────────────────────────────────────────────
  const user = useSelector((state) => state.authSlice.user);
  const { product, isGettingProduct, isUploadingFile } = useSelector(
    (state) => state.publicSlice,
  );

  // ── Local state ────────────────────────────────────────────────────────────
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantImages, setVariantImages] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [metaReady, setMetaReady] = useState(false);

  // Acrylic: state is lifted here so both columns stay in sync
  const [acrylicDesignFile, setAcrylicDesignFile] = useState(null); // base64 dataUrl from ImageCropper
  const [acrylicSize, setAcrylicSize] = useState("A4"); // controlled by AProductDetails
  const [acrylicThickness, setAcrylicThickness] = useState("5mm"); // controlled by AProductDetails

  // ── Refs ───────────────────────────────────────────────────────────────────
  const hasAddedToHistory = useRef(false);
  const processedProductId = useRef(null);
  const metaTimerRef = useRef(null);

  // ── Derived / normalised product data ─────────────────────────────────────
  //
  // `unwrapProduct` handles the case where the Redux reducer stores the raw
  // API response array `data: [obj]` directly instead of just `obj`.
  // This is the most common silent bug — Array.is_acrylic is always undefined.
  //
  const productData = useMemo(() => unwrapProduct(product), [product]);

  // Resolved once productData is available; re-evaluates whenever data changes
  const isAcrylicProduct = useMemo(
    () => resolveIsAcrylic(productData),
    [productData],
  );

  const hasVariants = useMemo(
    () =>
      productData?.type === "Variable Product" &&
      Array.isArray(productData?.variants) &&
      productData.variants.length > 0,
    [productData],
  );

  const productId = useMemo(() => productData?._id, [productData]);
  const userId = useMemo(() => user?._id, [user]);

  const productImages = useMemo(
    () => (productData?.images ?? []).map(normaliseImage),
    [productData],
  );

  const getProductValue = useCallback(
    (path, defaultValue = "") => _.get(productData, path, defaultValue),
    [productData],
  );

  const breadcrumbData = useMemo(
    () => ({
      title3: getProductValue("name", "Product"),
      title: getProductValue("category_details.slug"),
      titleto: `/category/${getProductValue("category_details.slug")}/`,
      title2: getProductValue("sub_category_details.slug"),
      title2to: `/category/${getProductValue(
        "category_details.slug",
      )}/${getProductValue("sub_category_details.slug")}`,
    }),
    [getProductValue],
  );

  const categoryId = useMemo(
    () => getProductValue("category_details._id"),
    [getProductValue],
  );

  // ── SEO values ─────────────────────────────────────────────────────────────
  const seoTitle = useMemo(() => {
    if (!productData) return DEFAULT_TITLE;
    return productData.seo_title || productData.name || DEFAULT_TITLE;
  }, [productData]);

  const seoDescription = useMemo(() => {
    if (!productData) return DEFAULT_DESCRIPTION;
    const desc = productData.seo_description || DEFAULT_DESCRIPTION;
    return desc.length > 155 ? `${desc.substring(0, 152)}...` : desc;
  }, [productData]);

  const seoKeywords = useMemo(() => {
    if (!productData) return DEFAULT_KEYWORDS;
    const kw = productData.seo_keywords;
    if (!kw) return DEFAULT_KEYWORDS;
    return Array.isArray(kw) ? kw.join(", ") : String(kw);
  }, [productData]);

  const ogImage = useMemo(
    () => (productData ? getOgImageUrl(productData) : DEFAULT_OG_IMAGE),
    [productData],
  );

  const ogUrl = useMemo(() => {
    if (!productData?.seo_url)
      return typeof window !== "undefined" ? window.location.href : DOMAIN;
    return `${DOMAIN}/product/${productData.seo_url}`;
  }, [productData]);

  const canonicalUrl = useMemo(
    () =>
      productData?.seo_url ? `${DOMAIN}/product/${productData.seo_url}` : ogUrl,
    [productData, ogUrl],
  );

  const productPrice = useMemo(
    () =>
      productData
        ? productData.customer_product_price || productData.price || "0"
        : "0",
    [productData],
  );

  const stockStatus = useMemo(
    () =>
      productData && productData.stock_count > 0 ? "in stock" : "out of stock",
    [productData],
  );

  // ── Effect 1: Reset everything on route / id change ────────────────────────
  useEffect(() => {
    setSelectedVariants({});
    setVariantImages({});
    setIsPageLoading(true);
    setMetaReady(false);
    // Reset acrylic state so a new product starts clean
    setAcrylicDesignFile(null);
    setAcrylicSize("A4");
    setAcrylicThickness("5mm");
    hasAddedToHistory.current = false;
    processedProductId.current = null;
    if (metaTimerRef.current) clearTimeout(metaTimerRef.current);
    dispatch({ type: "CLEAR_CURRENT_PRODUCT" });
  }, [id, dispatch]);

  // ── Effect 2: Fetch product + reviews ─────────────────────────────────────
  useEffect(() => {
    if (!id) return;
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
        if (!cancelled) setTimeout(() => setIsPageLoading(false), 300);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  // ── Effect 3: Delay SEO meta injection by 4 s ─────────────────────────────
  useEffect(() => {
    if (metaTimerRef.current) clearTimeout(metaTimerRef.current);
    metaTimerRef.current = setTimeout(() => setMetaReady(true), 4000);
    return () => clearTimeout(metaTimerRef.current);
  }, [id]);

  // ── Effect 4: Build variant image map once per product ────────────────────
  useEffect(() => {
    if (!productData?.variants || processedProductId.current === productId)
      return;

    const imagesMap = {};
    const initialVariants = {};

    productData.variants.forEach((variant) => {
      variant.options?.forEach((option) => {
        if (option.image_names?.length > 0)
          imagesMap[option.value] = option.image_names.map(normaliseImage);
      });
      if (variant.options?.length > 0)
        initialVariants[variant.variant_name] = variant.options[0].value;
    });

    setVariantImages(imagesMap);
    setSelectedVariants(initialVariants);
    processedProductId.current = productId;
  }, [productData, productId]);

  // ── Effect 5: Record browsing history ─────────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleVariantChange = useCallback(
    (variants) => setSelectedVariants(variants),
    [],
  );

  // Called by AImageSlider when user applies or removes a cropped photo
  const handleAcrylicDesignChange = useCallback((dataUrl) => {
    setAcrylicDesignFile(dataUrl || null);
  }, []);

  // ── Render: loading skeleton ───────────────────────────────────────────────
  if (isPageLoading || (isGettingProduct && !productData)) {
    return (
      <>
        <Helmet>
          <title>Loading... | Printe</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ProductPageLoadingSkeleton />
        </React.Suspense>
      </>
    );
  }

  // ── Render: product not found ──────────────────────────────────────────────
  if (!productData) {
    return (
      <>
        <Helmet>
          <title>Product Not Found | Printe</title>
          <meta
            name="description"
            content="The product you're looking for doesn't exist or has been removed."
          />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
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
      </>
    );
  }

  // ── Render: full product page ──────────────────────────────────────────────
  return (
    <div className="lg:px-8 px-4 w-full lg:w-[70%] mx-auto my-0">
      {/* ── SEO Meta Tags — injected only after 4 s to let the page settle ── */}
      {metaReady && (
        <Helmet>
          {/* Primary */}
          <title>{seoTitle}</title>
          <meta name="description" content={seoDescription} />
          <meta name="keywords" content={seoKeywords} />
          <meta name="robots" content="index, follow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="canonical" href={canonicalUrl} />

          {/* Open Graph */}
          <meta property="og:type" content="product" />
          <meta property="og:site_name" content="Printe" />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDescription} />
          <meta property="og:url" content={ogUrl} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:secure_url" content={ogImage} />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={seoTitle} />

          {/* Product */}
          <meta property="product:price:amount" content={productPrice} />
          <meta property="product:price:currency" content="INR" />
          <meta property="product:availability" content={stockStatus} />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@printe" />
          <meta name="twitter:title" content={seoTitle} />
          <meta name="twitter:description" content={seoDescription} />
          <meta name="twitter:image" content={ogImage} />
          <meta name="twitter:image:alt" content={seoTitle} />

          {/* Schema.org */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: productData.name || DEFAULT_TITLE,
              description: seoDescription,
              image: ogImage,
              brand: { "@type": "Brand", name: "Printe" },
              offers: {
                "@type": "Offer",
                url: ogUrl,
                priceCurrency: "INR",
                price: productPrice,
                availability: `https://schema.org/${
                  stockStatus === "in stock" ? "InStock" : "OutOfStock"
                }`,
                seller: { "@type": "Organization", name: "Printe" },
              },
              ...(productData.rating && {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: productData.rating,
                  reviewCount: productData.reviews_count || 0,
                },
              }),
            })}
          </script>
        </Helmet>
      )}

      {/* Breadcrumbs */}
      <div className="pt-5 pb-0">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Breadcrumbs {...breadcrumbData} />
        </React.Suspense>
      </div>

      <Spin spinning={isUploadingFile} tip="Loading product...">
        <div className="flex flex-col space-y-6">
          {/* ── Images + Details ─────────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-8 lg:py-4 rounded-xl py-2">
            {/* LEFT — image slider */}
            <div className="w-full lg:w-1/2 relative z-10">
              <React.Suspense fallback={<div>Loading images...</div>}>
                {isAcrylicProduct ? (
                  /*
                   * ACRYLIC path
                   * ─────────────────────────────────────────────────────────
                   * AImageSlider shows product images + the live acrylic
                   * preview once a photo is cropped.
                   *
                   * Props flowing DOWN  : selectedSize, selectedThickness
                   *   → keeps the preview badge and AcrylicPreview in sync
                   *     with whatever the user picks in AProductDetails.
                   *
                   * Props flowing UP    : onDesignChange(dataUrl | null)
                   *   → stored in acrylicDesignFile (lifted state here)
                   *   → forwarded to AProductDetails as uploadedDesignFile
                   *   → gates the "Add to Cart" button.
                   */
                  <AImageSlider
                    key={`acrylic-slider-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                    selectedSize={acrylicSize}
                    selectedThickness={acrylicThickness}
                    onDesignChange={handleAcrylicDesignChange}
                  />
                ) : hasVariants ? (
                  <ImagesliderVarient
                    key={`variant-slider-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                    selectedVariants={selectedVariants}
                    variantImages={variantImages}
                  />
                ) : (
                  <Imageslider
                    key={`slider-${productId}-${location.key}`}
                    imageList={productImages}
                    data={productData}
                  />
                )}
              </React.Suspense>
            </div>

            {/* RIGHT — product details / add-to-cart */}
            <div className="w-full lg:w-1/2 lg:pl-8 relative z-0">
              <React.Suspense fallback={<div>Loading details...</div>}>
                {isAcrylicProduct ? (
                  /*
                   * ACRYLIC path
                   * ─────────────────────────────────────────────────────────
                   * AProductDetails owns size/thickness selectors and calls
                   * onSizeChange / onThicknessChange to push them back up so
                   * AImageSlider can update its live preview immediately.
                   *
                   * uploadedDesignFile comes from the cropper in AImageSlider
                   * (via lifted state).  AProductDetails uses it to:
                   *   • show a green "Photo applied" alert
                   *   • unlock the Add-to-Cart button
                   *   • include it in the cart payload
                   */
                  <AProductDetails
                    key={`acrylic-details-${productId}-${location.key}`}
                    data={productData}
                    uploadedDesignFile={acrylicDesignFile}
                    onSizeChange={setAcrylicSize}
                    onThicknessChange={setAcrylicThickness}
                  />
                ) : hasVariants ? (
                  <ProductDetailVarient
                    key={`variant-details-${productId}-${location.key}`}
                    data={productData}
                    onVariantChange={handleVariantChange}
                    selectedVariants={selectedVariants}
                  />
                ) : (
                  <div className="!z-50">
                    <ProductDetails
                      key={`details-${productId}-${location.key}`}
                      data={productData}
                    />
                  </div>
                )}
              </React.Suspense>
            </div>
          </div>

          {/* Overview / description tabs */}
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

          {/* Browsing history — logged-in users only */}
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

export default Product;
