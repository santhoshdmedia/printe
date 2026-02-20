/* eslint-disable no-empty */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import { getAllBlogs } from "../../helper/api_helper";
import { BsInstagram, BsWhatsapp, BsYoutube, BsFacebook } from "react-icons/bs";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Standee", "Corporate Gifts", "Notebooks & Diaries",
  "Signages", "Business Cards", "Stationary",
];

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────
const Breadcrumbs = ({ title }) => (
  <nav className="breadcrumbs">
    <Link to="/" className="bc-link">Home</Link>
    <span className="bc-sep">›</span>
    <Link to="/blogs" className="bc-link">Blog</Link>
    <span className="bc-sep">›</span>
    <span className="bc-current">{title}</span>
  </nav>
);

// ─── Sidebar Recent Post Card ─────────────────────────────────────────────────
const RecentCard = ({ blog }) => {
  const id = _.get(blog, "_id", "");
  const name = _.get(blog, "blog_name", "");
  const image = _.get(blog, "blog_image", "");
  const date = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY");

  return (
    <Link to={`/blog-details/${id}`} className="recent-card">
      <div className="recent-thumb">
        {image ? <img src={image} alt={name} /> : <div className="thumb-placeholder" />}
      </div>
      <div className="recent-info">
        <span className="date-tag">{date}</span>
        <p className="recent-title">{name}</p>
      </div>
    </Link>
  );
};

// ─── All Blogs Grid Card ──────────────────────────────────────────────────────
const GridCard = ({ blog }) => {
  const id = _.get(blog, "_id", "");
  const name = _.get(blog, "blog_name", "");
  const image = _.get(blog, "blog_image", "");
  const desc = _.get(blog, "short_description", "");
  const date = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY");
  const plainDesc = desc.replace(/<[^>]*>/g, "");

  return (
    <div className="grid-card">
      <div className="grid-card-img-wrap">
        {image ? <img src={image} alt={name} /> : <div className="img-placeholder" />}
      </div>
      <div className="grid-card-body">
        <span className="date-tag">{date}</span>
        <h3 className="grid-card-title">{name}</h3>
        <p className="grid-card-desc">{plainDesc}</p>
        <Link to={`/blog-details/${id}`} className="read-more-link">Continue Reading →</Link>
      </div>
    </div>
  );
};

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
const ArticleSkeleton = () => (
  <div>
    <div className="sk-line wide shimmer" style={{ height: 36, marginBottom: 12 }} />
    <div className="sk-line shimmer" style={{ width: "30%", height: 12, marginBottom: 20 }} />
    <div className="sk-line shimmer" style={{ marginBottom: 8 }} />
    <div className="sk-line shimmer" style={{ marginBottom: 8 }} />
    <div className="sk-line shimmer" style={{ width: "75%", marginBottom: 24 }} />
    <div className="sk-hero-img shimmer" />
    <div style={{ marginTop: 24 }}>
      <div className="sk-line shimmer" style={{ width: "40%", height: 28, marginBottom: 12 }} />
      <div className="sk-line shimmer" style={{ marginBottom: 8 }} />
      <div className="sk-line shimmer" style={{ marginBottom: 8 }} />
      <div className="sk-line shimmer" style={{ width: "80%" }} />
    </div>
  </div>
);

// ─── Main BlogDetails ─────────────────────────────────────────────────────────
const BlogDetails = () => {
  const { id } = useParams();

  const [allBlogs, setAllBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllBlogs();
      const blogs = _.get(result, "data.data", []);
      const current = blogs.find((b) => b._id === id) || null;
      const others = blogs.filter((b) => b._id !== id);
      setCurrentBlog(current);
      setAllBlogs(others);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load this blog post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id]);

  const blogName = _.get(currentBlog, "blog_name", "");
  const blogImage = _.get(currentBlog, "blog_image", "");
  const shortDesc = _.get(currentBlog, "short_description", "");
  const descriptions = _.get(currentBlog, "blog_descriptions", []);
  const createdAt = moment(_.get(currentBlog, "createdAt", "")).format("dddd, MMMM DD, YYYY");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bd-page { font-family: 'DM Sans', sans-serif; background: #FEFAE8; min-height: 100vh; color: #2b2b2b; }

        /* Breadcrumbs */
        .bd-top { padding: 20px 5vw 0; }
        .breadcrumbs { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #888; flex-wrap: wrap; }
        .bc-link { color: #C98F00; text-decoration: none; font-weight: 500; }
        .bc-link:hover { text-decoration: underline; }
        .bc-sep { color: #bbb; }
        .bc-current { color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }

        /* Layout */
        .bd-layout {
          display: flex;
          gap: 32px;
          padding: 24px 5vw 60px;
          align-items: flex-start;
          min-height: 100%;
        }
        .bd-main { flex: 1; min-width: 0; }

        /* Sticky Sidebar */
        .bd-sidebar {
          width: 300px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e8dfa8 transparent;
        }
        .bd-sidebar::-webkit-scrollbar { width: 4px; }
        .bd-sidebar::-webkit-scrollbar-track { background: transparent; }
        .bd-sidebar::-webkit-scrollbar-thumb { background: #e8dfa8; border-radius: 4px; }

        @media (max-width: 768px) {
          .bd-layout { flex-direction: column; }
          .bd-sidebar {
            width: 100%;
            position: static;
            max-height: none;
            overflow-y: visible;
          }
        }

        /* State boxes */
        .state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; gap: 16px; color: #888; font-size: 0.95rem; }
        .error-box { color: #c0392b; }
        .retry-btn { background: #F5C518; border: none; padding: 9px 22px; border-radius: 7px; font-weight: 600; cursor: pointer; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; }
        .retry-btn:hover { background: #e0b400; }

        /* Skeleton */
        @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .shimmer { animation: shimmer 1.4s ease-in-out infinite; }
        .sk-line { height: 14px; border-radius: 6px; background: #e8dfa8; margin-bottom: 0; width: 100%; }
        .sk-hero-img { height: 400px; border-radius: 14px; background: #e8dfa8; }

        /* Article */
        .article-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 700; color: #1a1a1a; line-height: 1.25; margin-bottom: 10px; }
        .article-date { font-size: 0.82rem; color: #C98F00; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 16px; }

        /* Rich text from JoditEditor */
        .jodit-content { font-size: 1rem; color: #555; line-height: 1.75; text-align: justify; margin-bottom: 24px; }
        .jodit-content p { margin-bottom: 0.85em; }
        .jodit-content h1, .jodit-content h2, .jodit-content h3,
        .jodit-content h4, .jodit-content h5, .jodit-content h6 {
          font-family: 'Playfair Display', serif; color: #1a1a1a; margin: 1.2em 0 0.4em; line-height: 1.3;
        }
        .jodit-content ul, .jodit-content ol { padding-left: 1.4em; margin-bottom: 0.85em; }
        .jodit-content li { margin-bottom: 0.3em; }
        .jodit-content a { color: #C98F00; text-decoration: underline; }
        .jodit-content strong, .jodit-content b { color: #1a1a1a; }
        .jodit-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        .jodit-content table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        .jodit-content table td, .jodit-content table th { border: 1px solid #e0d9c0; padding: 8px 12px; font-size: 0.9rem; }
        .jodit-content table th { background: #f7f0d8; font-weight: 600; }
        .jodit-content blockquote { border-left: 3px solid #F5C518; margin: 1em 0; padding: 8px 16px; color: #777; font-style: italic; background: #fffde8; border-radius: 0 6px 6px 0; }

        /* Section rich text */
        .section-jodit-content { font-size: 0.95rem; color: #555; line-height: 1.8; text-align: justify; margin-bottom: 16px; }
        .section-jodit-content p { margin-bottom: 0.75em; }
        .section-jodit-content h1, .section-jodit-content h2, .section-jodit-content h3,
        .section-jodit-content h4, .section-jodit-content h5, .section-jodit-content h6 {
          font-family: 'Playfair Display', serif; color: #1a1a1a; margin: 1em 0 0.35em; line-height: 1.3;
        }
        .section-jodit-content ul, .section-jodit-content ol { padding-left: 1.4em; margin-bottom: 0.75em; }
        .section-jodit-content li { margin-bottom: 0.3em; }
        .section-jodit-content a { color: #C98F00; text-decoration: underline; }
        .section-jodit-content strong, .section-jodit-content b { color: #1a1a1a; }
        .section-jodit-content img { max-width: 100%; border-radius: 8px; margin: 6px 0; }
        .section-jodit-content table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
        .section-jodit-content table td, .section-jodit-content table th { border: 1px solid #e0d9c0; padding: 6px 10px; font-size: 0.88rem; }
        .section-jodit-content table th { background: #f7f0d8; font-weight: 600; }
        .section-jodit-content blockquote { border-left: 3px solid #F5C518; margin: 0.8em 0; padding: 6px 14px; color: #777; font-style: italic; background: #fffde8; border-radius: 0 6px 6px 0; }

        /* Hero image */
        .hero-img-wrap { width: 100%; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        .hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .img-placeholder-hero { width: 100%; height: 420px; background: #d9d9d9; }

        /* Divider */
        .styled-divider { border: none; border-top: 1.5px solid #e8e0c8; margin: 28px 0; }

        /* Sections */
        .section-block { margin-bottom: 12px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
        .section-images { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
        .section-img { width: 200px; height: 200px; object-fit: cover; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }

        /* Sidebar titles */
        .sidebar-section-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
        .sidebar-accent { width: 44px; height: 3px; background: #F5C518; border-radius: 2px; margin-bottom: 16px; }

        /* Recent card */
        .recent-card { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #e8e0c8; text-decoration: none; transition: opacity 0.2s; }
        .recent-card:last-child { border-bottom: none; }
        .recent-card:hover { opacity: 0.75; }
        .recent-thumb { width: 72px; height: 64px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #d9d9d9; }
        .recent-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-placeholder { width: 100%; height: 100%; background: #d9d9d9; }
        .recent-info { flex: 1; }
        .recent-title { font-size: 0.85rem; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin-top: 2px; }

        /* Shared */
        .date-tag { font-size: 0.72rem; color: #C98F00; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .read-more-link { display: inline-block; margin-top: 10px; color: #C98F00; font-weight: 500; font-size: 0.82rem; text-decoration: none; }
        .read-more-link:hover { text-decoration: underline; }

        /* Categories */
        .category-list { list-style: none; margin-bottom: 28px; }
        .category-list li { padding: 10px 0; border-bottom: 1px solid #e8e0c8; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: #2b2b2b; transition: color 0.2s; }
        .category-list li:last-child { border-bottom: none; }
        .category-list li:hover { color: #C98F00; }

        /* Social */
        .social-wrap { margin-top: 28px; }
        .social-icons { display: flex; gap: 12px; margin-top: 12px; }
        .social-icon { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; text-decoration: none; font-weight: 700; }
        .si-ig { background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); }
        .si-fb { background: #1877F2; }
        .si-wa { background: #25D366; }
        .si-yt { background: #FF0000; }

        /* All Blogs */
        .all-blogs-section { padding: 0 5vw 60px; }
        .all-blogs-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
        .all-blogs-accent { width: 52px; height: 3px; background: #F5C518; border-radius: 2px; margin-bottom: 20px; }
        .all-blogs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }

        /* Grid card */
        .grid-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); transition: transform 0.2s, box-shadow 0.2s; }
        .grid-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
        .grid-card-img-wrap { height: 180px; overflow: hidden; }
        .grid-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .img-placeholder { width: 100%; height: 100%; background: #d9d9d9; min-height: 180px; }
        .grid-card-body { padding: 14px 16px 18px; }
        .grid-card-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #1a1a1a; margin: 4px 0 8px; line-height: 1.35; }
        .grid-card-desc { font-size: 0.82rem; color: #666; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <div className="relative">
        {/* Background */}
        <div className="absolute bottom-0 left-0 !z-0 w-full">
          <img
            src="https://printe.s3.ap-south-1.amazonaws.com/1771389440794-gm1nqlp6ood.png"
            alt=""
            className="!z-0 h-[500px] lg:h-[1000px] object-center w-full object-cover "
          />
        </div>

        {/* Breadcrumbs */}
        <div className="bd-top">
          <Breadcrumbs title={loading ? "Loading..." : (blogName || "Blog Post")} />
        </div>

        {/* Main Layout */}
        <div className="bd-layout relative !z-100">

          {/* ── Left: Article ── */}
          <article className="bd-main">
            {loading && <ArticleSkeleton />}

            {!loading && error && (
              <div className="state-box error-box">
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchData}>Try Again</button>
              </div>
            )}

            {!loading && !error && !currentBlog && (
              <div className="state-box">
                <p>Blog post not found.</p>
                <Link to="/blogs" className="retry-btn" style={{ textDecoration: "none" }}>
                  ← Back to Blogs
                </Link>
              </div>
            )}

            {!loading && !error && currentBlog && (
              <>
                  <h1 className="article-title">{blogName}</h1>
                  <p className="article-date">{createdAt}</p>
                <div className="hero-img-wrap mb-6">
                  {blogImage
                    ? <img src={blogImage} alt={blogName} />
                    : <div className="img-placeholder-hero" />
                  }
                </div>

                <div
                  className="jodit-content"
                  dangerouslySetInnerHTML={{ __html: shortDesc }}
                />

              

                <hr className="styled-divider" />

                <div className="flex gap-4 flex-col">
                  {descriptions.map((section, index) => (
                    <div key={index} className="section-block flex flex-col-reverse">
                      {_.get(section, "images", []).length > 0 && (
                        <div className="p-5">
                          {_.get(section, "images", []).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`section-${index}-img-${i}`}
                              className="rounded-lg h-1/2 w-full object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <h2 className="lg:text-xl text-md font-bold text-center capitalize mb-3">
                        {_.get(section, "title", "")}
                      </h2>
                      <div
                        className="section-jodit-content"
                        dangerouslySetInnerHTML={{
                          __html: _.get(section, "description", ""),
                        }}
                      />
                      <hr className="styled-divider" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </article>

          {/* ── Right: Sticky Sidebar ── */}
          <aside className="bd-sidebar">
            <h2 className="sidebar-section-title">Recent Posts</h2>
            <div className="sidebar-accent" />
            <div style={{ marginBottom: "28px" }}>
              {loading
                ? [1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #e8e0c8" }}>
                    <div style={{ width: 72, height: 64, borderRadius: 8, background: "#e8dfa8" }} className="shimmer" />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 10, borderRadius: 5, background: "#e8dfa8", width: "40%" }} className="shimmer" />
                      <div style={{ height: 12, borderRadius: 5, background: "#e8dfa8" }} className="shimmer" />
                      <div style={{ height: 12, borderRadius: 5, background: "#e8dfa8", width: "70%" }} className="shimmer" />
                    </div>
                  </div>
                ))
                : allBlogs.slice(0, 4).map((blog) => (
                  <RecentCard key={blog._id} blog={blog} />
                ))
              }
            </div>

            <h2 className="sidebar-section-title">Categories</h2>
            <div className="sidebar-accent" />
            <ul className="category-list">
              {CATEGORIES.map((cat) => <li key={cat}>{cat}</li>)}
            </ul>

            <div className="sidebar-accent" />

            <div className="social-wrap">
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

        {/* ── All Blogs Grid ── */}
        {!loading && !error && allBlogs.length > 0 && (
          <section className="all-blogs-section relative !z-100">
            <h2 className="all-blogs-title">All Blogs</h2>
            <div className="all-blogs-accent" />
            <div className="all-blogs-grid">
              {allBlogs.map((blog) => (
                <GridCard key={blog._id} blog={blog} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default BlogDetails;