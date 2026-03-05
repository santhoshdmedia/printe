import { useState } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";

const truncateWords = (html, wordLimit = 22) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const BlogCarousel = ({ blogs = [] }) => {
  const [active, setActive] = useState(0);

  if (!blogs.length) return null;
  const total = blogs.length;

  const goTo = (idx) => { if (idx !== active) setActive(idx); };
  const goPrev = () => goTo((active - 1 + total) % total);
  const goNext = () => goTo((active + 1) % total);

  const blog      = blogs[active];
  const image     = _.get(blog, "blog_image", "");
  const name      = _.get(blog, "blog_name", "");
  const date      = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY");
  const slug      = _.get(blog, "blog_slug", "");
  const shortDesc = _.get(blog, "short_description", "");
  const desc      = truncateWords(shortDesc, 22);

  return (
    <section className="bg-[#F2F0EC] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-5 h-px bg-[#7C6E5A]" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#7C6E5A]">
                From our journal
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1714] leading-tight tracking-tight">
              Latest{" "}
              <em className="not-italic font-light text-[#8B6F47]">Blog</em>{" "}
              Posts
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="w-10 h-10 rounded-full border border-[#D4CFCA] bg-white text-[#1A1714] flex items-center justify-center text-sm shadow-sm hover:bg-[#1A1714] hover:text-[#F2F0EC] hover:border-[#1A1714] transition-all duration-200 cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={goNext}
              aria-label="Next"
              className="w-10 h-10 rounded-full border border-[#D4CFCA] bg-white text-[#1A1714] flex items-center justify-center text-sm shadow-sm hover:bg-[#1A1714] hover:text-[#F2F0EC] hover:border-[#1A1714] transition-all duration-200 cursor-pointer"
            >
              →
            </button>
            <Link
              to="/blogs"
              className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1A1714] bg-white border border-[#D4CFCA] px-4 py-2.5 rounded-full shadow-sm hover:bg-[#1A1714] hover:text-[#F2F0EC] hover:border-[#1A1714] transition-all duration-200 whitespace-nowrap"
            >
              All posts →
            </Link>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">

          {/* Banner image */}
          <div className="relative w-full aspect-[14/5] sm:aspect-[2/1] lg:aspect-[14/5] overflow-hidden bg-[#E8E4DC]">
            {image ? (
              <img
                key={active}
                src={image}
                alt={name}
                className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 hover:scale-102"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#EDE8E0] to-[#DDD7CB] text-5xl text-[#C4BDB4]">
                ✦
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur text-[#1A1714] text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full z-10 border border-white/60">
              Article
            </span>
          </div>

          {/* Content strip */}
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6 lg:p-8">

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8B6F47]">
                  {date}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#C8C2BA] flex-shrink-0" />
                <span className="text-[10px] text-[#A09890] tracking-wide">5 min read</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1A1714] leading-snug tracking-tight mb-2 line-clamp-2 transition-colors duration-200 hover:text-[#8B6F47]">
                {name}
              </h3>
              {desc && (
                <p className="text-sm text-[#7C7068] leading-relaxed line-clamp-2 max-w-xl">
                  {desc}
                </p>
              )}
            </div>

            <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end flex-shrink-0">
              <span className="text-[10px] font-medium text-[#A09890] tracking-widest whitespace-nowrap">
                <strong className="text-[#1A1714] font-bold">
                  {String(active + 1).padStart(2, "0")}
                </strong>{" "}
                / {String(total).padStart(2, "0")}
              </span>
              <Link
                to={`/blog-details/${slug}`}
                className="inline-flex items-center gap-2 bg-[#1A1714] text-[#F2F0EC] text-[10px] font-bold tracking-[0.15em] uppercase px-5 py-3 rounded-full shadow-md hover:bg-[#8B6F47] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                Read Article
                <svg
                  className="w-3 h-3 transition-transform duration-200 hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Thumbnail Strip ── */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {blogs.map((b, i) => {
            const tImg   = _.get(b, "blog_image", "");
            const tName  = _.get(b, "blog_name", "");
            const isActive = i === active;
            return (
              <div
                key={b._id || i}
                onClick={() => goTo(i)}
                className={`
                  flex-none w-[calc(50%-4px)] sm:flex-1 sm:w-0 snap-start
                  cursor-pointer rounded-xl overflow-hidden relative border-2
                  transition-all duration-200
                  ${isActive
                    ? "border-[#1A1714] shadow-md"
                    : "border-transparent hover:-translate-y-0.5 hover:shadow-md"
                  }
                `}
              >
                {tImg ? (
                  <img
                    src={tImg}
                    alt={tName}
                    className={`w-full aspect-[16/7] object-contain block transition-all duration-200 ${
                      isActive ? "opacity-100" : "opacity-75 grayscale"
                    }`}
                  />
                ) : (
                  <div className="w-full aspect-[16/7] bg-gradient-to-br from-[#EDE8E0] to-[#DDD7CB] flex items-center justify-center text-[#C4BDB4] text-xl">
                    ✦
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-5 bg-gradient-to-t from-black/60 to-transparent">
                  <span className={`text-[10px] leading-tight block truncate ${isActive ? "text-white font-semibold" : "text-white/80 font-medium"}`}>
                    {tName}
                  </span>
                </div>
                {isActive && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Dots ── */}
        <div className="flex justify-center items-center gap-1.5 mt-5">
          {blogs.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                i === active
                  ? "bg-[#1A1714] w-6"
                  : "bg-[#D4CFCA] w-1.5 hover:bg-[#A09890]"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogCarousel;