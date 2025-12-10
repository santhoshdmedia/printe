import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useGesture } from "@use-gesture/react";
import printeLogo from "../assets/logo/without_bg.png";

// First, import your local images at the top of the file
import image1 from "../assets/reactions/1.jpg";
import image2 from "../assets/reactions/2.jpg";
import image3 from "../assets/reactions/3.jpg";
import image4 from "../assets/reactions/4.jpg";
import image5 from "../assets/reactions/5.jpg";
import image6 from "../assets/reactions/6.jpg";
import image7 from "../assets/reactions/7.jpg";
import image8 from "../assets/reactions/8.jpg";
import image9 from "../assets/reactions/9.jpg";
import image10 from "../assets/reactions/10.jpg";

const DEFAULT_IMAGES = [
  {
    src: image1,
    alt: "Abstract art",
  },
  {
    src: image2,
    alt: "Modern sculpture",
  },
  {
    src: image3,
    alt: "Digital artwork",
  },
  {
    src: image4,
    alt: "Contemporary art",
  },
  {
    src: image5,
    alt: "Geometric pattern",
  },
  {
    src: image6,
    alt: "Textured surface",
  },
  {
    src: image7,
    alt: "Social media image",
  },
  {
    src: image8,
    alt: "Social media image",
  },
  {
    src: image9,
    alt: "Social media image",
  },
  {
    src: image10,
    alt: "Social media image",
  },
  {
    src: image1,
    alt: "Abstract art",
  },
  {
    src: image1,
    alt: "Abstract art",
  },
  {
    src: image10,
    alt: "Social media image",
  },
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 34,
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: "", alt: "" }));
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
    );
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === "string") {
      return { src: image, alt: "" };
    }
    return { src: image.src || "", alt: image.alt || "" };
  });

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length]
  );

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

import { addintro } from "../helper/api_helper";

