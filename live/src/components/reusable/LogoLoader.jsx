import { ImageHelper } from "../../helper/ImageHelper";

/**
 * LogoLoader
 * -----------------------------------------------------------------------
 * Branded loading indicator: the Printe logo centered inside a spinning
 * ring, built with pure CSS (no animation library) so it stays cheap to
 * render wherever Suspense/auth-gating needs a fallback.
 *
 * Props:
 *  - fullScreen (bool, default true) — cover the viewport (route-level /
 *    app-boot loading). Pass false for inline/section-level use so it
 *    doesn't force a full-page overlay for small content chunks.
 *  - size (number, default 72) — ring diameter in px.
 *  - label (string, optional) — small text under the logo, e.g. "Loading…".
 */
const LogoLoader = ({ fullScreen = true, size = 780, label }) => {
  const logoSize = Math.round(size * 2.5);

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* <span
          className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-sky-600 animate-spin"
          aria-hidden="true"
        /> */}
        <img
          src={ImageHelper.pdf_logo}
          alt="Printe"
          width={logoSize}
          height={logoSize}
          className="relative rounded-full object-contain animate-pulse"
          style={{ width: logoSize, height: logoSize }}
        />
      </div>
      {/* {label && <p className="text-sm text-gray-500">{label}</p>} */}
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div
      className="w-full min-h-[40vh] flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
};

export default LogoLoader;
