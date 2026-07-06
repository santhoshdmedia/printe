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
const DEFAULT_TITLE = "Printe | Product";
const SITE_NAME = "Printe";
const TWITTER_HANDLE = "@printe_in";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely unwrap product from Redux store.
 * API returns { data: [ {...productObject} ] }.
 * Reducer may store the raw array or the unwrapped object.
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

/**
 * Resolve the best OG / structured-data image.
 *
 * Priority:
 *   1. seo_img   — manually set by the merchant, always S3
 *   2. images[0] — first product image
 *   3. DEFAULT   — fallback brand image
 */
const getOgImageUrl = (productData) => {
  if (!productData) return DEFAULT_OG_IMAGE;

  const candidates = [
    productData.seo_img,
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
    const clean = raw.split("?")[0]; // strip query params for clean OG url
    if (clean.startsWith("https://")) return clean;
    if (clean.startsWith("http://"))
      return clean.replace("http://", "https://");
    return `${S3_BUCKET}/${clean.replace(/^\//, "")}`;
  }

  return DEFAULT_OG_IMAGE;
};

/**
 * Build a clean canonical / OG url from seo_url or fall back to window.href.
 */
const buildCanonical = (productData) => {
  if (productData?.seo_url) return `${DOMAIN}/product/${productData.seo_url}`;
  if (typeof window !== "undefined") return window.location.href;
  return DOMAIN;
};

/**
 * Resolve is_acrylic.
 * Priority: explicit backend flag → name-based heuristic.
 */
const resolveIsAcrylic = (productData) => {
  if (!productData) return false;
  const flag = productData.is_acrylic;
  if (flag === true || flag === "true") return true;
  if (flag === false || flag === "false") return false;
  const name = (productData.name || "").toLowerCase();
  return name.includes("acrylic") || name.includes("wall photo");
};

/**
 * Strip HTML tags for meta description use.
 */
const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/**
 * Clamp a string to maxLen chars, appending "..." if truncated.
 */
const clampStr = (str = "", maxLen = 155) => {
  const s = str.trim();
  return s.length > maxLen ? `${s.substring(0, maxLen - 3)}...` : s;
};

// ─── SEO Meta Component ───────────────────────────────────────────────────────
/**
 * Renders all <Helmet> tags for a product page.
 *
 * Extracted into its own component so it can be rendered:
 *   - Immediately with placeholder data while the product loads (noindex)
 *   - Again with full data once productData is available (index, follow)
 *
 * This ensures crawlers always receive a <title> and <meta description>
 * even on first paint, while avoiding the 4-second artificial delay.
 */
