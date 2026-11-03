import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { colors, fontFamily } from './theme';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Fades a whole scene in at its start and out at its end. */
export const SceneFade: React.FC<{ duration: number; children: React.ReactNode; fade?: number }> = ({
  duration,
  children,
  fade = 10,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, fade, duration - fade, duration], [0, 1, 1, 0], clamp);
  return <div style={{ position: 'absolute', inset: 0, opacity }}>{children}</div>;
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 40;
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: colors.bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          left: -350 + drift,
          top: -300,
          background: `radial-gradient(circle, ${colors.lime}22 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          right: -380 - drift,
          bottom: -260,
          background: `radial-gradient(circle, ${colors.blue}1c 0%, transparent 65%)`,
        }}
      />
    </div>
  );
};

/** Spring-driven pop-in: returns {opacity, transform} for an element appearing at `delay`. */
export const usePop = (delay: number, distance = 60) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 140 } });
  return {
    opacity: interpolate(frame - delay, [0, 8], [0, 1], clamp),
    transform: `translateY(${(1 - s) * distance}px) scale(${0.94 + 0.06 * s})`,
  };
};

export const Headline: React.FC<{ lines: { text: string; color?: string }[]; delay?: number; top?: number }> = ({
  lines,
  delay = 0,
  top = 150,
}) => (
  <div style={{ position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily }}>
    {lines.map((l, i) => (
      <HeadlineLine key={l.text} text={l.text} color={l.color} delay={delay + i * 6} />
    ))}
  </div>
);

const HeadlineLine: React.FC<{ text: string; color?: string; delay: number }> = ({ text, color, delay }) => {
  const style = usePop(delay, 40);
  return (
    <div
      style={{
        ...style,
        fontSize: 92,
        fontWeight: 800,
        letterSpacing: -2.5,
        lineHeight: 1.08,
        color: color ?? colors.textPrimary,
      }}
    >
      {text}
    </div>
  );
};

/** Phone frame; children render inside the screen. */
export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: 'absolute',
      left: (1080 - 700) / 2,
      top: 470,
      width: 700,
      height: 1400,
      borderRadius: 96,
      backgroundColor: '#05060A',
      border: `3px solid ${colors.border}`,
      boxShadow: `0 60px 140px rgba(0,0,0,0.6), 0 0 0 14px #11141B`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <div style={{ position: 'absolute', inset: 0, borderRadius: 92, overflow: 'hidden', backgroundColor: colors.bg }}>
      {children}
    </div>
    {/* dynamic-island style notch */}
    <div
      style={{
        position: 'absolute',
        top: 26,
        left: '50%',
        width: 190,
        height: 52,
        marginLeft: -95,
        borderRadius: 30,
        backgroundColor: '#000',
      }}
    />
  </div>
);

/** Stylised top-down plate: salmon, rice, greens, lemon. Drawn in SVG so it renders anywhere. */
export const Plate: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 400 400">
    <defs>
      <radialGradient id="plate" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="80%" stopColor="#E6E9EE" />
        <stop offset="100%" stopColor="#C9CED6" />
      </radialGradient>
      <linearGradient id="salmon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFA36B" />
        <stop offset="100%" stopColor="#F2683A" />
      </linearGradient>
    </defs>
    <circle cx="200" cy="208" r="190" fill="rgba(0,0,0,0.35)" />
    <circle cx="200" cy="200" r="190" fill="url(#plate)" />
    <circle cx="200" cy="200" r="150" fill="none" stroke="#D5D9E0" strokeWidth="3" />
    {/* rice */}
    <ellipse cx="140" cy="250" rx="85" ry="68" fill="#F7F3E8" />
    {Array.from({ length: 34 }).map((_, i) => {
      const a = i * 2.4;
      const r = 12 + ((i * 37) % 55);
      return (
        <ellipse
          key={i}
          cx={140 + Math.cos(a) * r}
          cy={250 + Math.sin(a) * r * 0.75}
          rx="7"
          ry="3.2"
          transform={`rotate(${(i * 47) % 180} ${140 + Math.cos(a) * r} ${250 + Math.sin(a) * r * 0.75})`}
          fill="#E8E0CC"
        />
      );
    })}
    {/* salmon fillet */}
    <g transform="rotate(-18 245 150)">
      <rect x="170" y="105" width="160" height="90" rx="38" fill="url(#salmon)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${195 + i * 28} 110 q 14 40 0 80`}
          stroke="#FFD0B0"
          strokeWidth="5"
          fill="none"
          opacity="0.8"
        />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={190 + i * 45} y="120" width="10" height="60" rx="5" fill="#9B3E1C" opacity="0.5" />
      ))}
    </g>
    {/* greens */}
    {[
      [270, 265, 34],
      [305, 230, 26],
      [300, 295, 28],
      [240, 300, 24],
      [330, 270, 20],
    ].map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill={i % 2 ? '#4CAF50' : '#3E9142'} />
        <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#7BD17F" opacity="0.6" />
      </g>
    ))}
    {/* lemon */}
    <circle cx="118" cy="140" r="34" fill="#FFE066" />
    <circle cx="118" cy="140" r="27" fill="#FFF3B0" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line
        key={i}
        x1="118"
        y1="140"
        x2={118 + Math.cos((i * Math.PI) / 3) * 26}
        y2={140 + Math.sin((i * Math.PI) / 3) * 26}
        stroke="#FFE066"
        strokeWidth="3"
      />
    ))}
  </svg>
);

export const MacroBar: React.FC<{ label: string; value: number; max: number; color: string; progress: number; width?: number }> = ({
  label,
  value,
  max,
  color,
  progress,
  width = 560,
}) => (
  <div style={{ width, fontFamily }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ color: colors.textSecondary, fontSize: 28, fontWeight: 600 }}>{label}</span>
      <span style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 700 }}>
        {Math.round(value * progress)}g <span style={{ color: colors.textFaint }}>/ {max}g</span>
      </span>
    </div>
    <div style={{ height: 16, borderRadius: 8, backgroundColor: colors.cardAlt, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${(value / max) * 100 * progress}%`,
          borderRadius: 8,
          backgroundColor: color,
        }}
      />
    </div>
  </div>
);

export const easeOut = Easing.out(Easing.cubic);
