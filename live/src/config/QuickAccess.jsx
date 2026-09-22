import React from "react";
import "./quickaccess.css";

const QuickAccess = () => {
  const items = [
    "SIGNAGES",
    "PREMIUM GIFTS",
    "CORPORATE GIFTS",
    "CUSTOMIZED BAGS",
    "ID CARDS & LAYARDS",
    "BUSINESS CARDS",
    "WALL FRAMES",
    "CALENDERS & DIARIES",
    "STANDEES",
    "LABELS & STICKERS",
    "MUG PRINTING",
    "BROCHURES",
    "DIGITAL DISPLAY",
    "FLYERS",
    "PREMIUM BOXES",
  ];

  return (
    <div className="w-full overflow-hidden mt-4 sm:mt-6">
      <div className="scrolling-banner-container !mb-0">
        {/* Top scrolling layer (moves left) */}
        <div className="scrolling-layer top-layer py-[10px] md:py-[13px]">
          <div className="scrolling-content">
            {[...items, ...items, ...items].map((item, index) => (
              <React.Fragment key={index}>
                <span className="scrolling-item text-[12px] md:text-[15px] lg:text-[18px]">{item}</span>
                <span className="separator">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom scrolling layer (moves right) */}
        <div className="scrolling-layer bottom-layer py-[10px] md:py-[13px]">
          <div className="scrolling-content reverse">
            {[...items, ...items, ...items].map((item, index) => (
              <React.Fragment key={index}>
                <span className="scrolling-item text-[12px] md:text-[15px] lg:text-[18px]">{item}</span>
                <span className="separator">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;

export const WGDesigns = () => null;
