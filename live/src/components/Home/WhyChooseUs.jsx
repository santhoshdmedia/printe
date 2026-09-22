import { motion } from "motion/react";
import WhyChooseUsImg from "../../assets/mockup/why_choose_us.png";

const FEATURES_DATA = [
  {
    id: 1,
    title: "Easy Customization",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Premium Quality",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Loved by Thousands",
    icon: (
      <svg
        className="w-[18px] h-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

const WhyChooseUs = () => {
  return (
    <section
      className="py-2 px-2 lg:px-4  bg-white overflow-hidden font-primary"
      style={{
        fontFamily: "Jost, serif",
      }}
    >
      <div className="WhyChooseUsConatiner max-w-[1200px] mx-auto flex flex-wrap items-center justify-center md:gap-3 lg:gap-16">

        {/* ══════ LEFT: Image with SVG blob ══════ */}
        <motion.div
          className="flex-1 relative flex items-center justify-center min-w-[260px] min-h-[200px] sm:min-h-[260px] md:min-h-[320px] lg:min-h-[480px] w-full max-w-[360px] lg:max-w-none"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Decorative floating dots */}
          <span className="absolute w-3.5 h-3.5 rounded-full bg-[#f2c41a] opacity-35 top-[8%] right-[12%] animate-wcu-float-dot z-0" />
          <span className="absolute w-2.5 h-2.5 rounded-full bg-[#f2c41a] opacity-35 bottom-[15%] left-[5%] animate-wcu-float-dot-2 z-0" />
          <span className="absolute w-2 h-2 rounded-full bg-[#f2c41a] opacity-35 top-[55%] right-[3%] animate-wcu-float-dot-3 z-0" />

          {/* Animated SVG blob background */}
          <svg
            className="absolute w-[110%] h-[110%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 drop-shadow-[0_8px_30px_rgba(248,242,221,0.5)]"
            viewBox="150 120 560 800"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Secondary (larger, lighter) blob */}
            <path
              className="wcu-blob-path-2"
              d="M440,250 C510,160 590,190 620,280 C650,370 610,500 520,530 C430,560 330,530 290,460 C250,390 280,300 350,270 C400,250 420,290 440,250Z"
            />
            {/* Primary blob */}
            <path
              className="wcu-blob-path"
              d="M400,280 C460,180 560,160 600,260 C640,360 600,480 520,520 C440,560 340,540 280,480 C220,420 240,340 300,290 C340,260 370,300 400,280Z"
            />
          </svg>

          <img
            src={WhyChooseUsImg}
            alt="Custom personalized products by PrintE"
            className="relative z-[1] w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[800px] rounded-2xl object-contain animate-wcu-img-float"
            loading="lazy"
          />
        </motion.div>

        {/* ══════ RIGHT: Text Content ══════ */}
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        >
          {/* 1. Label with ::before line */}
          <p className="wcu-label inline-flex items-center gap-3 text-[#f2c41a] text-[12px] lg:text-[13px] xl:text-[16px] font-extrabold tracking-[2.5px] uppercase mb-3 lg:mb-4">
            Why Choose Us
          </p>

          {/* 2. Heading */}
          <h2 className=" md:text-2xl lg:text-3xl xl:text-4xl font-bowlby text-[#111] leading-tight mb-4 lg:mb-5">
            Thoughtful Products, Made Just for You.
          </h2>

          {/* 3. Description */}
          <p className="text-[14px] xl:text-[16px] sm:leading-6 text-gray-500 mb-6 lg:mb-8  mx-auto lg:mx-0">
            <span>
              At Printe, we believe every product tells a story. That&apos;s why we
              let you personalize your favourite products with names, photos,
              quotes and more — making them truly one of a kind.
            </span>
          </p>

          {/* 4. Feature icons (Mapped) */}
          <div className="flex  gap-4 sm:gap-6 lg:gap-5 mb-6 lg:mb-9 justify-center lg:justify-start max-w-[800px] mx-auto lg:mx-0">
            {FEATURES_DATA.map((item) => (
              <motion.div
                key={item.id}
                className="FeatureIconContainer flex items-center gap-2.5 "
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#f2c41a] flex items-center justify-center hover:-translate-y-1 transition-all duration-300 shrink-0">
                  {item.icon}
                </div>
                <span className="FeatureIconText text-[13px] xl:text-[14px] font-bold text-left text-[#222] max-w-[100px]">
                  {item.title}
                </span>
              </motion.div>
            ))}
          </div>

          {/* 5. CTA button */}
          <div className="flex justify-center lg:justify-start">
            <a
              href="https://wa.me/919585610000?text=Hello%2C%20I%20need%20assistance%20regarding%20a%20service.%20Can%20you%20help%20me%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-start hover:text-[#121621] w-fit text-nowrap"
            >
              <button className="inline-flex items-center gap-2.5 py-2 px-5 lg:py-3 lg:px-7 border-2 border-[#f2c41a] rounded-full bg-transparent text-[#f2c41a] text-[15px] font-semibold tracking-wide cursor-pointer transition-all duration-300 hover:bg-[#f2c41a] hover:text-[#111] group">
                Feel Free to Contact
                <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