const ProductHelmet = ({ productData }) => {
  // ── Derived SEO values ────────────────────────────────────────────────────

  const title = useMemo(() => {
    if (!productData) return `Loading... | ${SITE_NAME}`;
    // seo_title is the best; fall back to name with brand suffix
    const raw = productData.seo_title || productData.name || "";
    const cleaned = raw.trim();
    // If the merchant already appended the brand name, don't double-add it
    if (cleaned.toLowerCase().includes("printe")) return cleaned;
    return cleaned ? `${cleaned} | ${SITE_NAME}` : DEFAULT_TITLE;
  }, [productData]);

  const description = useMemo(() => {
    if (!productData) return DEFAULT_DESCRIPTION;
    // Use seo_description → product_description_tittle → first description tab → points
    const candidates = [
      productData.seo_description,
      productData.product_description_tittle,
      stripHtml(productData.description_tabs?.[0]?.description || ""),
      [
        productData.Point_one,
        productData.Point_two,
        productData.Point_three,
        productData.Point_four,
      ]
        .filter(Boolean)
        .join(". "),
    ];
    for (const c of candidates) {
      const s = (c || "").trim();
      if (s.length >= 20) return clampStr(s, 155);
    }
    return DEFAULT_DESCRIPTION;
  }, [productData]);

  const keywords = useMemo(() => {
    if (!productData) return DEFAULT_KEYWORDS;
    const kw = productData.seo_keywords;
    if (!kw) return DEFAULT_KEYWORDS;
    // seo_keywords is an array of comma-separated strings in the real data
    const flat = Array.isArray(kw) ? kw.join(", ") : String(kw);
    return flat.trim() || DEFAULT_KEYWORDS;
  }, [productData]);

  const ogImage = useMemo(
    () => (productData ? getOgImageUrl(productData) : DEFAULT_OG_IMAGE),
    [productData],
  );

  const canonical = useMemo(
    () => (productData ? buildCanonical(productData) : ""),
    [productData],
  );

  const price = useMemo(() => {
    if (!productData) return "0";
    return String(
      productData.customer_product_price ||
        productData.price ||
        productData.MRP_price ||
        "0",
    );
  }, [productData]);

  const mrpPrice = useMemo(() => {
    if (!productData) return "0";
    return String(productData.MRP_price || price);
  }, [productData, price]);

  const availability = useMemo(() => {
    if (!productData) return "out of stock";
    return (productData.stock_count ?? 0) > 0 ? "in stock" : "out of stock";
  }, [productData]);

  const schemaAvailability = useMemo(
    () =>
      availability === "in stock"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    [availability],
  );

  // Build an array of all product image URLs for ImageObject schema
  const allImageUrls = useMemo(() => {
    if (!productData?.images?.length) return [ogImage];
    return productData.images
      .map((img) => img?.url || img?.path || "")
      .filter(Boolean)
      .map((u) => (u.startsWith("https://") ? u : `${S3_BUCKET}/${u.replace(/^\//, "")}`));
  }, [productData, ogImage]);

  // Breadcrumb list for structured data
  const breadcrumbSchema = useMemo(() => {
    if (!productData) return null;
    const catName = productData.category_details?.main_category_name || "";
    const catSlug = productData.category_details?.slug || "";
    const subName = productData.sub_category_details?.sub_category_name || "";
    const subSlug = productData.sub_category_details?.slug || "";
    const prodName = (productData.name || "").trim();
    const prodUrl = buildCanonical(productData);

    const items = [
      { name: "Home", url: DOMAIN },
      catSlug && { name: catName || catSlug, url: `${DOMAIN}/category/${catSlug}/` },
      subSlug && catSlug && { name: subName || subSlug, url: `${DOMAIN}/category/${catSlug}/${subSlug}` },
      { name: prodName, url: prodUrl },
    ].filter(Boolean);

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }, [productData]);

  // Full Product schema
  const productSchema = useMemo(() => {
    if (!productData) return null;

    const name = (productData.name || "").trim() || DEFAULT_TITLE;
    const sku  = productData.product_code || productData.product_codeS_NO || "";
    const gtin = productData.Vendor_Code || productData.HSNcode_time || "";

    // Build bullet-point description from the "Point_*" fields if available
    const bulletPoints = [
      productData.Point_one,
      productData.Point_two,
      productData.Point_three,
      productData.Point_four,
    ].filter(Boolean);

    const fullDescription =
      bulletPoints.length > 0
        ? bulletPoints.join(". ") + ". " + description
        : description;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name,
      description: fullDescription,
      image: allImageUrls,
      sku: sku || undefined,
      mpn: gtin || undefined,
      brand: {
        "@type": "Brand",
        name: SITE_NAME,
      },
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "INR",
        price,
        priceValidUntil: new Date(
          new Date().getFullYear() + 1,
          11,
          31,
        )
          .toISOString()
          .split("T")[0],
        availability: schemaAvailability,
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
          url: DOMAIN,
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "IN",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "100",
            currency: "INR",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "IN",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            businessDays: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "https://schema.org/Monday",
                "https://schema.org/Tuesday",
                "https://schema.org/Wednesday",
                "https://schema.org/Thursday",
                "https://schema.org/Friday",
              ],
            },
            cutoffTime: "17:00:00+05:30",
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 2,
              maxValue: 5,
              unitCode: "DAY",
            },
          },
        },
      },
    };

    // Aggregate rating — only add if we have real values
    if (productData.rating && parseFloat(productData.rating) > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: String(productData.rating),
        reviewCount: String(productData.reviews_count || 1),
        bestRating: "5",
        worstRating: "1",
      };
    }

    return schema;
  }, [
    productData,
    description,
    allImageUrls,
    canonical,
    price,
    schemaAvailability,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Helmet>
      {/* ── Primary ─────────────────────────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta
        name="robots"
        content={productData ? "index, follow, max-image-preview:large" : "noindex, nofollow"}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* ── Open Graph ──────────────────────────────────────────────────── */}
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* ── Open Graph — Product specifics ──────────────────────────────── */}
      {productData && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content="INR" />
          <meta property="product:availability" content={availability} />
          {productData.product_code && (
            <meta property="product:retailer_item_id" content={productData.product_code} />
          )}
          {mrpPrice !== price && (
            <meta property="product:original_price:amount" content={mrpPrice} />
          )}
          {productData.GST && (
            <meta property="product:condition" content="new" />
          )}
        </>
      )}

      {/* ── Twitter / X Card ────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      {canonical && <meta name="twitter:url" content={canonical} />}

      {/* ── Additional crawl hints ───────────────────────────────────────── */}
      {productData && (
        <>
          <meta name="author" content={SITE_NAME} />
          <meta name="publisher" content={SITE_NAME} />
          <meta name="copyright" content={`© ${new Date().getFullYear()} ${SITE_NAME}`} />
          {/* Tell Google this is the preferred language */}
          <meta httpEquiv="content-language" content="en-IN" />
          {/* Preconnect to S3 for faster image loads */}
          <link rel="preconnect" href="https://printe.s3.ap-south-1.amazonaws.com" />
        </>
      )}

      {/* ── Structured Data: Product ─────────────────────────────────────── */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema, null, 0)}
        </script>
      )}

      {/* ── Structured Data: BreadcrumbList ──────────────────────────────── */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema, null, 0)}
        </script>
      )}

      {/* ── Structured Data: WebPage ─────────────────────────────────────── */}
      {productData && canonical && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": canonical,
            url: canonical,
            name: title,
            description,
            inLanguage: "en-IN",
            isPartOf: {
              "@type": "WebSite",
              "@id": `${DOMAIN}/#website`,
              url: DOMAIN,
              name: SITE_NAME,
            },
            breadcrumb: breadcrumbSchema
              ? { "@id": `${canonical}#breadcrumb` }
              : undefined,
            primaryImageOfPage: {
              "@type": "ImageObject",
              contentUrl: ogImage,
              url: ogImage,
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

// ─── Main Product Component ───────────────────────────────────────────────────
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

  // Acrylic: state is lifted here so both columns stay in sync
  const [acrylicDesignFile, setAcrylicDesignFile] = useState(null);
  const [acrylicSize, setAcrylicSize] = useState("A4");
  const [acrylicThickness, setAcrylicThickness] = useState("5mm");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const hasAddedToHistory = useRef(false);
  const processedProductId = useRef(null);

  // ── Derived / normalised product data ─────────────────────────────────────
  const productData = useMemo(() => unwrapProduct(product), [product]);

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

  // ── Effect 1: Reset everything on route / id change ────────────────────────
  useEffect(() => {
    setSelectedVariants({});
    setVariantImages({});
    setIsPageLoading(true);
    setAcrylicDesignFile(null);
    setAcrylicSize("A4");
    setAcrylicThickness("5mm");
    hasAddedToHistory.current = false;
    processedProductId.current = null;
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
    return () => { cancelled = true; };
  }, [id, dispatch]);

  // ── Effect 3: Build variant image map once per product ────────────────────
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

  // ── Effect 4: Record browsing history ─────────────────────────────────────
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

  const handleAcrylicDesignChange = useCallback((dataUrl) => {
    setAcrylicDesignFile(dataUrl || null);
  }, []);

  // ── Render: loading skeleton ───────────────────────────────────────────────
  if (isPageLoading || (isGettingProduct && !productData)) {
    return (
      <>
        {/* Render placeholder SEO while loading — noindex so Google ignores it */}
        <ProductHelmet productData={null} />
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
          <title>Product Not Found | {SITE_NAME}</title>
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

      {/*
        ── SEO Meta Tags ──────────────────────────────────────────────────────
        Rendered IMMEDIATELY when productData is available — no artificial
        delay. The ProductHelmet component is a pure derived-state renderer:
        it recomputes all values from productData via useMemo so there is no
        risk of stale/partial data. Google and other crawlers receive complete
        structured data on first paint.
      */}
      <ProductHelmet productData={productData} />

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