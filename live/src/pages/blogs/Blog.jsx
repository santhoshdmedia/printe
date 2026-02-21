import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import { getAllBlogs } from "../../helper/api_helper";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Standee", "Corporate Gifts", "Notebooks & Diaries",
  "Signages", "Business Cards", "Stationary",
];

const NEW_PRODUCTS = [
  { title: "Standee", desc: "Discover practical tips, design trends, and cost-effective print ideas that create a lasting professional impression." },
  { title: "Standee", desc: "Discover practical tips, design trends, and cost-effective print ideas that create a lasting professional impression." },
  { title: "Standee", desc: "Discover practical tips, design trends, and cost-effective print ideas that create a lasting professional impression." },
];

// ─── BlogCard ─────────────────────────────────────────────────────────────────
const BlogCard = ({ blog, featured = false }) => {
  const image = _.get(blog, "blog_image", "");
  const name = _.get(blog, "blog_name", "");
  const date = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY");
  const slug = _.get(blog, "blog_slug", ""); // ✅ always use slug

  if (featured) {
    return (
      <div className="featured-card">
        <div className="featured-image-wrap">
          {image ? <img src={image} alt={name} className="featured-image" /> : <div className="image-placeholder" />}
        </div>
        <div className="featured-body">
          <span className="date-tag">{date}</span>
          <h2 className="featured-title">{name}</h2>
          
          <div
            className="section-jodit-content"
            dangerouslySetInnerHTML={{
              __html: _.get(blog, "short_description", ""),
            }}
          />
          <Link to={`/blog-details/${slug}`} className="read-more-btn">Continue Reading →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-card">
      {image ? <img src={image} alt={name} className="card-image" /> : <div className="image-placeholder" />}
      <div className="card-body">
        <span className="date-tag">{date}</span>
        <h3 className="card-title">{name}</h3>
        <div
          className="section-jodit-content"
          dangerouslySetInnerHTML={{
            __html: _.get(blog, "short_description", ""),
          }}
        />
        <Link to={`/blog-details/${slug}`} className="read-more-link">Continue Reading →</Link> {/* ✅ was id, now slug */}
      </div>
    </div>
  );
};

// ─── ProductRow ───────────────────────────────────────────────────────────────
const ProductRow = ({ item }) => (
  <div className="product-row">
    <div className="product-thumb" />
    <div className="product-info">
      <strong className="product-name">{item.title}</strong>
      <p className="product-desc">{item.desc}</p>
    </div>
  </div>
);

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img shimmer" />
    <div className="skeleton-body">
      <div className="skeleton-line short shimmer" />
      <div className="skeleton-line shimmer" />
      <div className="skeleton-line shimmer" />
      <div className="skeleton-line mid shimmer" />
    </div>
  </div>
);
import { BsInstagram, BsWhatsapp, BsYoutube, BsFacebook } from "react-icons/bs";


