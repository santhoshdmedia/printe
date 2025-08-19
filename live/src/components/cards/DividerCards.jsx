import { Link, useLocation } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
import { motion } from "framer-motion";

const DividerCards = ({ name, subtitle, to, left = false }) => {
  const location = useLocation();
  const isSeeMorePage = location.pathname.startsWith("/see-more/") || 
                       location.pathname.startsWith("/recent-Products");

  return (
    <div className="py-6 px-4">
      <div className={`flex ${left || isSeeMorePage ? "justify-between items-center" : "flex-col items-center"} gap-4`}>
        {/* Title Section */}
        <div className="flex flex-col items-center lg:items-start gap-2">
          <div className="relative inline-block">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              {name}
            </h1>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-0 left-0 h-1 bg-[#f9c114]"
            />
          </div>

          {subtitle && (
            <p className="text-sm text-gray-500 text-center lg:text-left">
              {subtitle}
            </p>
          )}
        </div>

        {/* See More Link */}
        {to && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={to}
              className="flex items-center gap-1 text-sm font-medium text-[#f9c114] hover:text-[#d8ad2d] transition-colors"
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