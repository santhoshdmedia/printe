import { useEffect, useState } from "react";
import { getAllBlogs } from "../../helper/api_helper";
import _ from "lodash";
import { useHref, Link } from "react-router-dom";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import DividerCards from "../../components/cards/DividerCards";

// ── Brand colours ──────────────────────────────────────────
const YELLOW = "#F5C518";
const CREAM  = "#FFFDE7";
const DARK   = "#2B2B2B";

// ── Static sidebar data (swap with real API calls if needed) ──
const CATEGORIES = [
  "Standee",
  "Corporate Gifts",
  "Notebooks & Dairies",
  "Signages",
  "Business Cards",
  "Stationary",
];

const SOCIAL_LINKS = [
  { label: "Instagram", color: "#E1306C", icon: InstagramIcon },
  { label: "Facebook",  color: "#1877F2", icon: FacebookIcon  },
  { label: "WhatsApp",  color: "#25D366", icon: WhatsAppIcon  },
  { label: "YouTube",   color: "#FF0000", icon: YouTubeIcon   },
];

// ── SVG Icons ──────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
      className="w-4 h-4">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
}

// ── Blog Card (left column) ────────────────────────────────
function BlogListCard({ res }) {
  const title       = _.get(res, "blog_name", "");
  const description = _.get(res, "short_description", "");
  const image       = _.get(res, "blog_image", "");
  const id          = _.get(res, "_id", "");

  return (
    <div className="flex flex-col mb-10 bg-white rounded-sm overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      {/* Image */}
      <div className="w-full h-56 bg-gray-200 overflow-hidden">
        {image ? (
          <img src={image} alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Text body */}
      <div className="p-5">
        <h2 className="text-lg font-bold mb-2 leading-snug"
          style={{ color: DARK, fontFamily: "'Georgia', serif" }}>
          {title}
        </h2>

        <p className="text-sm leading-relaxed text-justify text-gray-600 mb-3"
          style={{ fontFamily: "'Georgia', serif" }}>
          {description}
        </p>

        <Link to={`/blog-details/${id}`}
          className="text-sm font-semibold hover:underline transition-colors"
          style={{ color: YELLOW }}>
          Continue Reading
        </Link>
      </div>
    </div>
  );
}

// ── New Product Sidebar Card ───────────────────────────────
function NewProductCard({ res }) {
  const title       = _.get(res, "blog_name", "Standee");
  const description = _.get(res, "short_description", "");
  const image       = _.get(res, "blog_image", "");

  return (
    <div className="flex gap-3 mb-4 items-start">
      <div className="w-20 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm mb-1" style={{ color: DARK }}>{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{description}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
const Blog = () => {
  const [allBlogs, setAllBlogs]     = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const path = useHref();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fetchData = async () => {
    try {
      const result = await getAllBlogs();
      setAllBlogs(_.get(result, "data.data", []));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredBlogs = allBlogs.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      _.get(b, "blog_name", "").toLowerCase().includes(q) ||
      _.get(b, "short_description", "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: CREAM }}>

      {/* ── Header ── */}
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2"
          style={{ color: DARK, fontFamily: "'Georgia', serif" }}>
          Blog
        </h1>
        <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: DARK }}>
          Get Inspired with Custom Printing Ideas
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Latest trends, product ideas, branding tips, and smart print solutions for businesses.
        </p>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="px-[5vw] md:px-[8vw]">
        {path === "/" ? (
          <DividerCards name={"All Blogs"} to="/blogs" />
        ) : (
          <Breadcrumbs title={"All Blogs"} />
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-8 px-[5vw] md:px-[8vw] pb-16 pt-4">

        {/* ════ LEFT — Blog List ════ */}
        <main className="flex-1 min-w-0">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No blogs found</p>
            </div>
          ) : (
            filteredBlogs.slice(0, 6).map((res, index) => (
              <BlogListCard key={index} res={res} />
            ))
          )}
        </main>

        {/* ════ RIGHT — Sidebar ════ */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-8">

          {/* Search */}
          <div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search blogs, products & branding ideas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-gray-200 bg-white py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2"
                style={{ focusRingColor: YELLOW }}
              />
              <button
                className="absolute right-0 top-0 h-full px-4 rounded-r-sm flex items-center justify-center text-white"
                style={{ backgroundColor: YELLOW }}>
                <SearchIcon />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-extrabold mb-3" style={{ color: DARK }}>
              Categories
            </h3>
            {/* Yellow underline accent */}
            <div className="w-16 h-1 mb-4 rounded" style={{ backgroundColor: YELLOW }} />
            <ul>
              {CATEGORIES.map((cat, i) => (
                <li key={i}>
                  <Link
                    to={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block py-3 text-sm font-semibold border-b border-gray-200 hover:text-yellow-500 transition-colors"
                    style={{ color: DARK }}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* New Products */}
          <div>
            <h3 className="text-xl font-extrabold mb-4" style={{ color: DARK }}>
              New Products
            </h3>
            {allBlogs.slice(0, 3).map((res, i) => (
              <NewProductCard key={i} res={res} />
            ))}
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xl font-extrabold mb-4" style={{ color: DARK }}>
              Follow Us
            </h3>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, color, icon: Icon }) => (
                <a key={label} href="#"
                  aria-label={label}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Cloud / Wave bottom decoration ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 120 }}>
        {/* Yellow clouds layer */}
        <svg viewBox="0 0 900 120" preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full" fill={YELLOW} opacity={0.6}>
          <path d="M0,80 C100,40 200,100 300,70 C400,40 500,90 600,60 C700,30 800,80 900,50 L900,120 L0,120 Z" />
        </svg>
        {/* White clouds layer */}
        <svg viewBox="0 0 900 120" preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full" fill="white">
          <path d="M0,100 C150,60 300,110 450,80 C600,50 750,100 900,70 L900,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
};

export default Blog;