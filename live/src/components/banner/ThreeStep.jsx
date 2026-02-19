import React, { useState, useEffect, useRef, useCallback } from "react";
import { LuPackageCheck } from "react-icons/lu";
import { RiPrinterFill } from "react-icons/ri";
import { FaTruck } from "react-icons/fa";

/* ─────────────────────────────────────────────
   AURORA CANVAS BACKGROUND
───────────────────────────────────────────── */
function Aurora() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let t = 0, raf;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const { width: w, height: h } = c;
      ctx.clearRect(0, 0, w, h);
      const orbs = [
        { x: w * 0.2 + Math.sin(t * 0.4) * 120, y: h * 0.3 + Math.cos(t * 0.3) * 80,  r: w * 0.38, c: [242, 196, 26],  a: 0.10 },
        { x: w * 0.8 + Math.cos(t * 0.5) * 100, y: h * 0.6 + Math.sin(t * 0.4) * 100, r: w * 0.35, c: [99,  102, 241],  a: 0.09 },
        { x: w * 0.5 + Math.sin(t * 0.3) * 80,  y: h * 0.8 + Math.cos(t * 0.6) * 60,  r: w * 0.28, c: [20,  184, 166],  a: 0.07 },
        { x: w * 0.1 + Math.cos(t * 0.2) * 60,  y: h * 0.7 + Math.sin(t * 0.5) * 80,  r: w * 0.22, c: [251, 113, 133],  a: 0.06 },
      ];
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.c.join(",")},${o.a})`);
        g.addColorStop(1, `rgba(${o.c.join(",")},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      t += 0.006;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function Count({ to, suffix = "" }) {
  const [v, setV] = useState(0);
  const r = useRef(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n = 0;
      const step = () => { n += to / 55; setV(Math.min(Math.round(n), to)); if (n < to) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      ob.disconnect();
    }, { threshold: 0.5 });
    if (r.current) ob.observe(r.current);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={r}>{v}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
const STEPS = [
  {
    n: "01", hue: "#F5C842",
    Icon: LuPackageCheck,
    eyebrow: "Discovery",
    title: "Choose\nYour Canvas",
    body: "Over 200 premium surfaces await. Every material, finish, and dimension — from silk-laminate business cards to 4-meter exhibition banners.",
    pills: ["200+ Products", "Custom Sizes", "Premium Materials", "Instant Quotes"],
    kpi: { v: 200, s: "+", l: "Products" },
  },
  {
    n: "02", hue: "#818CF8",
    Icon: RiPrinterFill,
    eyebrow: "Creation",
    title: "Design\nWith Ease",
    body: "Drag, drop, perfect. Our AI-powered studio handles alignment, bleeds, and color profiles automatically. Upload your files or start from 500+ templates.",
    pills: ["AI Alignment", "500+ Templates", "Brand Kit Sync", "Live Preview"],
    kpi: { v: 500, s: "+", l: "Templates" },
  },
  {
    n: "03", hue: "#34D399",
    Icon: FaTruck,
    eyebrow: "Fulfillment",
    title: "Delivered\nTo Your Door",
    body: "Same-day press start on orders before 2 PM. Follow every step in real-time — from press to porch. Satisfaction guaranteed or we reprint, free.",
    pills: ["Same-Day Press", "Live Tracking", "Free Reprint", "Carbon Neutral"],
    kpi: { v: 24, s: "h", l: "Avg. Turnaround" },
  },
];

export default function ThreeStep() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [cursorLabel, setCursorLabel] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (!rootRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const el = rootRef.current;
    if (el) el.addEventListener("mousemove", move);
    return () => { if (el) el.removeEventListener("mousemove", move); };
  }, []);

  const cur = STEPS[active];

  return (
    <>
      <style>{RAW_CSS}</style>
      <div className="x-root" ref={rootRef}>

        {/* custom cursor */}
        <div className="x-cursor" style={{ left: cursor.x, top: cursor.y, opacity: cursorLabel ? 1 : 0 }}>
          {cursorLabel}
        </div>

        {/* ══ SECTION 1 — HERO ══ */}
        <section className="x-hero">
          <Aurora />
          <div className="x-hero-noise" />

          {/* top nav hint */}
          <div className="x-topbar">
            <div className="x-topbar-logo">✦ Printe</div>
            <div className="x-topbar-pill">How it works</div>
          </div>

          {/* giant counter */}
          <div className="x-hero-eyebrow">3-step process</div>

          <h1 className="x-hero-h1">
            <span className="x-h1-outline">Make</span>
            <span className="x-h1-solid"> It</span>
            <br />
            <span className="x-h1-gradient">Simple.</span>
          </h1>

          <p className="x-hero-sub">
            From blank canvas to doorstep delivery —<br className="x-br" />
            without the complexity.
          </p>

          {/* 3 mini step teasers */}
          <div className="x-hero-steps">
            {STEPS.map((s, i) => (
              <button
                key={s.n}
                className={`x-hero-step${active === i ? " is-active" : ""}`}
                style={{ "--h": s.hue }}
                onClick={() => setActive(i)}
                onMouseEnter={() => setCursorLabel("Select")}
                onMouseLeave={() => setCursorLabel("")}
              >
                <span className="x-hero-step-n">{s.n}</span>
                <span className="x-hero-step-name">{s.title.replace("\n", " ")}</span>
                <span className="x-hero-step-dot" />
              </button>
            ))}
          </div>

          <div className="x-hero-scroll">
            <span>Scroll</span>
            <div className="x-hero-scroll-line" />
          </div>
        </section>

        {/* ══ SECTION 2 — INTERACTIVE STEPS ══ */}
        <section className="x-steps-section">
          <div className="x-steps-inner">

            {/* LEFT: editorial text block */}
            <div className="x-steps-left">
              <div className="x-steps-tabs">
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    className={`x-tab${active === i ? " is-active" : ""}`}
                    style={{ "--h": s.hue }}
                    onClick={() => setActive(i)}
                  >
                    <div className="x-tab-bar" />
                    <div className="x-tab-content">
                      <div className="x-tab-num">{s.n}</div>
                      <div className="x-tab-label">{s.eyebrow}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* content pane */}
              <div className="x-content-pane" key={active}>
                <div className="x-content-eyebrow" style={{ color: cur.hue }}>
                  <cur.Icon style={{ fontSize: 14 }} /> {cur.eyebrow}
                </div>

                <h2 className="x-content-h2">
                  {cur.title.split("\n").map((line, i) => (
                    <span key={i} className={i === 1 ? "x-h2-accent" : ""} style={i === 1 ? { "--h": cur.hue } : {}}>
                      {line}<br />
                    </span>
                  ))}
                </h2>

                <p className="x-content-body">{cur.body}</p>

                <div className="x-pills">
                  {cur.pills.map(p => (
                    <span key={p} className="x-pill" style={{ "--h": cur.hue }}>{p}</span>
                  ))}
                </div>

                <div className="x-content-kpi">
                  <div className="x-kpi-num" style={{ color: cur.hue }}>
                    <Count to={cur.kpi.v} suffix={cur.kpi.s} />
                  </div>
                  <div className="x-kpi-label">{cur.kpi.l}</div>
                </div>

                <button className="x-content-cta" style={{ "--h": cur.hue }}>
                  Explore {cur.eyebrow} →
                </button>
              </div>
            </div>

            {/* RIGHT: visual panel */}
            <div className="x-steps-right">
              <div className="x-card-stack" key={active}>

                {/* glassy main card */}
                <div className="x-glass-card" style={{ "--h": cur.hue }}>
                  <div className="x-glass-card-shine" />
                  <div className="x-glass-glow" style={{ background: `radial-gradient(circle, ${cur.hue}22 0%, transparent 70%)` }} />

                  {/* step number watermark */}
                  <div className="x-card-watermark">{cur.n}</div>

                  {/* interactive visual */}
                  {active === 0 && <Step1Visual hue={cur.hue} setCursorLabel={setCursorLabel} />}
                  {active === 1 && <Step2Visual hue={cur.hue} />}
                  {active === 2 && <Step3Visual hue={cur.hue} />}
                </div>

                {/* floating info badges */}
                <div className="x-badge-float x-badge-tl" style={{ "--h": cur.hue }}>
                  <span className="x-badge-dot" />
                  <span>{cur.eyebrow} Phase</span>
                </div>
                <div className="x-badge-float x-badge-br" style={{ "--h": cur.hue }}>
                  <span>Step {cur.n} of 03</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECTION 3 — FEATURE GRID ══ */}
        <section className="x-features">
          <div className="x-features-head">
            <div className="x-features-eyebrow">Why Printe</div>
            <h3 className="x-features-h3">Everything you need,<br />nothing you don't.</h3>
          </div>
          <div className="x-features-grid">
            {[
              { icon: "⚡", title: "Same-Day Press",  body: "Orders before 2 PM go on press the same day, guaranteed." },
              { icon: "🎨", title: "Color Accuracy",   body: "Pantone-matched profiles and press proofs on request." },
              { icon: "🛡️", title: "Quality Promise",  body: "Not happy? We reprint for free. No questions, no forms." },
              { icon: "🌱", title: "Carbon Neutral",   body: "Every order offset through certified climate projects." },
              { icon: "📐", title: "AI Preflight",     body: "Automatic bleed, resolution, and color-space checks." },
              { icon: "🚀", title: "Express Delivery", body: "Next-morning delivery to all major metros." },
            ].map((f, i) => (
              <div
                key={f.title}
                className="x-feat-card"
                style={{ animationDelay: `${i * 0.08}s` }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={`x-feat-icon${hovered === i ? " x-feat-icon-hov" : ""}`}>{f.icon}</div>
                <div className="x-feat-title">{f.title}</div>
                <div className="x-feat-body">{f.body}</div>
                <div className="x-feat-arrow">→</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SECTION 4 — STATS MARQUEE ══ */}
        <div className="x-stats-strip">
          <div className="x-stats-track">
            {[...Array(2)].map((_, ri) =>
              [
                { n: "50K+", l: "Customers" },
                { n: "99%",  l: "Satisfaction" },
                { n: "24h",  l: "Turnaround" },
                { n: "200+", l: "Products" },
                { n: "4.9★", l: "Rating" },
                { n: "0 CO₂", l: "Net Carbon" },
              ].map((s, i) => (
                <div key={`${ri}-${i}`} className="x-stats-item">
                  <span className="x-stats-num">{s.n}</span>
                  <span className="x-stats-label">{s.l}</span>
                  <span className="x-stats-sep">·</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ══ SECTION 5 — CTA ══ */}
        <section className="x-cta">
          <Aurora />
          <div className="x-hero-noise" />
          <div className="x-cta-inner">
            <div className="x-cta-chip">Ready to create?</div>
            <h2 className="x-cta-h2">
              Your print,<br />
              <em>perfected.</em>
            </h2>
            <p className="x-cta-sub">
              Join 50,000+ brands who trust Printe with their most important impressions.
            </p>
            <div className="x-cta-actions">
              <button className="x-cta-btn-primary">Start for Free →</button>
              <button className="x-cta-btn-ghost">View Pricing</button>
            </div>
            <div className="x-cta-trust">
              <span>✦ No credit card required</span>
              <span>✦ Cancel anytime</span>
              <span>✦ First order 20% off</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   STEP VISUAL 1 — Product Picker
───────────────────────────────────────────── */
function Step1Visual({ hue, setCursorLabel }) {
  const [sel, setSel] = useState(0);
  const products = [
    { e: "🗂️", n: "Cards", desc: "From 50 to 100K" },
    { e: "🖼️", n: "Posters", desc: "A3 to 4×6 ft" },
    { e: "📦", n: "Packaging", desc: "Custom dielines" },
    { e: "👕", n: "Apparel", desc: "Screen & DTG" },
    { e: "🛍️", n: "Bags", desc: "Eco materials" },
    { e: "🎨", n: "Canvas", desc: "Gallery wrap" },
  ];
  return (
    <div className="v1-wrap">
      <div className="v1-header">
        <div className="v1-title">Browse Products</div>
        <div className="v1-count" style={{ color: hue }}>{products.length} categories</div>
      </div>
      <div className="v1-grid">
        {products.map((p, i) => (
          <button
            key={i}
            className={`v1-cell${sel === i ? " v1-sel" : ""}`}
            style={{ "--h": hue }}
            onClick={() => setSel(i)}
            onMouseEnter={() => setCursorLabel("Pick")}
            onMouseLeave={() => setCursorLabel("")}
          >
            <div className="v1-emoji">{p.e}</div>
            <div className="v1-name">{p.n}</div>
            <div className="v1-desc">{p.desc}</div>
          </button>
        ))}
      </div>
      <div className="v1-footer" style={{ borderColor: `${hue}33`, background: `${hue}0a` }}>
        <div className="v1-sel-name" style={{ color: hue }}>
          {products[sel].e} {products[sel].n} selected
        </div>
        <div className="v1-sel-cta" style={{ color: hue }}>Configure →</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP VISUAL 2 — Design Editor
───────────────────────────────────────────── */
function Step2Visual({ hue }) {
  const [tool, setTool] = useState(1);
  const tools = [
    { icon: "↖", label: "Select" },
    { icon: "T", label: "Text" },
    { icon: "◻", label: "Shape" },
    { icon: "🖼", label: "Image" },
    { icon: "✏", label: "Draw" },
  ];
  return (
    <div className="v2-wrap">
      {/* window chrome */}
      <div className="v2-chrome">
        <div className="v2-chrome-dots">
          <div className="v2-dot" style={{ background: "#FF5F57" }} />
          <div className="v2-dot" style={{ background: "#FEBC2E" }} />
          <div className="v2-dot" style={{ background: "#28C840" }} />
        </div>
        <div className="v2-chrome-url">studio.printe.io / design / new</div>
        <div className="v2-chrome-actions">
          <div className="v2-chrome-btn" style={{ background: hue, color: "#000" }}>Export</div>
        </div>
      </div>

      <div className="v2-body">
        {/* toolbar */}
        <div className="v2-toolbar">
          {tools.map((t, i) => (
            <button
              key={i}
              className={`v2-tool${tool === i ? " v2-tool-active" : ""}`}
              style={{ "--h": hue }}
              onClick={() => setTool(i)}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* canvas */}
        <div className="v2-canvas">
          <div className="v2-canvas-grid" />
          <div className="v2-canvas-doc">
            <div className="v2-scan" style={{ "--hc": hue }} />
            <div className="v2-doc-content">
              <div className="v2-doc-logo" style={{ color: hue }}>PRINTE</div>
              <div className="v2-doc-sub">Premium Print Studio</div>
              <div className="v2-doc-line" style={{ background: hue }} />
            </div>
            {/* selection handles */}
            <div className="v2-handle v2-tl" style={{ borderColor: hue }} />
            <div className="v2-handle v2-tr" style={{ borderColor: hue }} />
            <div className="v2-handle v2-bl" style={{ borderColor: hue }} />
            <div className="v2-handle v2-br" style={{ borderColor: hue }} />
          </div>
        </div>

        {/* right panel */}
        <div className="v2-panel">
          <div className="v2-panel-section">
            <div className="v2-panel-label">Typography</div>
            {["Bebas Neue", "DM Sans", "Unbounded"].map((f, i) => (
              <div key={f} className={`v2-panel-font${i === 0 ? " v2-panel-font-active" : ""}`} style={i === 0 ? { color: hue, borderColor: `${hue}44` } : {}}>
                {f}
              </div>
            ))}
          </div>
          <div className="v2-panel-section">
            <div className="v2-panel-label">Color</div>
            <div className="v2-swatches">
              {["#F5C842", "#818CF8", "#34D399", "#FB7185", "#fff"].map(c => (
                <div key={c} className="v2-swatch" style={{ background: c, boxShadow: c === hue ? `0 0 0 2px ${hue}` : "none" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP VISUAL 3 — Delivery Tracker
───────────────────────────────────────────── */
function Step3Visual({ hue }) {
  const stages = [
    { icon: "📝", label: "Ordered",  done: true },
    { icon: "🖨️", label: "Printing", done: true },
    { icon: "📦", label: "Packed",   active: true },
    { icon: "🚚", label: "Transit",  upcoming: true },
    { icon: "🏠", label: "Delivered" },
  ];
  return (
    <div className="v3-wrap">
      {/* map header */}
      <div className="v3-map">
        <div className="v3-map-bg" />
        <div className="v3-map-pulse" style={{ "--h": hue }}>
          <div className="v3-map-ring" style={{ borderColor: hue }} />
          <div className="v3-map-dot" style={{ background: hue }} />
        </div>
        <div className="v3-eta-pill" style={{ borderColor: `${hue}44`, background: `${hue}11` }}>
          <span style={{ color: hue }}>⚡</span>
          <span style={{ color: "#fff" }}>Arriving tomorrow · 9:00 AM</span>
        </div>
      </div>

      {/* progress nodes */}
      <div className="v3-stages">
        {stages.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className={`v3-node${s.done ? " v3-done" : ""}${s.active ? " v3-active" : ""}`} style={{ "--h": hue }}>
              <div className="v3-node-icon">{s.icon}</div>
              <div className="v3-node-label">{s.label}</div>
            </div>
            {i < stages.length - 1 && (
              <div className="v3-connector">
                <div className="v3-connector-fill" style={{ width: s.done ? "100%" : s.active ? "50%" : "0%", background: hue }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* package card */}
      <div className="v3-pkg" style={{ borderColor: `${hue}22` }}>
        <div className="v3-pkg-icon">📦</div>
        <div className="v3-pkg-info">
          <div className="v3-pkg-id">ORDER #PR-4821</div>
          <div className="v3-pkg-name">250× Silk Business Cards</div>
          <div className="v3-pkg-eta" style={{ color: hue }}>⚡ Tomorrow, express delivery</div>
        </div>
        <div className="v3-pkg-status" style={{ color: hue, borderColor: `${hue}33`, background: `${hue}0d` }}>
          On the way
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const RAW_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #07080c;
  --surface: #0d0f17;
  --glass:   rgba(255,255,255,0.04);
  --border:  rgba(255,255,255,0.07);
  --text:    #e8eaf0;
  --muted:   rgba(255,255,255,0.35);
  --faint:   rgba(255,255,255,0.1);
  --radius:  24px;
}

/* ── Animations ── */
@keyframes fadeSlideUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeSlideIn   { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeIn        { from{opacity:0} to{opacity:1} }
@keyframes scrollLine    { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 50.001%{transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }
@keyframes marqueeAnim   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes pulseRing     { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
@keyframes scanAnim      { 0%{top:0%;opacity:1} 90%{top:100%;opacity:.5} 100%{top:100%;opacity:0} }
@keyframes floatAnim     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes glowPulse     { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes spinSlow      { to{transform:rotate(360deg)} }
@keyframes badgeSlide    { from{opacity:0;transform:translate(16px,-16px)} to{opacity:1;transform:translate(0,0)} }
@keyframes cursor-enter  { from{opacity:0;transform:translate(-50%,-50%) scale(.5)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
@keyframes shimmer       { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }

/* ── Root ── */
.x-root {
  font-family: 'Geist', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
  position: relative;
}

/* Custom cursor */
.x-cursor {
  position: absolute;
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(245,200,66,0.9);
  color: #000;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%,-50%);
  transition: opacity .2s;
  animation: cursor-enter .2s ease;
  mix-blend-mode: difference;
}

/* noise overlay */
.x-hero-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");
  background-size: 200px; pointer-events: none; z-index: 1;
}

/* ══ HERO ══ */
.x-hero {
  position: relative;
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 100px 24px 80px;
  overflow: hidden;
}
.x-topbar {
  position: absolute; top: 32px; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; z-index: 2;
  animation: fadeIn .8s ease both;
}
.x-topbar-logo {
  font-family: 'Instrument Serif', serif;
  font-size: 22px; color: var(--text); letter-spacing: -.01em;
}
.x-topbar-pill {
  padding: 7px 18px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--glass);
  font-size: 12px; color: var(--muted);
  backdrop-filter: blur(12px);
}

.x-hero-eyebrow {
  position: relative; z-index: 2;
  font-size: 11px; letter-spacing: .28em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 32px;
  animation: fadeSlideUp .6s ease both;
}
.x-hero-h1 {
  position: relative; z-index: 2;
  text-align: center; line-height: .92; margin-bottom: 28px;
  animation: fadeSlideUp .6s .08s ease both;
}
.x-h1-outline {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(72px, 13vw, 168px);
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,.25);
  display: inline;
}
.x-h1-solid {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(72px, 13vw, 168px);
  color: var(--text);
  display: inline;
}
.x-h1-gradient {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: clamp(72px, 13vw, 168px);
  background: linear-gradient(90deg, #F5C842, #FBBF24, #F5C842, #FCD34D, #F5C842);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 6s linear infinite;
  display: block;
}
.x-hero-sub {
  position: relative; z-index: 2;
  font-size: 17px; color: var(--muted); text-align: center;
  line-height: 1.7; font-weight: 300;
  animation: fadeSlideUp .6s .16s ease both;
}
.x-br { display: block; }

/* hero step chips */
.x-hero-steps {
  position: relative; z-index: 2;
  display: flex; gap: 12px; margin-top: 56px; flex-wrap: wrap; justify-content: center;
  animation: fadeSlideUp .6s .24s ease both;
}
.x-hero-step {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px;
  border-radius: 100px;
  background: var(--glass);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
  position: relative; overflow: hidden;
}
.x-hero-step::before {
  content: '';
  position: absolute; inset: 0;
  background: var(--h);
  opacity: 0; transition: opacity .3s;
  border-radius: inherit;
}
.x-hero-step.is-active { border-color: var(--h); transform: scale(1.04); }
.x-hero-step.is-active::before { opacity: .08; }
.x-hero-step-n {
  font-family: 'Instrument Serif', serif;
  font-size: 20px; color: var(--muted);
  transition: color .3s;
}
.x-hero-step.is-active .x-hero-step-n { color: var(--h); }
.x-hero-step-name { font-size: 13px; color: var(--muted); transition: color .3s; }
.x-hero-step.is-active .x-hero-step-name { color: var(--text); }
.x-hero-step-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--h);
  opacity: 0; transition: opacity .3s;
}
.x-hero-step.is-active .x-hero-step-dot { opacity: 1; }

.x-hero-scroll {
  position: absolute; bottom: 40px; right: 48px; z-index: 2;
  display: flex; align-items: center; gap: 12px;
  font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--faint);
  animation: fadeIn 1s .5s ease both;
}
.x-hero-scroll-line {
  width: 60px; height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,.15), transparent);
  position: relative; overflow: hidden;
}
.x-hero-scroll-line::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  animation: shimmer 2s linear infinite;
}

/* ══ STEPS SECTION ══ */
.x-steps-section {
  position: relative;
  padding: 120px 0;
  border-top: 1px solid var(--border);
}
.x-steps-inner {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 420px 1fr;
  gap: 80px; padding: 0 48px;
  align-items: start;
}

/* ── Tabs ── */
.x-steps-tabs {
  display: flex; flex-direction: column; gap: 2px;
  margin-bottom: 52px;
}
.x-tab {
  display: flex; align-items: center; gap: 0;
  background: none; border: none; cursor: pointer;
  padding: 0; text-align: left;
  transition: all .3s;
}
.x-tab-bar {
  width: 3px; height: 52px;
  border-radius: 100px;
  background: var(--border);
  flex-shrink: 0;
  transition: background .3s, height .3s;
}
.x-tab.is-active .x-tab-bar { background: var(--h); height: 64px; }
.x-tab-content {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 20px;
}
.x-tab-num {
  font-family: 'Instrument Serif', serif;
  font-size: 28px; color: var(--faint);
  transition: color .3s; line-height: 1;
}
.x-tab.is-active .x-tab-num { color: var(--h); }
.x-tab-label {
  font-size: 13px; color: var(--muted);
  letter-spacing: .08em; text-transform: uppercase;
  transition: color .3s;
}
.x-tab.is-active .x-tab-label { color: var(--text); }

/* ── Content Pane ── */
.x-content-pane {
  animation: fadeSlideIn .45s cubic-bezier(.22,1,.36,1) both;
}
.x-content-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
  margin-bottom: 20px; font-weight: 500;
}
.x-content-h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(40px, 5vw, 64px);
  line-height: .97; letter-spacing: -.01em;
  color: var(--text); margin-bottom: 24px;
}
.x-h2-accent {
  font-style: italic; color: var(--h);
  display: inline-block;
}
.x-content-body {
  font-size: 15px; line-height: 1.8; color: var(--muted);
  max-width: 380px; margin-bottom: 28px; font-weight: 300;
}
.x-pills {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px;
}
.x-pill {
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid var(--border);
  font-size: 12px; color: var(--muted);
  background: var(--glass);
  transition: all .25s;
  cursor: default;
}
.x-pill:hover { border-color: var(--h); color: var(--text); background: rgba(255,255,255,.06); }
.x-content-kpi {
  display: flex; align-items: baseline; gap: 10px; margin-bottom: 32px;
}
.x-kpi-num {
  font-family: 'Instrument Serif', serif;
  font-size: 56px; line-height: 1; letter-spacing: -.02em;
}
.x-kpi-label {
  font-size: 12px; color: var(--muted); letter-spacing: .1em; text-transform: uppercase;
}
.x-content-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px;
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--h);
  color: var(--h);
  font-size: 13px; font-weight: 500; letter-spacing: .05em;
  cursor: pointer;
  transition: all .3s;
  font-family: 'Geist', sans-serif;
}
.x-content-cta:hover {
  background: var(--h); color: #000;
  box-shadow: 0 8px 30px rgba(0,0,0,.3);
  transform: translateY(-2px);
}

/* ── Glass Card ── */
.x-steps-right { position: sticky; top: 100px; }
.x-card-stack { position: relative; animation: fadeIn .4s ease both; }
.x-glass-card {
  position: relative;
  border-radius: 28px;
  border: 1px solid var(--border);
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.02) 100%);
  backdrop-filter: blur(40px);
  padding: 32px;
  min-height: 480px;
  transition: border-color .4s;
}
.x-glass-card:hover { border-color: rgba(255,255,255,.12); }
.x-glass-card-shine {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
}
.x-glass-glow {
  position: absolute; width: 350px; height: 350px;
  border-radius: 50%; top: -80px; left: -60px;
  pointer-events: none; animation: glowPulse 5s ease-in-out infinite;
}
.x-card-watermark {
  position: absolute; bottom: -20px; right: -10px;
  font-family: 'Instrument Serif', serif;
  font-size: 160px; font-style: italic;
  color: rgba(255,255,255,.025);
  pointer-events: none; user-select: none; line-height: 1;
}
/* floating badges */
.x-badge-float {
  position: absolute;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(10,12,20,.85);
  backdrop-filter: blur(12px);
  font-size: 11px; color: var(--muted);
  white-space: nowrap;
  animation: badgeSlide .5s .2s ease both;
}
.x-badge-tl { top: -16px; left: 24px; }
.x-badge-br { bottom: -16px; right: 24px; }
.x-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--h);
  animation: glowPulse 2s ease-in-out infinite;
}

/* ══ FEATURE GRID ══ */
.x-features {
  padding: 120px 48px;
  max-width: 1280px; margin: 0 auto;
  border-top: 1px solid var(--border);
}
.x-features-head { margin-bottom: 64px; }
.x-features-eyebrow {
  font-size: 11px; letter-spacing: .25em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 16px;
}
.x-features-h3 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(32px, 4vw, 52px);
  color: var(--text); line-height: 1.1;
}
.x-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.x-feat-card {
  padding: 40px 36px;
  background: var(--surface);
  position: relative;
  transition: background .3s;
  cursor: default;
  animation: fadeSlideUp .5s ease both;
}
.x-feat-card:hover { background: rgba(255,255,255,.03); }
.x-feat-icon {
  font-size: 28px; margin-bottom: 20px; display: inline-block;
  transition: transform .3s;
}
.x-feat-icon-hov { transform: scale(1.2) rotate(-5deg); }
.x-feat-title {
  font-size: 16px; font-weight: 600; color: var(--text);
  margin-bottom: 10px; letter-spacing: -.01em;
}
.x-feat-body {
  font-size: 14px; color: var(--muted); line-height: 1.65; font-weight: 300;
}
.x-feat-arrow {
  position: absolute; bottom: 32px; right: 32px;
  font-size: 18px; color: var(--faint);
  transition: all .3s; opacity: 0;
}
.x-feat-card:hover .x-feat-arrow { opacity: 1; transform: translate(4px, -4px); color: var(--muted); }

/* ══ STATS MARQUEE ══ */
.x-stats-strip {
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 20px 0;
}
.x-stats-track {
  display: flex; gap: 0;
  animation: marqueeAnim 22s linear infinite;
  width: max-content;
}
.x-stats-item {
  display: flex; align-items: center; gap: 16px;
  padding: 0 48px; flex-shrink: 0;
}
.x-stats-num {
  font-family: 'Instrument Serif', serif;
  font-size: 28px; color: var(--text);
}
.x-stats-label {
  font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: var(--muted);
}
.x-stats-sep { color: var(--border); font-size: 20px; }

/* ══ CTA ══ */
.x-cta {
  position: relative; overflow: hidden;
  padding: 160px 48px;
  border-top: 1px solid var(--border);
  text-align: center;
}
.x-cta-inner { position: relative; z-index: 2; }
.x-cta-chip {
  display: inline-block;
  padding: 6px 18px;
  border-radius: 100px;
  border: 1px solid rgba(245,200,66,.3);
  background: rgba(245,200,66,.06);
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
  color: #F5C842; margin-bottom: 32px;
}
.x-cta-h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(52px, 9vw, 120px);
  color: var(--text); line-height: .95; letter-spacing: -.02em;
  margin-bottom: 24px;
}
.x-cta-h2 em { font-style: italic; color: #F5C842; }
.x-cta-sub {
  font-size: 16px; color: var(--muted); margin-bottom: 48px;
  line-height: 1.7; font-weight: 300;
}
.x-cta-actions {
  display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
  margin-bottom: 28px;
}
.x-cta-btn-primary {
  padding: 18px 48px;
  border-radius: 100px;
  background: linear-gradient(135deg, #F5C842, #FBBF24);
  color: #000; font-weight: 700; font-size: 14px;
  letter-spacing: .04em; border: none; cursor: pointer;
  transition: all .3s;
  box-shadow: 0 0 40px rgba(245,200,66,.25), 0 4px 20px rgba(0,0,0,.3);
  font-family: 'Geist', sans-serif;
}
.x-cta-btn-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 0 60px rgba(245,200,66,.4), 0 8px 30px rgba(0,0,0,.4); }
.x-cta-btn-ghost {
  padding: 18px 48px;
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted); font-size: 14px; cursor: pointer;
  transition: all .3s; font-family: 'Geist', sans-serif;
}
.x-cta-btn-ghost:hover { border-color: rgba(255,255,255,.25); color: var(--text); }
.x-cta-trust {
  display: flex; gap: 28px; justify-content: center; flex-wrap: wrap;
  font-size: 12px; color: var(--muted); letter-spacing: .04em;
}

/* ══ STEP VISUAL 1 ══ */
.v1-wrap { display: flex; flex-direction: column; gap: 16px; position: relative; z-index: 1; }
.v1-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.v1-title { font-size: 13px; font-weight: 500; color: var(--text); }
.v1-count { font-size: 12px; font-weight: 500; }
.v1-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
.v1-cell {
  padding: 16px 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; transition: all .25s;
  text-align: center;
}
.v1-cell:hover { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.15); transform: translateY(-2px); }
.v1-cell.v1-sel { border-color: var(--h); background: rgba(255,255,255,.05); box-shadow: 0 0 20px rgba(0,0,0,.3); }
.v1-emoji { font-size: 24px; }
.v1-name { font-size: 11px; font-weight: 500; color: var(--text); }
.v1-desc { font-size: 9px; color: var(--muted); }
.v1-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-radius: 12px; border: 1px solid;
}
.v1-sel-name { font-size: 13px; font-weight: 500; }
.v1-sel-cta { font-size: 12px; font-weight: 500; }

/* ══ STEP VISUAL 2 ══ */
.v2-wrap {
  border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  background: #070b14;
  position: relative; z-index: 1;
}
.v2-chrome {
  background: #0c1322; padding: 10px 14px;
  display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
.v2-chrome-dots { display: flex; gap: 6px; }
.v2-dot { width: 10px; height: 10px; border-radius: 50%; }
.v2-chrome-url {
  flex: 1; background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 6px; padding: 4px 10px;
  font-size: 10px; color: rgba(255,255,255,.2);
}
.v2-chrome-btn {
  padding: 4px 12px; border-radius: 6px;
  font-size: 10px; font-weight: 700; cursor: pointer;
}
.v2-body { display: grid; grid-template-columns: 40px 1fr 110px; height: 220px; }
.v2-toolbar {
  background: #0a1020; border-right: 1px solid rgba(255,255,255,.04);
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 0;
}
.v2-tool {
  width: 26px; height: 26px;
  border-radius: 6px; background: transparent; border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; cursor: pointer; color: rgba(255,255,255,.3);
  transition: all .2s;
}
.v2-tool:hover { background: rgba(255,255,255,.06); color: var(--text); }
.v2-tool.v2-tool-active { background: rgba(255,255,255,.08); color: var(--h); }
.v2-canvas { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.v2-canvas-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 18px 18px;
}
.v2-canvas-doc {
  position: relative; z-index: 1;
  background: #fff; border-radius: 6px;
  width: 130px; height: 80px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 16px 48px rgba(0,0,0,.5);
  overflow: hidden;
}
.v2-scan {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--hc), transparent);
  animation: scanAnim 2.5s ease-in-out infinite;
}
.v2-doc-content { text-align: center; position: relative; z-index: 1; }
.v2-doc-logo { font-family: 'Instrument Serif', serif; font-weight: 700; font-size: 18px; letter-spacing: .05em; }
.v2-doc-sub { font-size: 6px; letter-spacing: .15em; text-transform: uppercase; color: #888; margin-top: 2px; }
.v2-doc-line { height: 2px; border-radius: 100px; margin-top: 6px; }
/* handles */
.v2-handle {
  position: absolute; width: 8px; height: 8px;
  border-radius: 50%; border: 1.5px solid;
  background: #fff;
}
.v2-tl { top: 4px; left: 4px; }
.v2-tr { top: 4px; right: 4px; }
.v2-bl { bottom: 4px; left: 4px; }
.v2-br { bottom: 4px; right: 4px; }
.v2-panel { background: #080e1a; border-left: 1px solid rgba(255,255,255,.04); padding: 14px 12px; overflow-y: auto; }
.v2-panel-section { margin-bottom: 16px; }
.v2-panel-label { font-size: 9px; letter-spacing: .15em; text-transform: uppercase; color: rgba(255,255,255,.2); margin-bottom: 8px; }
.v2-panel-font {
  padding: 5px 8px; border-radius: 6px;
  font-size: 10px; color: rgba(255,255,255,.3);
  cursor: pointer; transition: all .2s; margin-bottom: 3px;
  border: 1px solid transparent;
}
.v2-panel-font:hover { background: rgba(255,255,255,.04); color: var(--text); }
.v2-panel-font-active { background: rgba(255,255,255,.04); }
.v2-swatches { display: flex; gap: 5px; flex-wrap: wrap; }
.v2-swatch { width: 18px; height: 18px; border-radius: 50%; cursor: pointer; transition: transform .2s; }
.v2-swatch:hover { transform: scale(1.2); }

/* ══ STEP VISUAL 3 ══ */
.v3-wrap { display: flex; flex-direction: column; gap: 20px; position: relative; z-index: 1; }
.v3-map {
  position: relative; height: 140px; border-radius: 16px; overflow: hidden;
  background: linear-gradient(135deg, #080d18, #0a1020);
  border: 1px solid rgba(255,255,255,.06);
}
.v3-map-bg {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 32px 32px;
}
.v3-map-pulse {
  position: absolute; top: 50%; left: 55%; transform: translate(-50%,-50%);
}
.v3-map-ring {
  position: absolute; top: 50%; left: 50%;
  width: 60px; height: 60px;
  border-radius: 50%; border: 1px solid;
  transform: translate(-50%,-50%);
  animation: pulseRing 2s ease-out infinite;
}
.v3-map-dot {
  width: 12px; height: 12px; border-radius: 50%;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  box-shadow: 0 0 16px currentColor;
  animation: glowPulse 2s ease-in-out infinite;
}
.v3-eta-pill {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  padding: 7px 16px; border-radius: 100px; border: 1px solid;
  backdrop-filter: blur(12px); white-space: nowrap; font-size: 11px;
}
.v3-stages { display: flex; align-items: center; gap: 0; }
.v3-node { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
.v3-node-icon {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,.04); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-size: 14px;
  transition: all .3s;
}
.v3-node.v3-done .v3-node-icon { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.15); }
.v3-node.v3-active .v3-node-icon {
  background: rgba(52,211,153,.12); border-color: var(--h);
  box-shadow: 0 0 14px rgba(52,211,153,.3);
  animation: glowPulse 2s ease-in-out infinite;
}
.v3-node-label { font-size: 8px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.v3-node.v3-done .v3-node-label,
.v3-node.v3-active .v3-node-label { color: var(--h); }
.v3-connector {
  flex: 1; height: 2px;
  background: rgba(255,255,255,.06); border-radius: 100px;
  overflow: hidden; position: relative; margin-bottom: 18px;
}
.v3-connector-fill { height: 100%; border-radius: 100px; transition: width .8s ease; }
.v3-pkg {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; border-radius: 16px;
  border: 1px solid; background: rgba(255,255,255,.02);
}
.v3-pkg-icon { font-size: 32px; animation: floatAnim 3s ease-in-out infinite; }
.v3-pkg-info { flex: 1; }
.v3-pkg-id { font-size: 9px; letter-spacing: .15em; text-transform: uppercase; color: var(--muted); margin-bottom: 3px; }
.v3-pkg-name { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
.v3-pkg-eta { font-size: 11px; font-weight: 500; }
.v3-pkg-status {
  padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 500;
  border: 1px solid;
}

/* ══ RESPONSIVE ══ */
@media (max-width: 960px) {
  .x-steps-inner { grid-template-columns: 1fr; padding: 0 24px; gap: 48px; }
  .x-steps-right { position: static; }
  .x-steps-tabs { flex-direction: row; overflow-x: auto; }
  .x-tab-bar { width: 40px; height: 3px; }
  .x-tab.is-active .x-tab-bar { height: 3px; width: 64px; }
  .x-features-grid { grid-template-columns: repeat(2, 1fr); }
  .x-features { padding: 80px 24px; }
  .x-cta { padding: 100px 24px; }
  .x-topbar { padding: 0 24px; }
  .x-hero-scroll { display: none; }
  .x-br { display: none; }
}
@media (max-width: 600px) {
  .x-features-grid { grid-template-columns: 1fr; }
  .x-stats-item { padding: 0 28px; }
  .x-cta-trust { gap: 14px; font-size: 11px; }
  .v1-grid { grid-template-columns: repeat(3, 1fr); }
  .v2-body { grid-template-columns: 36px 1fr; }
  .v2-panel { display: none; }
}
`;