// ─── Main Blog Page ───────────────────────────────────────────────────────────
const Blog = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllBlogs();
      setAllBlogs(_.get(result, "data.data", []));
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Something went wrong while loading blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const filtered = search
    ? allBlogs.filter((b) => b.blog_name?.toLowerCase().includes(search.toLowerCase()))
    : allBlogs;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .blog-page { font-family: 'DM Sans', sans-serif; background: #FEFAE8; min-height: 100vh; color: #2b2b2b; }

        /* Hero */
        .blog-hero { text-align: center; padding: 52px 5vw 36px; }
        .blog-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
        .blog-hero .hero-sub { font-size: 1.05rem; font-weight: 500; color: #1a1a1a; margin: 6px 0 10px; }
        .blog-hero .hero-tagline { font-size: 0.95rem; color: #555; font-weight: 300; }

        /* Layout */
        .blog-layout { display: flex; gap: 32px; padding: 0 5vw 60px; align-items: flex-start; }
        .blog-main { flex: 1; min-width: 0; }
        .blog-sidebar { width: 300px; flex-shrink: 0; }
        @media (max-width: 768px) { .blog-layout { flex-direction: column; } .blog-sidebar { width: 100%; } }

        /* State boxes */
        .state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; gap: 16px; color: #888; font-size: 0.95rem; }
        .error-box { color: #c0392b; }
        .retry-btn { background: #F5C518; border: none; padding: 9px 22px; border-radius: 7px; font-weight: 600; cursor: pointer; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; }
        .retry-btn:hover { background: #e0b400; }

        /* Spinner */
        .spinner { width: 36px; height: 36px; border: 3px solid #f0e68c; border-top-color: #F5C518; border-radius: 50%; animation: spin 0.75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Skeleton */
        .skeleton-card { background: #fff; border-radius: 12px; overflow: hidden; margin-bottom: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        .skeleton-img { height: 240px; width: 100%; background: #e8dfa8; }
        .skeleton-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-line { height: 12px; border-radius: 6px; background: #e8dfa8; }
        .skeleton-line.short { width: 35%; height: 10px; }
        .skeleton-line.mid { width: 55%; }
        @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        .shimmer { animation: shimmer 1.4s ease-in-out infinite; }

        /* Featured card */
        .featured-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); margin-bottom: 28px; }
        .featured-image-wrap { width: 100%; height: 280px; overflow: hidden; }
        .featured-image { width: 100%; height: 100%; object-fit: cover; }
        .featured-body { padding: 20px 24px 24px; }
        .featured-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; margin: 6px 0 10px; color: #1a1a1a; line-height: 1.3; }
        .featured-desc { font-size: 0.9rem; color: #555; line-height: 1.65; text-align: justify; }

        /* Blog card */
        .blog-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); margin-bottom: 28px; }
        .card-image { width: 100%; height: 220px; object-fit: cover; }
        .card-body { padding: 16px 20px 20px; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; margin: 4px 0 8px; color: #1a1a1a; }
        .card-desc { font-size: 0.875rem; color: #555; line-height: 1.65; text-align: justify; }

        /* Shared */
        .image-placeholder { width: 100%; background: #d9d9d9; min-height: 220px; }
        .date-tag { font-size: 0.75rem; color: #E09C00; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .read-more-btn { display: inline-block; margin-top: 14px; background: #F5C518; color: #1a1a1a; font-weight: 500; font-size: 0.85rem; padding: 8px 18px; border-radius: 6px; text-decoration: none; transition: background 0.2s; }
        .read-more-btn:hover { background: #e0b400; }
        .read-more-link { display: inline-block; margin-top: 10px; color: #C98F00; font-weight: 500; font-size: 0.85rem; text-decoration: none; }
        .read-more-link:hover { text-decoration: underline; }

        /* Sidebar */
        .sidebar-search { display: flex; align-items: center; background: #fff; border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 12px; gap: 8px; margin-bottom: 28px; }
        .sidebar-search input { border: none; outline: none; font-size: 0.875rem; flex: 1; background: transparent; font-family: 'DM Sans', sans-serif; color: #2b2b2b; }
        .sidebar-search button { background: #F5C518; border: none; cursor: pointer; border-radius: 6px; padding: 6px 10px; font-size: 1rem; }
        .sidebar-section-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
        .sidebar-accent { width: 48px; height: 3px; background: #F5C518; border-radius: 2px; margin-bottom: 16px; }
        .category-list { list-style: none; }
        .category-list li { padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: #2b2b2b; transition: color 0.2s; }
        .category-list li:last-child { border-bottom: none; }
        .category-list li:hover { color: #C98F00; }
        .new-products-wrap { margin-top: 32px; }
        .product-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
        .product-thumb { width: 72px; height: 72px; background: #d9d9d9; border-radius: 8px; flex-shrink: 0; }
        .product-name { font-size: 0.9rem; font-weight: 600; display: block; margin-bottom: 4px; }
        .product-desc { font-size: 0.78rem; color: #666; line-height: 1.5; }
        .follow-wrap { margin-top: 32px; }
        .social-icons { display: flex; gap: 12px; margin-top: 12px; }
        .social-icon { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #fff; text-decoration: none; font-weight: 700; }
        .si-ig { background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); }
        .si-fb { background: #1877F2; }
        .si-wa { background: #25D366; }
        .si-yt { background: #FF0000; }

        /* Cloud */
        .cloud-bar { position: relative; height: 80px; overflow: hidden; margin-top: 20px; }
        .cloud-bar svg { position: absolute; bottom: 0; width: 100%; }

        /* Rich text */
        .section-jodit-content { font-size: 0.9rem; color: #555; line-height: 1.7; text-align: justify; }
        .section-jodit-content p { margin-bottom: 0.6em; }
      `}</style>

      <div className="blog-page relative">
        <div className="absolute bottom-0 left-0 !z-0 w-full">
          <img src="https://printe.s3.ap-south-1.amazonaws.com/1771389440794-gm1nqlp6ood.png" alt="" className="!z-0 h-[500px] lg:h-[1000px] object-center w-full object-cover" />
        </div>
        {/* Hero */}
        <div className="blog-hero relative z-10">
          <h1>Blog</h1>
          <p className="hero-sub">Get Inspired with Custom Printing Ideas</p>
          <p className="hero-tagline">Latest trends, product ideas, branding tips, and smart print solutions for businesses.</p>
        </div>

        {/* Main layout */}
        <div className="blog-layout relative z-10">

          {/* Left: Blog posts */}
          <div className="blog-main">
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            {!loading && error && (
              <div className="state-box error-box">
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchData}>Try Again</button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="state-box">
                <p>{search ? `No blogs found for "${search}".` : "No blogs available yet."}</p>
              </div>
            )}
            {!loading && !error && filtered.length > 0 && (
              <>
                <BlogCard blog={filtered[0]} featured />
                {filtered.slice(1).map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                  
                ))}
              </>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="blog-sidebar">
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Search blogs, products & branding ideas"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button>🔍</button>
            </div>

            <h2 className="sidebar-section-title">Categories</h2>
            <div className="sidebar-accent" />
            <ul className="category-list">
              {CATEGORIES.map((cat) => <li key={cat}>{cat}</li>)}
            </ul>

            {/* <div className="new-products-wrap">
              <h2 className="sidebar-section-title">New Products</h2>
              <div className="sidebar-accent" />
              {NEW_PRODUCTS.map((p, i) => <ProductRow key={i} item={p} />)}
            </div> */}

            <div className="follow-wrap">
              <h2 className="sidebar-section-title">Follow Us</h2>
              <div className="social-icons">
                <a href="https://www.instagram.com/the.printe/" className="social-icon si-ig" title="Instagram"><BsInstagram /></a>
                <a href="https://www.facebook.com/people/Printe/61578118705571/?sk=about" className="social-icon si-fb" title="Facebook"><BsFacebook /></a>
                <a href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F" className="social-icon si-wa" title="WhatsApp"><BsWhatsapp /></a>
                <a href="https://www.youtube.com/@PrintEOfficial" className="social-icon si-yt" title="YouTube"><BsYoutube /></a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Blog;