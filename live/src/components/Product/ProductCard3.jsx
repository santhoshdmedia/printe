import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PrintProductCard3 = ({ data }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const price = data.variants_price?.[0]?.price || data.single_product_price;
  const productUrl = `/product/${data.seo_url}`;
  const imageUrl = data.images?.[0]?.path || "";
  const hasVariants = data.variants_price?.length > 0;
  
  const handleCardClick = () => navigate(productUrl);
  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    navigate(productUrl);
  };

  return (
    <div className="flex flex-col items-center w-full h-[380px]">
      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer rounded-xl bg-white shadow-lg hover:shadow-xl transition-all w-full overflow-hidden"
        style={{
          height: isHovered ? "420px" : "360px",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        aria-label={`View ${data.name} product details`}
      >
        {/* Background Gradient Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 z-0"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Product Image Container */}
        <motion.div 
          className="absolute h-[240px] w-[85%] top-6 left-1/2 -translate-x-1/2 rounded-xl overflow-hidden"
          animate={{
            height: isHovered ? "260px" : "240px",
          }}
          transition={{ duration: 0.4 }}
        >
          <motion.img
            src={imageUrl}
            alt={data.name}
            className="h-full w-full object-cover"
            animate={{
              scale: isHovered ? 1.03 : 1,
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.1, 0.25, 1] 
            }}
          />

          {/* Price Tag */}
          <motion.div
            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm z-10"
            initial={{ opacity: 0.9, y: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0.9,
              y: isHovered ? 0 : 5,
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <span className="text-gray-700">Rs.</span>{" "}
            <span className="text-[#f9c114]">{price}</span>
          </motion.div>

          {/* Badge for Variants */}
          {hasVariants && (
            <motion.div
              className="absolute top-3 left-3 bg-[#fff5d9] text-[#8a6e0d] text-xs px-2 py-1 rounded-full font-medium"
              animate={{
                opacity: isHovered ? 0.9 : 1,
                y: isHovered ? -2 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {data.variants_price.length} Options
            </motion.div>
          )}
        </motion.div>

        {/* Quick View Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-28 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className="px-5 py-2 bg-[#f9c114] text-black text-sm font-medium rounded-full shadow-lg hover:bg-[#e6b310] transition-colors flex items-center gap-1"
                onClick={handleQuickViewClick}
                aria-label={`Quick view ${data.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Quick View
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Info */}
        <motion.div
          className="absolute left-0 right-0 bottom-0 px-4 pb-5 text-center"
          initial={{ y: 0 }}
          animate={{
            y: isHovered ? 0 : 20,
            opacity: isHovered ? 1 : 0.9
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <h3 className="text-lg font-semibold text-black line-clamp-2 mb-1">
            {data.name}
          </h3>
          
          <AnimatePresence>
            {isHovered && (
              <motion.p
                className="text-sm text-gray-600 mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {hasVariants ? "Multiple options available" : "Customizable product"}
              </motion.p>
            )}
          </AnimatePresence>
          
          <motion.div
            className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"
            animate={{
              opacity: isHovered ? 1 : 0.7,
              scaleX: isHovered ? 1 : 0.9
            }}
          >
            <motion.div 
              className="h-full bg-[#f9c114] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: isHovered ? "70%" : "40%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
      
    </div>
  )
}

export default PrintProductCard3; 