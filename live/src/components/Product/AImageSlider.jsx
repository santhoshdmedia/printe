import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Tooltip, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import {
  HeartOutlined,
  HeartFilled,
  LinkOutlined,
  ZoomInOutlined,
  DeleteOutlined,
  UploadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { IoShareSocial } from "react-icons/io5";
import DividerCards from "../cards/DividerCards";

// ─── Config ───────────────────────────────────────────────────────────────────
const SIZES = [
  { label: "9x12",  w: 9,  h: 12 },
  { label: "12x16", w: 12, h: 16 },
  { label: "12x18", w: 12, h: 18 },
  { label: "15x21", w: 15, h: 21 },
  { label: "20x30", w: 20, h: 30 },
  { label: "23x35", w: 23, h: 35 },
];

const TEXT_COLORS = [
  "#000000","#cc2222","#228822","#2244cc",
  "#cc8822","#882288","#228888","#22aacc",
  "#ee4444","#ddaa22","#22cc44","#4444ee",
  "#cc44aa","#44cccc","#88cc22","#4488cc",
];

const FONT_STYLES = [
  "Audiowide","Bebas Neue","Pacifico","Oswald",
  "Lobster","Raleway","Playfair Display","Dancing Script",
  "Montserrat","Roboto Slab",
];

// ─── TextToolPopover ──────────────────────────────────────────────────────────
const TextToolPopover = ({ onClose, onApply, existingText }) => {
  const [text,  setText]  = useState(existingText?.text  || "");
  const [color, setColor] = useState(existingText?.color || "#000000");
  const [font,  setFont]  = useState(existingText?.font  || "Audiowide");

  const handleSave = () => {
    if (text.trim()) onApply({ text: text.trim(), color, font });
    onClose();
  };

  return (
    <div
      className="absolute top-12 left-0  bg-white shadow-2xl border border-gray-200"
      style={{ width: 320, padding: "14px 16px", borderRadius: 12 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-center mb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key==="Enter") handleSave(); if (e.key==="Escape") onClose(); }}
          placeholder="Type your text…"
          className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400"
          style={{ fontFamily: font, color, borderRadius: 8 }}
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700 transition-colors"
          style={{ borderRadius: 8 }}
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-gray-100"
          style={{ borderRadius: 8 }}
        >
          <DeleteOutlined style={{ fontSize: 14 }} />
        </button>
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Text Color</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TEXT_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              background: c, width: 24, height: 24, borderRadius: 4,
              border: color === c ? "2px solid #374151" : "2px solid transparent",
            }}
          />
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Font Style</p>
      <select
        value={font}
        onChange={(e) => setFont(e.target.value)}
        className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-400 bg-white"
        style={{ fontFamily: font, borderRadius: 8 }}
      >
        {FONT_STYLES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>
    </div>
  );
};

