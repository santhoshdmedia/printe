import { Link, useLocation } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
import { motion } from "motion/react";

const DividerCards = ({ name = "BEST SELLERS", subtitle = "Most Loved Products", to, left = false }) => {
  const location = useLocation();
  const isSeeMorePage = location.pathname.startsWith("/see-more/") || 
                       location.pathname.startsWith("/recent-Products");

  const heading = name || "BEST SELLERS";
  const subHeading = subtitle || "Most Loved Products";

  return (
    <div className="pt-6 sm:py-6 sm:px-4">
      <div className={`flex ${left || isSeeMorePage ? "justify-between items-center" : "flex-col items-center"} gap-4`}>
        {/* Title Section */}
        <div className="flex flex-col items-start gap-1">
          {/* Heading: primary yellow with --- before */}
          <div className="flex items-center gap-2">
            <span className="text-[#f2c41a] font-extrabold tracking-tighter text-sm sm:text-base select-none">
              ---
            </span>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase text-[#f2c41a]">
              {heading}
            </h2>
          </div>

          {/* Subheading: black, larger than heading */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111] leading-tight  lg:text-left">
            {subHeading}
          </h1>
        </div>

        {/* See More Link */}
        {to && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={to}
              className="flex items-center gap-1 text-[10px] sm:text-sm font-medium text-[#f2c41a] hover:text-[#d8ad2d] transition-colors"
            >
              See More
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <IconHelper.RIGHT_ARROW />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Simple Divider */}
      {!isSeeMorePage && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gray-200 mt-4"
        />
      )}
    </div>
  );
};

export default DividerCards;