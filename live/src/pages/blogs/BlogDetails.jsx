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
  <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
    <Link to="/" className="text-[#C98F00] font-medium hover:underline">Home</Link>
    <span className="text-gray-400">›</span>
    <Link to="/blogs" className="text-[#C98F00] font-medium hover:underline">Blog</Link>
    <span className="text-gray-400">›</span>
    <span className="text-gray-600 truncate max-w-[240px]">{title}</span>
  </nav>
);

// ─── Sidebar Recent Post Card ─────────────────────────────────────────────────
const RecentCard = ({ blog }) => {
  const slug = _.get(blog, "blog_slug", "");
  const name = _.get(blog, "blog_name", "");
  const image = _.get(blog, "blog_image", "");
  const date = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY").toUpperCase();

  return (
    <Link
      to={`/blog-details/${slug}`}
      className="flex gap-3 items-start py-3 border-b border-[#e8e0c8] last:border-0 hover:opacity-80 transition-opacity"
    >
      <div className="w-[72px] h-[60px] rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
        {image
          ? <img   fetchpriority="high" loading="eager" src={image} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gray-300" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[11px] text-[#C98F00] font-semibold uppercase tracking-wide leading-none mb-1">
          {date}
        </span>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{name}</p>
      </div>
    </Link>
  );
};

// ─── Sidebar Section Header ───────────────────────────────────────────────────
const SidebarHeading = ({ children }) => (
  <div className="mb-4">
    <h2 className=" text-xl font-bold text-gray-900 leading-tight">{children}</h2>
    <div className="w-10 h-[3px] bg-[#F5C518] rounded-full mt-1.5" />
  </div>
);

// ─── All Blogs Grid Card ──────────────────────────────────────────────────────
const GridCard = ({ blog }) => {
  const slug = _.get(blog, "blog_slug", "");
  const name = _.get(blog, "blog_name", "");
  const image = _.get(blog, "blog_image", "");
  const desc = _.get(blog, "short_description", "");
  const date = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY");
  const plainDesc = desc.replace(/<[^>]*>/g, "");

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="h-48 overflow-hidden">
        {image
          ? <img   fetchpriority="high" loading="eager" src={image} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gray-200" />
        }
      </div>
      <div className="p-4">
        <span className="text-[11px] text-[#C98F00] font-semibold uppercase tracking-wide">{date}</span>
        <h3 className=" text-base font-bold text-gray-900 mt-1 mb-2 leading-snug">{name}</h3>
        <p className="text-sm text-gray-500 line-clamp-3">{plainDesc}</p>
        <Link
          to={`/blog-details/${slug}`}
          className="inline-block mt-3 text-[#C98F00] font-semibold text-sm hover:underline"
        >
          Continue Reading →
        </Link>
      </div>
    </div>
  );
};

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
const ArticleSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-9 bg-[#e8dfa8] rounded w-3/4 mb-3" />
    <div className="h-3 bg-[#e8dfa8] rounded w-1/4 mb-5" />
    <div className="h-4 bg-[#e8dfa8] rounded w-full mb-2" />
    <div className="h-4 bg-[#e8dfa8] rounded w-full mb-2" />
    <div className="h-4 bg-[#e8dfa8] rounded w-3/4 mb-6" />
    <div className="h-[400px] bg-[#e8dfa8] rounded-xl" />
    <div className="mt-6">
      <div className="h-7 bg-[#e8dfa8] rounded w-2/5 mb-3" />
      <div className="h-4 bg-[#e8dfa8] rounded w-full mb-2" />
      <div className="h-4 bg-[#e8dfa8] rounded w-full mb-2" />
      <div className="h-4 bg-[#e8dfa8] rounded w-4/5" />
    </div>
  </div>
);

const SidebarSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex gap-3 py-3 border-b border-[#e8e0c8]">
        <div className="w-[72px] h-[60px] rounded-md bg-[#e8dfa8] flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-2.5 bg-[#e8dfa8] rounded w-2/5" />
          <div className="h-3.5 bg-[#e8dfa8] rounded" />
          <div className="h-3.5 bg-[#e8dfa8] rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main BlogDetails ─────────────────────────────────────────────────────────
const BlogDetails = () => {
  const { slug } = useParams();

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
      const current = blogs.find((b) => b.blog_slug === slug) || null;
      const others = blogs.filter((b) => b.blog_slug !== slug);
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
  }, [slug]);

  const blogName = _.get(currentBlog, "blog_name", "");
  const blogImage = _.get(currentBlog, "blog_image", "");
  const shortDesc = _.get(currentBlog, "short_description", "");
  const descriptions = _.get(currentBlog, "blog_descriptions", []);
  const createdAt = moment(_.get(currentBlog, "createdAt", "")).format("dddd, MMMM DD, YYYY");

  return (
    <div className="relative bg-[#FEFAE8] min-h-screen font-sans text-gray-800">

      {/* Background image */}
      <div className="absolute bottom-0 left-0 w-full -z-0 pointer-events-none select-none">
        <img   fetchpriority="high" loading="eager"
          src="https://printe.s3.ap-south-1.amazonaws.com/1771389440794-gm1nqlp6ood.png"
          alt=""
          className="w-full h-[500px] lg:h-[1000px] object-cover object-center"
        />
      </div>

      {/* Breadcrumbs */}
      <div className="relative z-10 px-4 pt-5 md:px-8 lg:px-20">
        <Breadcrumbs title={loading ? "Loading..." : (blogName || "Blog Post")} />
      </div>

      {/* ── Main Layout: Article + Sidebar ── */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 px-4 py-6 md:px-8 lg:px-20 lg:items-start">

        {/* ── Left: Article ── */}
        <article className="flex-1 min-w-0">
          {loading && <ArticleSkeleton />}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center min-h-[260px] gap-4 text-red-600">
              <p>{error}</p>
              <button
                className="bg-[#F5C518] hover:bg-[#e0b400] px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
                onClick={fetchData}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && !currentBlog && (
            <div className="flex flex-col items-center justify-center min-h-[260px] gap-4 text-gray-500">
              <p>Blog post not found.</p>
              <Link
                to="/blogs"
                className="bg-[#F5C518] hover:bg-[#e0b400] px-5 py-2 rounded-lg font-semibold text-sm no-underline transition-colors"
              >
                ← Back to Blogs
              </Link>
            </div>
          )}

          {!loading && !error && currentBlog && (
            <>
              <h1 className=" text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {blogName}
              </h1>
              <p className="text-xs text-[#C98F00] font-semibold uppercase tracking-wide mb-5">
                {createdAt}
              </p>

              <div className="rounded-xl overflow-hidden shadow-md mb-6">
                {blogImage
                  ? <img   fetchpriority="high" loading="eager" src={blogImage} alt={blogName} className="w-full h-auto object-cover" />
                  : <div className="w-full h-[420px] bg-gray-300" />
                }
              </div>

              {/* Rich text intro */}
              <div
                className="prose prose-stone text-gray-900 prose-a:text-[#C98F00] prose-strong:text-gray-900 prose-blockquote:border-l-[#F5C518] prose-blockquote:bg-[#fffde8] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: shortDesc }}
              />

              <hr className="border-t-2 border-[#e8e0c8] my-7" />

              {/* Sections */}
              <div className="flex flex-col gap-4">
                {descriptions.map((section, index) => (
                  <div key={index} className="flex flex-col-reverse">
                    {_.get(section, "images", []).length > 0 && (
                      <div className="p-5">
                        {_.get(section, "images", []).map((img, i) => (
                          <img   fetchpriority="high" loading="eager"
                            key={i}
                            src={img}
                            alt={`section-${index}-img-${i}`}
                            className="rounded-xl w-full h-auto object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <h2 className="lg:text-xl text-md font-bold text-center capitalize mb-3  text-gray-900">
                      {_.get(section, "title", "")}
                    </h2>
                    <div
                      className="prose prose-stone prose-sm prose-headings: prose-headings:text-gray-900 prose-a:text-[#C98F00] prose-strong:text-gray-900 prose-blockquote:border-l-[#F5C518] prose-blockquote:bg-[#fffde8] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: _.get(section, "description", "") }}
                    />
                    <hr className="border-t-2 border-[#e8e0c8] my-4" />
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        {/* ── Right: Sidebar ── */}
        <aside className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">

          {/* Recent Posts */}
          <div className="mb-8">
            <SidebarHeading>Recent Posts</SidebarHeading>
            {loading
              ? <SidebarSkeleton />
              : allBlogs.slice(0, 4).map((blog) => (
                  <RecentCard key={blog._id} blog={blog} />
                ))
            }
          </div>

          {/* Categories */}
          <div className="mb-8">
            <SidebarHeading>Categories</SidebarHeading>
            <ul className="divide-y divide-[#e8e0c8]">
              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  className="py-2.5 text-sm font-medium text-gray-700 hover:text-[#C98F00] cursor-pointer transition-colors"
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="w-10 h-[3px] bg-[#F5C518] rounded-full mb-6" />

          {/* Follow Us */}
          <div>
            <SidebarHeading>Follow Us</SidebarHeading>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/the.printe/"
                title="Instagram"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] hover:scale-110 transition-transform"
              >
                <BsInstagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/people/Printe/61578118705571/?sk=about"
                title="Facebook"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#1877F2] hover:scale-110 transition-transform"
              >
                <BsFacebook size={18} />
              </a>
              <a
                href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
                title="WhatsApp"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#25D366] hover:scale-110 transition-transform"
              >
                <BsWhatsapp size={18} />
              </a>
              <a
                href="https://www.youtube.com/@PrintEOfficial"
                title="YouTube"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#FF0000] hover:scale-110 transition-transform"
              >
                <BsYoutube size={18} />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* ── All Blogs Grid ── */}
      {!loading && !error && allBlogs.length > 0 && (
        <section className="relative z-10 px-4 py-12 md:px-8 lg:px-20">
          <h2 className=" text-3xl font-bold text-gray-900 mb-1">All Blogs</h2>
          <div className="w-12 h-[3px] bg-[#F5C518] rounded-full mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allBlogs.map((blog) => (
              <GridCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetails;