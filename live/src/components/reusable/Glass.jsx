import { ReactNode } from "react";

/**
 * @typedef {Object} ButtonGlassProps
 * @property {ReactNode} children
 * @property {ReactNode} [icon]
 * @property {"primary" | "secondary" | "accent"} [glow]
 * @property {Function} [onClick]
 */

/**
 * Glass button component
 * @param {ButtonGlassProps} props
 */
const ButtonGlass = ({ children, icon, glow = "primary", onClick }) => {
  const glowStyles = {
    primary: "hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]",
    secondary: "hover:shadow-[0_0_30px_rgba(255,0,255,0.3)]",
    accent: "hover:shadow-[0_0_30px_rgba(128,255,0,0.3)]",
  };

  return (
    <button
      onClick={onClick}
      className={`btn-glass text-foreground flex items-center gap-3 ${glowStyles[glow]}`}
    >
      {/* {icon && <span className="text-lg">{icon}</span>} */}
      {children}
    </button>
  );
};

// In your Glass.jsx or Button3D.jsx file
import React from 'react';

export const Button3D = ({
  variant = 'elevated',
  children,
  onClick,
  size = 'md'
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 cursor-pointer select-none';

  const sizeClasses = {
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };

  const variantClasses = {
    elevated: `
      bg-gradient-to-br from-blue-500 to-blue-600 text-white
      shadow-[0_8px_0_rgb(29,78,216),0_13px_25px_rgba(29,78,216,0.4)]
      hover:shadow-[0_4px_0_rgb(29,78,216),0_8px_20px_rgba(29,78,216,0.5)]
      hover:translate-y-1
      active:shadow-[0_0_0_rgb(29,78,216),0_3px_10px_rgba(29,78,216,0.6)]
      active:translate-y-2
    `,
    glass: `
      bg-white/10 backdrop-blur-xl text-white border border-white/20
      shadow-[0_8px_32px_0_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.3)]
      hover:bg-white/20 hover:border-white/30
      hover:shadow-[0_12px_40px_0_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.4)]
      hover:-translate-y-1
      active:translate-y-0
    `,
    gradient: `
      bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 text-white
      shadow-[0_10px_30px_rgba(239,68,68,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
      hover:shadow-[0_15px_40px_rgba(239,68,68,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]
      hover:scale-105
      active:scale-100
      relative overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
    `,
    neon: `
      bg-gray-900 text-cyan-400 border-2 border-cyan-400
      shadow-[0_0_20px_rgba(34,211,238,0.5),inset_0_0_20px_rgba(34,211,238,0.1)]
      hover:shadow-[0_0_30px_rgba(34,211,238,0.8),inset_0_0_30px_rgba(34,211,238,0.2)]
      hover:text-cyan-300 hover:border-cyan-300
      hover:-translate-y-1
      active:translate-y-0
    `,
    soft: `
      bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700
      shadow-[8px_8px_16px_rgba(148,163,184,0.4),-8px_-8px_16px_rgba(255,255,255,0.8),inset_0_0_0_rgba(148,163,184,0)]
      hover:shadow-[4px_4px_8px_rgba(148,163,184,0.4),-4px_-4px_8px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(148,163,184,0.2)]
      active:shadow-[inset_4px_4px_8px_rgba(148,163,184,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]
    `,
    bold: `
      bg-gradient-to-br from-emerald-500 to-emerald-600 text-white
      shadow-[0_0_0_3px_rgb(16,185,129),0_10px_30px_rgba(16,185,129,0.4)]
      hover:shadow-[0_0_0_5px_rgb(16,185,129),0_15px_40px_rgba(16,185,129,0.5)]
      hover:scale-105
      active:scale-95
      transform-gpu
    `,
    ocean: `
      bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white
      shadow-[0_10px_25px_rgba(20,184,166,0.4),0_6px_12px_rgba(6,182,212,0.3)]
      hover:shadow-[0_15px_35px_rgba(20,184,166,0.5),0_8px_16px_rgba(6,182,212,0.4)]
      hover:-translate-y-2 hover:rotate-1
      active:translate-y-0 active:rotate-0
      transition-all duration-300
    `,
    sunset: `
      bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white
      shadow-[0_8px_0_rgb(159,18,57),0_15px_30px_rgba(244,63,94,0.4)]
      hover:shadow-[0_4px_0_rgb(159,18,57),0_10px_25px_rgba(244,63,94,0.5)]
      hover:translate-y-1
      active:shadow-[0_0_0_rgb(159,18,57),0_5px_15px_rgba(244,63,94,0.6)]
      active:translate-y-2
    `
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

export { ButtonGlass };