// ─── 3D Preview Modal ─────────────────────────────────────────────────────────
// Full-width canvas (no side margin), white frosted-glass back, 4 corner metal tabs
const ThreeDPreviewModal = ({ onClose, croppedImage, panelW, panelH, initialThickness }) => {
  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const angleYRef  = useRef(0.32);
  const angleXRef  = useRef(0.10);
  const autoRotRef = useRef(true);
  const dragRef    = useRef(null);

  const [thickness, setThickness] = useState(initialThickness === "5mm" ? "5mm" : "3mm");
  const thicknessRef = useRef(thickness);
  useEffect(() => { thicknessRef.current = thickness; }, [thickness]);

  const imgRef       = useRef(null);
  const imgLoadedRef = useRef(false);

  useEffect(() => {
    if (croppedImage) {
      const img = new Image();
      img.onload = () => { imgLoadedRef.current = true; };
      img.src = croppedImage;
      imgRef.current = img;
    }
  }, [croppedImage]);

  const aspect = panelH > 0 && panelW > 0 ? panelH / panelW : 12 / 9;

  // Resize canvas to fill the container
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W = container.clientWidth  || 680;
    const H = container.clientHeight || 400;
    canvas.width  = W;
    canvas.height = H;

    const draw = () => {
      const ctx     = canvas.getContext("2d");
      const t       = thicknessRef.current;
      const depthPx = t === "5mm" ? 12 : 7;

      // ── White frosted-glass background ──────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // White base
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Very subtle grid pattern to suggest glass / acrylic texture
      ctx.strokeStyle = "rgba(200,215,230,0.25)";
      ctx.lineWidth   = 0.5;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Soft radial shimmer (glass-like centre glow)
      const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.65);
      grd.addColorStop(0,   "rgba(255,255,255,0.70)");
      grd.addColorStop(0.5, "rgba(240,246,252,0.30)");
      grd.addColorStop(1,   "rgba(220,235,248,0.10)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

    
      // ── 3D Panel ─────────────────────────────────────────────────────────
      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);

      // Panel fits inside the canvas nicely
      const maxPanelW = W * 0.52;
      const maxPanelH = H * 0.80;
      let baseW = maxPanelW;
      let baseH = baseW * aspect;
      if (baseH > maxPanelH) {
        baseH = maxPanelH;
        baseW = baseH / aspect;
      }

      const cx = W / 2;
      const cy = H / 2;

      const faceW = baseW * Math.abs(cosY);
      const faceH = baseH * Math.abs(cosX);

      const fLeft  = cx - faceW / 2;
      const fRight = cx + faceW / 2;
      const fTop   = cy - faceH / 2;
      const fBot   = cy + faceH / 2;

      // ── Side face ──
      if (sinY > 0) {
        const sideW = depthPx * sinY;
        ctx.beginPath();
        ctx.moveTo(fRight,         fTop);
        ctx.lineTo(fRight + sideW, fTop + sideW * 0.12);
        ctx.lineTo(fRight + sideW, fBot - sideW * 0.12);
        ctx.lineTo(fRight,         fBot);
        ctx.closePath();
        const sg = ctx.createLinearGradient(fRight, 0, fRight + sideW, 0);
        sg.addColorStop(0, t === "5mm" ? "rgba(140,185,220,0.90)" : "rgba(175,205,228,0.75)");
        sg.addColorStop(1, t === "5mm" ? "rgba(100,155,200,0.70)" : "rgba(145,185,215,0.55)");
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.strokeStyle = "rgba(130,175,215,0.55)";
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      // ── Left side (when sinY < 0) ──
      if (sinY < 0) {
        const sideW = depthPx * Math.abs(sinY);
        ctx.beginPath();
        ctx.moveTo(fLeft,          fTop);
        ctx.lineTo(fLeft - sideW,  fTop + sideW * 0.12);
        ctx.lineTo(fLeft - sideW,  fBot - sideW * 0.12);
        ctx.lineTo(fLeft,          fBot);
        ctx.closePath();
        ctx.fillStyle = "rgba(175,205,228,0.75)";
        ctx.fill();
        ctx.strokeStyle = "rgba(130,175,215,0.55)";
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      // ── Front face ──
      if (faceW > 2 && faceH > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(fLeft, fTop, faceW, faceH);
        ctx.clip();

        const img = imgRef.current;
        if (img && imgLoadedRef.current) {
          ctx.drawImage(img, fLeft, fTop, faceW, faceH);
        } else {
          // Placeholder — white acrylic look
          ctx.fillStyle = "#eef3f8";
          ctx.fillRect(fLeft, fTop, faceW, faceH);
          ctx.fillStyle = "rgba(0,0,0,0.14)";
          ctx.font = `bold ${Math.round(faceW * 0.09)}px sans-serif`;
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Your Photo", cx, cy);
        }

        // Acrylic glass shimmer overlay
        const sh = ctx.createLinearGradient(fLeft, fTop, fRight, fBot);
        sh.addColorStop(0,    "rgba(255,255,255,0.38)");
        sh.addColorStop(0.25, "rgba(255,255,255,0.06)");
        sh.addColorStop(0.75, "rgba(255,255,255,0.0)");
        sh.addColorStop(1,    "rgba(255,255,255,0.12)");
        ctx.fillStyle = sh;
        ctx.fillRect(fLeft, fTop, faceW, faceH);

        // Top edge bright highlight
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(fLeft, fTop, faceW, 3);
        // Left edge
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(fLeft, fTop, 2.5, faceH);

        ctx.restore();

        // Sharp border
        ctx.strokeStyle = "rgba(160,195,225,0.80)";
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(fLeft, fTop, faceW, faceH);

       
      }

      // Auto-rotate
      if (autoRotRef.current) {
        angleYRef.current += 0.006;
        if (angleYRef.current > Math.PI * 2) angleYRef.current -= Math.PI * 2;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [aspect]);

  // Drag-to-rotate
  const startDrag = useCallback((cx, cy) => {
    autoRotRef.current = false;
    dragRef.current = {
      startX: cx, startY: cy,
      startAngleY: angleYRef.current,
      startAngleX: angleXRef.current,
    };
  }, []);

  const moveDrag = useCallback((cx, cy) => {
    if (!dragRef.current) return;
    const dx = cx - dragRef.current.startX;
    const dy = cy - dragRef.current.startY;
    angleYRef.current = dragRef.current.startAngleY + dx * 0.009;
    angleXRef.current = Math.max(-0.5, Math.min(0.5,
      dragRef.current.startAngleX + dy * 0.005
    ));
  }, []);

  const endDrag = useCallback(() => { dragRef.current = null; }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal — NO rounded corners, NO side margin, full-width canvas */}
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: "min(720px, 96vw)", borderRadius: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
          style={{ borderRadius: 0 }}
        >
          <span className="text-sm font-semibold text-gray-700">3D Preview</span>
          <div className="flex items-center gap-2">
            {["3mm", "5mm"].map((t) => (
              <button
                key={t}
                onClick={() => setThickness(t)}
                className="px-3 py-1 text-xs font-semibold border transition-colors"
                style={{
                  borderRadius: 0,
                  background:  thickness === t ? "#f2c41a" : "#fff",
                  color:       thickness === t ? "#fff"    : "#f2c41a",
                  borderColor: thickness === t ? "#f2c41a" : "#e5e7eb",
                }}
              >
                {t}
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-2 px-4 py-1.5 border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              style={{ borderRadius: 0 }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Canvas area — full width, NO padding/margin on sides */}
        <div
          ref={containerRef}
          className="relative select-none overflow-hidden"
          style={{
            height: 480,
            width: "100%",
            cursor: "grab",
            padding: 0,
            margin: 0,
          }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e)  => { e.preventDefault(); moveDrag(e.touches[0].clientX,  e.touches[0].clientY); }}
          onTouchEnd={endDrag}
        >
          <canvas
            ref={canvasRef}
            style={{
              display:       "block",
              width:         "100%",
              height:        "100%",
              pointerEvents: "none",
            }}
          />
          {/* Drag hint */}
          <div className="absolute bottom-3 left-4 text-gray-400 text-xs select-none pointer-events-none">
            Drag to rotate
          </div>
          {/* 3D Beta badge */}
          <div
            className="absolute bottom-3 right-4 flex items-center gap-1 text-gray-500 text-xs px-2 py-0.5 pointer-events-none"
            style={{ background: "rgba(0,0,0,0.06)", borderRadius: 0 }}
          >
            ⟳ 3D (Beta)
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main AImageSlider ────────────────────────────────────────────────────────
const AImageSlider = ({
  imageList = [],
  data = {},
  onDesignChange,
  selectedSize:      externalSize,
  selectedThickness: externalThickness,
  onSizeChange,
  onThicknessChange,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuth } = useSelector((s) => s.authSlice);

  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [userImage,      setUserImage]      = useState(null);
  const [croppedDataUrl, setCroppedDataUrl] = useState(null);
  const [panOffset,      setPanOffset]      = useState({ x: 0, y: 0 });
  const [zoom,           setZoom]           = useState(100);
  const [isDragging,     setIsDragging]     = useState(false);
  const dragStart = useRef(null);

  const [orientation,       setOrientation]       = useState("portrait");
  const [showTextTool,      setShowTextTool]      = useState(false);
  const [textOverlay,       setTextOverlay]       = useState(null);
  const [selectedSize,      setSelectedSize]      = useState(externalSize      || "9x12");
  const [selectedThickness, setSelectedThickness] = useState(externalThickness || "3mm");
  const [show3DPreview,     setShow3DPreview]     = useState(false);
  const [isFav,             setIsFav]             = useState(false);
  const [showShareModal,    setShowShareModal]    = useState(false);

  const processedImages = useMemo(() => {
    return (imageList || [])
      .map((img) => {
        const url = typeof img === "string" ? img : img?.path || img?.url || "";
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${window.location.origin}${url.startsWith("/") ? url : "/" + url}`;
      })
      .filter(Boolean);
  }, [imageList]);

  useEffect(() => { if (externalSize)      setSelectedSize(externalSize);           }, [externalSize]);
  useEffect(() => { if (externalThickness) setSelectedThickness(externalThickness); }, [externalThickness]);
  useEffect(() => { setIsFav(user?.wish_list?.includes(data?.seo_url) ?? false); },    [user, data?.seo_url]);

  const curSizeObj = SIZES.find((s) => s.label === selectedSize) || SIZES[0];

  // ── Panel dims inside the fixed-square wrapper ──
  // The outer div is always a square. The acrylic panel is centeyellow inside it
  // at the correct aspect ratio for the selected size + orientation.
  const getPanelDims = useCallback(() => {
    const container = containerRef.current;
    const sq = container?.clientWidth || 440;
    const sW = orientation === "portrait" ? curSizeObj.w : curSizeObj.h;
    const sH = orientation === "portrait" ? curSizeObj.h : curSizeObj.w;
    const ratio = sH / sW;
    let pw, ph;
    if (ratio >= 1) {
      ph = sq;
      pw = Math.round(sq / ratio);
    } else {
      pw = sq;
      ph = Math.round(sq * ratio);
    }
    return { sq, pw, ph };
  }, [curSizeObj, orientation]);

  // ── Draw ──
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { sq, pw, ph } = getPanelDims();

    canvas.width  = sq;
    canvas.height = sq;
    const ctx = canvas.getContext("2d");

    // Square outer background — light gray
    ctx.fillStyle = "#f0f2f4";
    ctx.fillRect(0, 0, sq, sq);

    const px = (sq - pw) / 2;
    const py = (sq - ph) / 2;

    // ── Panel clip — sharp rect, NO border-radius ──
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();

    if (userImage) {
      const scaleBase = Math.min(pw / userImage.naturalWidth, ph / userImage.naturalHeight);
      const scale     = scaleBase * (zoom / 100);
      const dw = userImage.naturalWidth  * scale;
      const dh = userImage.naturalHeight * scale;
      const dx = px + (pw - dw) / 2 + panOffset.x;
      const dy = py + (ph - dh) / 2 + panOffset.y;
      ctx.drawImage(userImage, dx, dy, dw, dh);

      // Acrylic shimmer
      const sh = ctx.createLinearGradient(px, py, px + pw, py + ph);
      sh.addColorStop(0,   "rgba(255,255,255,0.18)");
      sh.addColorStop(0.4, "rgba(255,255,255,0.0)");
      sh.addColorStop(1,   "rgba(255,255,255,0.07)");
      ctx.fillStyle = sh;
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = "rgba(255,255,255,0.38)";
      ctx.fillRect(px, py, pw, 3);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(px, py, 3, ph);
    } else {
      ctx.fillStyle = "#e2eaf0";
      ctx.fillRect(px, py, pw, ph);

      ctx.strokeStyle = "#b8ccd8";
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(px + 12, py + 12, pw - 24, ph - 24);
      ctx.setLineDash([]);

      const bw = Math.round(pw * 0.48);
      const bh = Math.round(ph * 0.20);
      const bx = px + (pw - bw) / 2;
      const by = py + (ph - bh) / 2;
      ctx.fillStyle = "#f2c41a";
      ctx.fillRect(bx, by, bw, bh);   // sharp rect, NO rounded corners
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.round(bh * 0.33)}px sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SELECT", px + pw / 2, by + bh * 0.36);
      ctx.fillText("PHOTO",  px + pw / 2, by + bh * 0.70);
    }

    ctx.restore();

    // Panel border — sharp
    ctx.strokeStyle = "#c8d8e4";
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(px, py, pw, ph);

    // Text overlay
    if (textOverlay?.text) {
      ctx.save();
      const fontSize = Math.round(pw * 0.08);
      ctx.font         = `bold ${fontSize}px "${textOverlay.font}", sans-serif`;
      ctx.fillStyle    = textOverlay.color;
      ctx.textAlign    = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor  = "rgba(0,0,0,0.5)";
      ctx.shadowBlur   = 4;
      ctx.fillText(textOverlay.text, px + pw / 2, py + ph - 12);
      ctx.restore();
    }

    // Standoff screws
  
  }, [userImage, panOffset, zoom, textOverlay, getPanelDims]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => drawCanvas());
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawCanvas]);

  // File load
  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { setUserImage(img); setPanOffset({ x: 0, y: 0 }); setZoom(100); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Pan drag
  const handleCanvasMouseDown = useCallback((e) => {
    if (!userImage) { fileInputRef.current?.click(); return; }
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: panOffset.x, oy: panOffset.y };
    e.preventDefault();
  }, [userImage, panOffset]);

  const handleCanvasTouchStart = useCallback((e) => {
    if (!userImage) { fileInputRef.current?.click(); return; }
    const t = e.touches[0];
    setIsDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: panOffset.x, oy: panOffset.y };
    e.preventDefault();
  }, [userImage, panOffset]);

  useEffect(() => {
    const onMove = (cx, cy) => {
      if (!isDragging || !dragStart.current) return;
      setPanOffset({ x: dragStart.current.ox + (cx - dragStart.current.mx), y: dragStart.current.oy + (cy - dragStart.current.my) });
    };
    const mm = (e) => onMove(e.clientX, e.clientY);
    const mu = () => setIsDragging(false);
    const tm = (e) => { onMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); };
    const tu = () => setIsDragging(false);
    document.addEventListener("mousemove",  mm);
    document.addEventListener("mouseup",    mu);
    document.addEventListener("touchmove",  tm, { passive: false });
    document.addEventListener("touchend",   tu);
    return () => {
      document.removeEventListener("mousemove",  mm);
      document.removeEventListener("mouseup",    mu);
      document.removeEventListener("touchmove",  tm);
      document.removeEventListener("touchend",   tu);
    };
  }, [isDragging]);

  // Snapshot
  useEffect(() => {
    if (!userImage || !canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/jpeg", 0.92);
    setCroppedDataUrl(url);
    if (onDesignChange) onDesignChange(url);
  }, [userImage, panOffset, zoom, textOverlay, onDesignChange]);

  const handleSizeChange = (label) => { setSelectedSize(label); if (onSizeChange) onSizeChange(label); };
  const handleThicknessChange = (t) => { setSelectedThickness(t); if (onThicknessChange) onThicknessChange(t); };

  const handleAddWishList = useCallback(() => {
    if (!data?.seo_url) return;
    if (!isAuth) { navigate("/login"); return; }
    const form = isFav
      ? { wish_list: user.wish_list.filter((p) => p !== data.seo_url) }
      : { wish_list: [...(user.wish_list || []), data.seo_url] };
    dispatch({ type: "UPDATE_USER", data: { form, type: "custom", message: isFav ? "Remove from WishList" : "Added to WishList" } });
    setIsFav(!isFav);
  }, [data?.seo_url, isAuth, isFav, user, dispatch, navigate]);

  const handleCopyLink = useCallback(async () => {
    const url = window.location.href.replace("www.", "");
    try { await navigator.clipboard.writeText(url); } catch {
      const ta = document.createElement("textarea");
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    message.success("Link copied! 🔗");
    setShowShareModal(false);
  }, []);

  const seoData = useMemo(() => ({
    title:       data?.seo_title       || data?.name              || "Amazing Product",
    description: data?.seo_description || data?.short_description || "Check out this amazing product",
    url:         window.location.href.replace("www.", ""),
    image:       processedImages[0]    || "",
    keywords:    data?.keywords        || "product, shopping",
  }), [data, processedImages]);

  const canvasCursor = isDragging ? "grabbing" : userImage ? "grab" : "pointer";
  const panel3dW = orientation === "portrait" ? curSizeObj.w : curSizeObj.h;
  const panel3dH = orientation === "portrait" ? curSizeObj.h : curSizeObj.w;

  return (
    <div className="!sticky !top-24 w-full" onClick={() => setShowTextTool(false)}>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description"        content={seoData.description} />
        <meta name="keywords"           content={seoData.keywords} />
        <meta property="og:title"       content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image"       content={seoData.image} />
        <meta property="og:url"         content={seoData.url} />
        <meta property="og:type"        content="product" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="robots"             content="index, follow" />
        <link rel="canonical"           href={seoData.url} />
      </Helmet>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-0 flex items-center justify-center" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl p-5 w-72 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-center">Share Product</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"WhatsApp", icon:"https://cdn-icons-png.flaticon.com/32/733/733585.png", url:`https://wa.me/?text=${encodeURIComponent(seoData.url)}` },
                { label:"Facebook", icon:"https://cdn-icons-png.flaticon.com/32/733/733547.png", url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(seoData.url)}` },
                { label:"Twitter",  icon:"https://cdn-icons-png.flaticon.com/32/5968/5968830.png", url:`https://twitter.com/intent/tweet?url=${encodeURIComponent(seoData.url)}` },
                { label:"Telegram", icon:"https://cdn-icons-png.flaticon.com/32/2111/2111646.png", url:`https://t.me/share/url?url=${encodeURIComponent(seoData.url)}` },
                { label:"Email",    icon:"https://cdn-icons-png.flaticon.com/32/732/732200.png",  url:`mailto:?subject=${encodeURIComponent(data?.name||"Product")}&body=${encodeURIComponent(seoData.url)}`, isEmail:true },
              ].map(({ label, icon, url, isEmail }) => (
                <button key={label} onClick={() => { isEmail?(window.location.href=url):window.open(url,"_blank"); setShowShareModal(false); }}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100">
                  <img src={icon} className="w-8 h-8" alt={label} />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><LinkOutlined /></div>
                <span className="text-xs">Copy Link</span>
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="lg:hidden block"><DividerCards name={data?.name} /></div>

      {/* ── Top Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3 relative" onClick={(e) => e.stopPropagation()}>
        {/* A text tool */}
        <div className="relative">
          <Tooltip title="Add text overlay">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTextTool((v) => !v); }}
              className={`w-9 h-9 border flex items-center justify-center font-bold text-base transition-all select-none ${showTextTool ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"}`}
              style={{ borderRadius: 6, fontFamily: "serif" }}
            >A</button>
          </Tooltip>
          {showTextTool && (
            <TextToolPopover
              onClose={() => setShowTextTool(false)}
              onApply={(t) => { setTextOverlay(t); setShowTextTool(false); }}
              existingText={textOverlay}
            />
          )}
        </div>

        {/* Portrait box (tall) */}
        <Tooltip title="Portrait (vertical)">
          <button
            onClick={() => setOrientation("portrait")}
            className={`flex-shrink-0 border transition-all ${orientation==="portrait" ? "border-gray-700 bg-gray-700" : "border-gray-400 bg-white hover:border-gray-600"}`}
            style={{ width: 18, height: 26, borderRadius: 2 }}
          />
        </Tooltip>

        {/* Landscape box (wide) */}
        <Tooltip title="Landscape (horizontal)">
          <button
            onClick={() => setOrientation("landscape")}
            className={`flex-shrink-0 border transition-all ${orientation==="landscape" ? "border-gray-700 bg-gray-700" : "border-gray-400 bg-white hover:border-gray-600"}`}
            style={{ width: 26, height: 18, borderRadius: 2 }}
          />
        </Tooltip>

        {/* Select / Change Photo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold transition-colors shadow-sm"
          style={{ borderRadius: 8 }}
        >
          <UploadOutlined />
          {userImage ? "Change Photo" : "Select Photo"}
        </button>

        <Tooltip title={isFav ? "Remove from wishlist" : "Add to wishlist"}>
          <button
            onClick={handleAddWishList}
            className={`w-9 h-9 border flex items-center justify-center transition-all ${isFav ? "text-yellow-500 border-yellow-200 bg-yellow-50" : "text-gray-500 border-gray-200 bg-white hover:text-yellow-400"}`}
            style={{ borderRadius: 8 }}
          >
            {isFav ? <HeartFilled /> : <HeartOutlined />}
          </button>
        </Tooltip>

        <Tooltip title="Share product">
          <button
            onClick={() => setShowShareModal(true)}
            className="w-9 h-9 border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-yellow-50 hover:border-yellow-400 transition-all"
            style={{ borderRadius: 8 }}
          >
            <IoShareSocial style={{ fontSize: 16 }} />
          </button>
        </Tooltip>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => loadFile(e.target.files?.[0])} />
      </div>

      {/* ── Fixed-square canvas wrapper ──────────────────────────────────────
          paddingBottom: "100%" makes the div height = width (perfect square).
          The acrylic panel is drawn centeyellow inside with correct AR.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full bg-gray-100 border border-gray-200 overflow-hidden"
        style={{ paddingBottom: "100%", borderRadius: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            cursor: canvasCursor, touchAction: "none", display: "block",
          }}
          onMouseDown={handleCanvasMouseDown}
          onTouchStart={handleCanvasTouchStart}
        />

        {/* Size badge */}
        <div
          className="absolute top-3 left-3 bg-white bg-opacity-90 border border-gray-200 px-3 py-1 text-xs text-gray-600 shadow-sm font-medium"
          style={{ borderRadius: 20 }}
        >
          {selectedSize} in · {selectedThickness}
        </div>

        {/* Remove photo */}
        {userImage && (
          <button
            onClick={() => {
              setUserImage(null); setCroppedDataUrl(null); setPanOffset({ x:0, y:0 }); setZoom(100);
              if (fileInputRef.current) fileInputRef.current.value = "";
              if (onDesignChange) onDesignChange(null);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 border border-gray-200 flex items-center justify-center text-yellow-400 hover:bg-yellow-50 transition-all shadow-sm"
            style={{ borderRadius: "50%" }}
          >
            <DeleteOutlined style={{ fontSize: 13 }} />
          </button>
        )}
      </div>

      {/* Zoom slider */}
      {userImage && (
        <div className="flex items-center gap-3 mt-3 px-1">
          <ZoomInOutlined className="text-gray-400 flex-shrink-0" />
          <input type="range" min={50} max={300} step={1} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-yellow-500" />
          <span className="text-xs font-semibold text-gray-500 min-w-[38px] text-right">{zoom}%</span>
        </div>
      )}

      {/* Text overlay chip */}
      {textOverlay?.text && (
        <div className="flex items-center justify-between mt-2 px-3 py-2 bg-gray-50 border border-gray-200" style={{ borderRadius: 8 }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ background: textOverlay.color, borderRadius: 3 }} />
            <span className="text-xs text-gray-600 truncate max-w-[160px]" style={{ fontFamily: textOverlay.font }}>
              "{textOverlay.text}"
            </span>
          </div>
          <button onClick={() => setTextOverlay(null)} className="text-gray-400 hover:text-yellow-400 ml-2">
            <CloseOutlined style={{ fontSize: 12 }} />
          </button>
        </div>
      )}

      {/* Show 3D Preview button */}
      <button
        onClick={() => setShow3DPreview(true)}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-all"
        style={{ borderRadius: 12 }}
      >
        <span style={{ fontSize: 16 }}>⟳</span>
        Show 3D Preview
      </button>

      {show3DPreview && (
        <ThreeDPreviewModal
          onClose={() => setShow3DPreview(false)}
          croppedImage={croppedDataUrl}
          panelW={panel3dW}
          panelH={panel3dH}
          initialThickness={selectedThickness}
        />
      )}
    </div>
  );
};

export default React.memo(AImageSlider);