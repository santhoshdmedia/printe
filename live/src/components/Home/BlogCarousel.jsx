import { useRef } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";

const BlogCarousel = ({ blogs = [] }) => {
  const trackRef = useRef(null);

  if (!blogs.length) return null;

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".blog-snap-card");
    const gap = 20;
    const amount = (card ? card.offsetWidth + gap : 320);
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="px-[5vw] py-10 bg-[#FEFAE8]">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[0.72rem] font-bold tracking-widest uppercase text-[#C98F00] mb-1">
            From our journal
          </p>
          <h2 className="font-serif text-2xl lg:text-[2.1rem] font-bold text-[#1a1a1a] leading-tight m-0">
            Latest <span className="text-[#F5C518]">Blog</span> Posts
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              aria-label="Previous"
              className="w-[38px] h-[38px] rounded-full border border-[#e0d080] bg-white flex items-center justify-center text-base text-[#1a1a1a] hover:bg-[#F5C518] hover:border-[#F5C518] transition-colors duration-200 cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Next"
              className="w-[38px] h-[38px] rounded-full border border-[#e0d080] bg-white flex items-center justify-center text-base text-[#1a1a1a] hover:bg-[#F5C518] hover:border-[#F5C518] transition-colors duration-200 cursor-pointer"
            >
              →
            </button>
          </div>

          <Link
            to="/blogs"
            className="text-[0.82rem] font-semibold text-[#1a1a1a] no-underline border-b border-[#F5C518] pb-[2px] whitespace-nowrap hover:text-[#C98F00] transition-colors duration-200"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Scrollable Track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1"
      >
        {blogs.map((blog) => {
          const image = _.get(blog, "blog_image", "");
          const name = _.get(blog, "blog_name", "");
          const date = moment(_.get(blog, "createdAt", "")).format("MMM DD, YYYY");
          const slug = _.get(blog, "blog_slug", "");
          const shortDesc = _.get(blog, "short_description", "");

          return (
            <Link
              key={blog._id}
              to={`/blog-details/${slug}`}
              className="blog-snap-card flex-none w-[350px] lg:w-[500px] [scroll-snap-align:start] bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.07)] no-underline text-inherit flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              {/* Image */}
              <div className="w-full h-[160px] overflow-hidden bg-[#e8e0c0] flex-shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#d9d4b8]" />
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[0.7rem] text-[#E09C00] font-semibold uppercase tracking-wide mb-1.5">
                  {date}
                </span>
                <h3 className=" text-base font-bold text-[#1a1a1a] leading-snug mb-2 line-clamp-2">
                  {name}
                </h3>
                <div
                  className="text-[0.8rem] text-[#666] leading-relaxed line-clamp-3 flex-1 [&_p]:m-0 !font-serif"
                  dangerouslySetInnerHTML={{ __html: shortDesc }}
                />
                <span className="mt-3 text-[0.78rem] font-semibold text-[#C98F00]">
                  Read more →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BlogCarousel;