export  function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.8,
  fitBasis = "auto",
  minRadius = 1600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = "#000",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = "400px",
  openedImageHeight = "400px",
  imageBorderRadius = "45px",
  openedImageBorderRadius = "45px",
  grayscale = false,
  autoRotate = true,
  autoRotateSpeed = 150,
  autoRotateDirection = "right",
  // New prop for countdown from parent
  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 },
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const pointerTypeRef = useRef("mouse");
  const tapTargetRef = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const autoRotationRAF = useRef(null);
  const isUserInteractingRef = useRef(false);
  const lastInteractionTimeRef = useRef(0);
  const interactionTimeoutRef = useRef(null);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  // Auto-rotation animation
  const startAutoRotation = useCallback(() => {
    if (!autoRotate || !sphereRef.current) return;

    const directionMultiplier = autoRotateDirection === "left" ? -1 : 1;
    const rotationSpeed = 360 / autoRotateSpeed / 60;

    const animate = () => {
      if (isUserInteractingRef.current) {
        autoRotationRAF.current = requestAnimationFrame(animate);
        return;
      }

      const currentRotation = rotationRef.current;
      const newY = wrapAngleSigned(
        currentRotation.y + rotationSpeed * directionMultiplier
      );

      rotationRef.current = {
        x: currentRotation.x,
        y: newY,
      };

      applyTransform(currentRotation.x, newY);
      autoRotationRAF.current = requestAnimationFrame(animate);
    };

    stopAutoRotation();
    autoRotationRAF.current = requestAnimationFrame(animate);
  }, [autoRotate, autoRotateSpeed, autoRotateDirection]);

  const stopAutoRotation = useCallback(() => {
    if (autoRotationRAF.current) {
      cancelAnimationFrame(autoRotationRAF.current);
      autoRotationRAF.current = null;
    }
  }, []);

  const handleUserInteraction = useCallback(() => {
    isUserInteractingRef.current = true;
    lastInteractionTimeRef.current = Date.now();

    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
      lastInteractionTimeRef.current = 0;
      if (autoRotate) {
        startAutoRotation();
      }
    }, 0);
  }, [autoRotate, startAutoRotation]);

  const handleNotifyClick = () => {
    setIsFlipped(true);
  };

  const handleCloseForm = () => {
    setIsFlipped(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
    });
    setIsSubmitted(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email) {
      console.log("Form submitted:", formData);
      const result=await addintro(formData)
      setIsSubmitted(true);
      // Clear form after 3 seconds and flip back
      setTimeout(() => {
        setFormData({
          name: "",
          phone: "",
          email: "",
        });
        setIsSubmitted(false);
        setIsFlipped(false);
      }, 10000);
    }
  };

  useEffect(() => {
    if (autoRotate) {
      startAutoRotation();
    } else {
      stopAutoRotation();
    }

    return () => {
      stopAutoRotation();
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [autoRotate, startAutoRotation, stopAutoRotation]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = w;
          break;
        case "height":
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${lockedRadiusRef.current}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty(
        "--image-filter",
        grayscale ? "grayscale(1)" : "none"
      );
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx, vy) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(
          rotationRef.current.x - vY / 200,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        stopInertia();
        stopAutoRotation();
        handleUserInteraction();

        pointerTypeRef.current = event.pointerType || "mouse";
        if (pointerTypeRef.current === "touch") event.preventDefault();
        if (pointerTypeRef.current === "touch") lockScroll();
        draggingRef.current = true;
        cancelTapRef.current = false;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: event.clientX, y: event.clientY };
        const potential = event.target.closest?.(".item__image");
        tapTargetRef.current = potential || null;
      },
      onDrag: ({
        event,
        last,
        velocity: velArr = [0, 0],
        direction: dirArr = [0, 0],
        movement,
      }) => {
        if (!draggingRef.current || !startPosRef.current) return;

        if (pointerTypeRef.current === "touch") event.preventDefault();
        handleUserInteraction();

        const dxTotal = event.clientX - startPosRef.current.x;
        const dyTotal = event.clientY - startPosRef.current.y;

        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }

        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

        const cur = rotationRef.current;
        if (cur.x !== nextX || cur.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          let isTap = false;

          if (startPosRef.current) {
            const dx = event.clientX - startPosRef.current.x;
            const dy = event.clientY - startPosRef.current.y;
            const dist2 = dx * dx + dy * dy;
            const TAP_THRESH_PX = pointerTypeRef.current === "touch" ? 10 : 6;
            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) {
              isTap = true;
            }
          }

          let [vMagX, vMagY] = velArr;
          const [dirX, dirY] = dirArr;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;

          if (
            !isTap &&
            Math.abs(vx) < 0.001 &&
            Math.abs(vy) < 0.001 &&
            Array.isArray(movement)
          ) {
            const [mx, my] = movement;
            vx = (mx / dragSensitivity) * 0.02;
            vy = (my / dragSensitivity) * 0.02;
          }

          if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
            startInertia(vx, vy);
          }
          startPosRef.current = null;
          cancelTapRef.current = !isTap;

          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
          if (pointerTypeRef.current === "touch") unlockScroll();
        }
      },
      onDragEnd: () => {
        if (autoRotate) {
          handleUserInteraction();
        }
      },
    },
    { target: mainRef, eventOptions: { passive: false } }
  );

  useEffect(() => {
    return () => {
      document.body.classList.remove("dg-scroll-lock");
      stopAutoRotation();
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    
    .sphere-root * {
      box-sizing: border-box;
    }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 500ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)))) 
                 translateZ(var(--radius));
    }
    
    @media (max-aspect-ratio: 1/1) {
      .viewer-frame {
        height: auto !important;
        width: 100% !important;
      }
    }

    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }

    /* Flip Container Styles */
    .flip-container {
      perspective: 1000px;
      width: 100%;
      max-width: 800px;
      height: 60%;
      min-height: 600px;
    }

    .flipper {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.8s;
      transform-style: preserve-3d;
    }

    .flipper.flipped {
      transform: rotateY(180deg);
    }

    .front, .back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 30px;
      overflow: hidden;
    }

    .front {
      background: #dbb32bbd;
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: white;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .back {
      background: #dbb32bbd;
      backdrop-filter: blur(10px);
      transform: rotateY(180deg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: white;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .brand-logo {
      margin-bottom: 20px;
      text-align: center;
    }

    .brand-logo img {
      height: max-content;
      width: 260px;
      margin: 0 auto;
    }

    .coming-soon-text {
      font-size: 2.8rem;
      font-weight: 800;
      margin-bottom: 40px;
      line-height: 1.2;
      text-shadow: 0 2px 10px #ffe86ac4;
      color: #181818;
    }

    .countdown-container {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .countdown-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
      border: 2px solid #ffffff;
      padding: 1rem;
      border-radius: 1.2rem;
    }

    .countdown-value {
      font-size: 3rem;
      font-weight: 900;
      line-height: 1;
      background: linear-gradient(8deg, #fff, #fffbfb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .countdown-label {
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 10px;
      opacity: 0.9;
      letter-spacing: 1px;
    }

    .stay-tuned {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 30px;
      letter-spacing: 1px;
      line-height: 1.2;
      text-shadow: 0 2px 10px #ffe86a;
      color: #000;
    }

    .notify-button {
      background: linear-gradient(45deg, #181818, #181818);
      color: white;
      border: none;
      padding: 18px 50px;
      font-size: 1.2rem;
      font-weight: 600;
      border-radius: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }

    .notify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px #f7f7f799;
    }

    .notify-button:active {
      transform: translateY(0);
    }

    /* Form Styles */
    .form-title {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #181818;
      line-height: 1.3;
      text-shadow: 0 2px 10px #ffe86ac4;
    }

    .form-subtitle {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.5;
      color: #181818;
    }

    .popup-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .form-input {
      padding: 1rem 1.2rem;
      border-radius: 0.8rem;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.8);
      color: #181818;
      font-size: 1rem;
      transition: all 0.3s;
      width: 100%;
    }

    .form-input:focus {
      outline: none;
      border-color: #181818;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 0 0 3px rgba(24, 24, 24, 0.1);
    }

    .form-input::placeholder {
      color: rgba(0, 0, 0, 0.6);
    }

    .form-submit {
      background: linear-gradient(45deg, #181818, #181818);
      color: white;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.3s;
      letter-spacing: 1px;
      margin-top: 1rem;
      width: 100%;
    }

    .form-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .form-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .form-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
      z-index: 10;
    }

    .form-close:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    .success-message {
      font-size: 1.1rem;
      color: #000;
      font-weight: 600;
      margin-top: 1rem;
      animation: fadeIn 0.5s ease;
      text-align: center;
      border-radius: 0.8rem;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .coming-soon-text {
        font-size: 1.2rem;
      }

      .sphere-root {
        --tile-radius: 8px;
      }

      .item__image {
        inset: 0.5%;
      }
    
      .countdown-value {
        font-size: 2.5rem;
      }
      
      .countdown-item {
        min-width: 80px;
        padding: 0.8rem;
        border:none;
      }
      
      .stay-tuned {
        font-size: 1.3rem;
      }
      
      .flip-container {
        min-height: 500px;
      }
      
      .form-title {
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
      }
        
      .sphere-item {
        width: 100px;
        height: 100px;
      }

      .item__image {
        width: 220px;
        height: 220px;
      }

      .item__image img {
        width: 250px;
        height: 250px;
        object-fit: cover;
      }

      .form-subtitle {
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
      }

      .form-submit {
        padding: 10px 8px;
        font-size: 1rem;
        width: max-content;
        margin: 0 auto;
      }
      
      .form-input {
        padding: 0.8rem 1rem;
      }
      
      .brand-logo img {
        width: 150px;
      }
    }

    @media (max-width: 480px) {
      .coming-soon-text {
        font-size: 1.2rem;
        margin-bottom: 1rem;
      }
      
      .brand-logo {
        margin-bottom: 10px;
      }
      
      .countdown-container {
        gap: 10px;
        margin-bottom: 0.8rem;
      }
      
      .countdown-item {
        min-width: 50px;
        padding: 0.5rem;
      }
      
      .countdown-value {
        font-size: 1.8rem;
      }

      .front, .back {
        padding: 1rem;
      }

      .form-close {
        top: 0.5rem;
        width: 30px;
        height: 30px;
      }
      
      .countdown-label {
        font-size: 1rem;
      }
      
      .notify-button {
        padding: 15px 10px;
        font-size: 1rem;
      }
      
      .flip-container {
        min-height: 400px;
        height: 55%;
        margin:0.5rem;
      }
    }
  `;

  // Format numbers to always show 2 digits
  const formatNumber = (num) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full"
        style={{
          ["--segments-x"]: segments,
          ["--segments-y"]: segments,
          ["--overlay-blur-color"]: overlayBlurColor,
          ["--tile-radius"]: imageBorderRadius,
          ["--enlarge-radius"]: openedImageBorderRadius,
          ["--image-filter"]: grayscale ? "grayscale(1)" : "none",
        }}
      >
        <main
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
          style={{
            touchAction: "none",
            WebkitUserSelect: "none",
          }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  data-src={it.src}
                  data-alt={it.alt}
                  data-offset-x={it.x}
                  data-offset-y={it.y}
                  data-size-x={it.sizeX}
                  data-size-y={it.sizeY}
                  style={{
                    ["--offset-x"]: it.x,
                    ["--offset-y"]: it.y,
                    ["--item-size-x"]: it.sizeX,
                    ["--item-size-y"]: it.sizeY,
                    top: "-999px",
                    bottom: "-999px",
                    left: "-999px",
                    right: "-999px",
                  }}
                >
                  <div
                    className="item__image absolute block overflow-hidden bg-gray-200 transition-transform duration-300"
                    style={{
                      inset: "10px",
                      borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                      backfaceVisibility: "hidden",
                      cursor: "default",
                    }}
                  >
                    <img
                      src={it.src}
                      draggable={false}
                      alt={it.alt}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        backfaceVisibility: "hidden",
                        filter: `var(--image-filter, ${
                          grayscale ? "grayscale(1)" : "none"
                        })`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`,
            }}
          />

          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blurColor, ${overlayBlurColor}) 90%)`,
              backdropFilter: "blur(3px)",
            }}
          />

          <div
            className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
            }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
            }}
          />

          {/* Flip Container - positioned above everything */}
          <div className="content-overlay absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="flip-container pointer-events-auto">
              <div className={`flipper ${isFlipped ? "flipped" : ""}`}>
                {/* Front side - Main Content */}
                <div className="front">
                  <div className="brand-logo">
                    <img src={printeLogo} alt="Brand Logo" />
                  </div>
                  <h1 className="coming-soon-text">
                    Something Amazing is Coming !
                  </h1>

                  <div className="countdown-container">
                    <div className="countdown-item">
                      <div className="countdown-value">
                        {formatNumber(countdown.days)}
                      </div>
                      <div className="countdown-label">Days</div>
                    </div>
                    <div className="countdown-item">
                      <div className="countdown-value">
                        {formatNumber(countdown.hours)}
                      </div>
                      <div className="countdown-label">Hours</div>
                    </div>
                    <div className="countdown-item">
                      <div className="countdown-value">
                        {formatNumber(countdown.minutes)}
                      </div>
                      <div className="countdown-label">Minutes</div>
                    </div>
                    <div className="countdown-item">
                      <div className="countdown-value">
                        {formatNumber(countdown.seconds)}
                      </div>
                      <div className="countdown-label">Seconds</div>
                    </div>
                  </div>

                  <div className="stay-tuned">Stay Tuned</div>

                  <button className="notify-button" onClick={handleNotifyClick}>
                    Notify Me
                  </button>
                </div>

                {/* Back side - Form */}
                <div className="back">
                  <button className="form-close" onClick={handleCloseForm}>
                    ✕
                  </button>

                  <h2 className="form-title">
                    You're One Step Away From Something Special!
                  </h2>

                  <p className="form-subtitle">
                    Drop Your Details Below To Receive An Exclusive Surprise
                    Coupon When We Launch!
                  </p>

                  <form className="popup-form" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />

                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="Your Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />

                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="Your Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />

                    <button
                      type="submit"
                      className="form-submit"
                      disabled={isSubmitted}
                    >
                      {isSubmitted ? "Thank You!" : "Claim Your Gift"}
                    </button>

                    {isSubmitted && (
                      <div className="success-message">
                        Thank you! We'll notify you when we launch.
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}