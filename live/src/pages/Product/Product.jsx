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

// ─── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_OG_IMAGE =
  "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";
const DOMAIN = "https://printe.in";
const S3_BUCKET = "https://printe.s3.ap-south-1.amazonaws.com";
const DEFAULT_KEYWORDS = "Printe, products, online shopping";
const DEFAULT_DESCRIPTION = "Check out this amazing product on Printe";
const DEFAULT_TITLE = "Printe Product";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Get absolute image URL
 */
const getAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath.replace(/^\//, "")}`;
  return `${window.location.origin}${cleanPath}`;
};

/**
 * Normalize image object
 */
const normaliseImage = (img) => {
  const raw = typeof img === "string" ? img : img?.path || img?.url || "";
  return {
    path: raw,
    url: raw,
    absoluteUrl: getAbsoluteImageUrl(raw),
  };
};

/**
 * Extract clean og:image URL from product object.
 * Strips query strings so WhatsApp / Facebook crawlers resolve correctly.
 */
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

    // Strip query strings — crawlers can reject URLs with params
    const clean = raw.split("?")[0];

    if (clean.startsWith("https://")) return clean;
    if (clean.startsWith("http://"))
      return clean.replace("http://", "https://");

    return `${S3_BUCKET}/${clean.replace(/^\//, "")}`;
  }

  return DEFAULT_OG_IMAGE;
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

  // ── Refs ───────────────────────────────────────────────────────────────
  const hasAddedToHistory = useRef(false);
  const processedProductId = useRef(null);

  // ── Derived data ───────────────────────────────────────────────────────
  const productData = product;

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

  // ── SEO values (with safe defaults) ────────────────────────────────────
  const seoTitle = useMemo(() => {
    if (!productData) return DEFAULT_TITLE;
    return productData?.seo_title || productData?.name || DEFAULT_TITLE;
  }, [productData]);

  const seoDescription = useMemo(() => {
    if (!productData) return DEFAULT_DESCRIPTION;

    const desc =
      productData?.seo_description || DEFAULT_DESCRIPTION;

    if (!desc) return DEFAULT_DESCRIPTION;

    return desc.length > 155 ? desc.substring(0, 152) + "..." : desc;
  }, [productData]);

  const seoKeywords = useMemo(() => {
    if (!productData) return DEFAULT_KEYWORDS;

    const kw = productData?.seo_keywords;
    if (!kw) return DEFAULT_KEYWORDS;

    return Array.isArray(kw) ? kw.join(", ") : String(kw);
  }, [productData]);

  const ogImage = useMemo(() => {
    if (!productData) return DEFAULT_OG_IMAGE;
    return getOgImageUrl(productData);
  }, [productData]);

  const ogUrl = useMemo(() => {
    if (!productData?.seo_url) {
      return typeof window !== "undefined" ? window.location.href : DOMAIN;
    }
    return `${DOMAIN}/product/${productData.seo_url}`;
  }, [productData]);

  const canonicalUrl = useMemo(() => {
    if (!productData?.seo_url) return ogUrl;
    return `${DOMAIN}/product/${productData.seo_url}`;
  }, [productData, ogUrl]);

  const productPrice = useMemo(() => {
    if (!productData) return "0";
    return productData?.customer_product_price || productData?.price || "0";
  }, [productData]);

  const stockStatus = useMemo(() => {
    if (!productData) return "out of stock";
    return productData.stock_count > 0 ? "in stock" : "out of stock";
  }, [productData]);

  // ── Effect 1: Reset state on route change ──────────────────────────────
  useEffect(() => {
    setSelectedVariants({});
    setVariantImages({});
    setIsPageLoading(true);
    hasAddedToHistory.current = false;
    processedProductId.current = null;
    dispatch({ type: "CLEAR_CURRENT_PRODUCT" });
  }, [id, dispatch]);

  // ── Effect 2: Fetch product data ───────────────────────────────────────
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
        if (!cancelled) {
          setTimeout(() => setIsPageLoading(false), 300);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  // ── Effect 3: Process variant images ──────────────────────────────────
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

  // ── Effect 4: Add to browsing history ─────────────────────────────────
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

  // ── Render: not found ──────────────────────────────────────────────────
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

  // ── Render: product page ───────────────────────────────────────────────
  return (
    <div className="lg:px-8 px-4 w-full lg:w-[90%] mx-auto my-0">
      {/* ──── SEO Meta Tags ──── */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags — WhatsApp, Facebook, LinkedIn, Telegram */}
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

        {/* Product-Specific OG Tags */}
        <meta property="product:price:amount" content={productPrice} />
        <meta property="product:price:currency" content="INR" />
        <meta property="product:availability" content={stockStatus} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@printe" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={seoTitle} />

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: productData?.name || DEFAULT_TITLE,
            description: seoDescription,
            image: ogImage,
            brand: {
              "@type": "Brand",
              name: "Printe",
            },
            offers: {
              "@type": "Offer",
              url: ogUrl,
              priceCurrency: "INR",
              price: productPrice,
              availability: `https://schema.org/${
                stockStatus === "in stock"
                  ? "InStock"
                  : "OutOfStock"
              }`,
              seller: {
                "@type": "Organization",
                name: "Printe",
              },
            },
            aggregateRating: productData?.rating && {
              "@type": "AggregateRating",
              ratingValue: productData.rating,
              reviewCount: productData.reviews_count || 0,
            },
          })}
        </script>
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
            <div className="w-full lg:w-1/2 relative z-10">
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
            <div className="w-full lg:w-1/2 lg:pl-8 relative z-0">
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

// Export without memo to allow meta tag updates
export default Product;