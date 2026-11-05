import React from 'react';

/** Deterministic pseudo-random numbers so every render draws the same food. */
export const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

type Piece = {
  kind: 'chunk' | 'leaf' | 'grain' | 'bean' | 'cube' | 'penne' | 'dot' | 'floret';
  colors: string[];
  count: number;
  size: number;
};

/** Points scattered inside an ellipse (rx, ry) centred on (cx, cy). */
const scatter = (r: () => number, n: number, cx: number, cy: number, rx: number, ry: number) =>
  Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    return { x: cx + Math.cos(a) * d * rx, y: cy + Math.sin(a) * d * ry, rot: r() * 360, k: r() };
  });

const PieceShape: React.FC<{ p: Piece; x: number; y: number; rot: number; k: number }> = ({ p, x, y, rot, k }) => {
  const c = p.colors[Math.floor(k * p.colors.length) % p.colors.length];
  const s = p.size * (0.75 + k * 0.5);
  const t = `rotate(${rot} ${x} ${y})`;
  switch (p.kind) {
    case 'grain':
      return <ellipse cx={x} cy={y} rx={s} ry={s * 0.42} fill={c} transform={t} />;
    case 'bean':
      return <ellipse cx={x} cy={y} rx={s} ry={s * 0.62} fill={c} transform={t} />;
    case 'dot':
      return <circle cx={x} cy={y} r={s * 0.5} fill={c} />;
    case 'cube':
      return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.18} fill={c} transform={t} />;
    case 'penne':
      return (
        <g transform={t}>
          <rect x={x - s} y={y - s * 0.32} width={s * 2} height={s * 0.64} rx={s * 0.3} fill={c} />
          <line x1={x - s * 0.6} y1={y - s * 0.3} x2={x - s * 0.4} y2={y + s * 0.3} stroke="#00000022" strokeWidth={2} />
          <line x1={x + s * 0.2} y1={y - s * 0.3} x2={x + s * 0.4} y2={y + s * 0.3} stroke="#00000022" strokeWidth={2} />
        </g>
      );
    case 'leaf':
      return (
        <path
          d={`M${x - s} ${y} Q ${x} ${y - s * 0.9} ${x + s} ${y} Q ${x} ${y + s * 0.9} ${x - s} ${y}`}
          fill={c}
          transform={t}
        />
      );
    case 'floret':
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={x + Math.cos(i * 1.26 + rot) * s * 0.45}
              cy={y + Math.sin(i * 1.26 + rot) * s * 0.45}
              r={s * 0.42}
              fill={c}
            />
          ))}
        </g>
      );
    case 'chunk':
    default:
      return (
        <path
          d={`M${x - s} ${y - s * 0.3} L${x - s * 0.2} ${y - s * 0.8} L${x + s * 0.9} ${y - s * 0.4} L${x + s * 0.7} ${y + s * 0.6} L${x - s * 0.5} ${y + s * 0.7} Z`}
          fill={c}
          transform={t}
          strokeLinejoin="round"
        />
      );
  }
};

/** Top-down bowl full of food. `oval` makes a takeaway-style bowl. */
export const Bowl: React.FC<{
  size: number;
  seed: number;
  base: string;
  rim?: string;
  pieces: Piece[];
  oval?: boolean;
  drizzle?: string;
  children?: React.ReactNode;
}> = ({ size, seed, base, rim = '#F1E6D2', pieces, oval, drizzle, children }) => {
  const r = rand(seed);
  const rx = oval ? 150 : 180;
  const ry = oval ? 190 : 180;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <ellipse cx="200" cy="212" rx={rx + 14} ry={ry + 14} fill="rgba(0,0,0,0.35)" />
      <ellipse cx="200" cy="200" rx={rx + 14} ry={ry + 14} fill={rim} />
      <ellipse cx="200" cy="200" rx={rx} ry={ry} fill={base} />
      {pieces.map((p, i) =>
        scatter(r, p.count, 200, 200, rx - p.size, ry - p.size).map((pt, j) => <PieceShape key={`${i}-${j}`} p={p} {...pt} />)
      )}
      {drizzle ? (
        <g fill="none" stroke={drizzle} strokeWidth="7" strokeLinecap="round" opacity="0.95">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${70 + i * 10} ${110 + i * 45} q 40 -30 70 0 t 70 0 t 70 0 t 60 0`}
              transform={`rotate(-20 200 200)`}
            />
          ))}
        </g>
      ) : null}
      {children}
    </svg>
  );
};

export const BurgerBowl: React.FC<{ size: number }> = ({ size }) => (
  <Bowl
    size={size}
    seed={11}
    base="#F4EEDC"
    drizzle="#F6A93B"
    pieces={[
      { kind: 'grain', colors: ['#FFFFFF', '#EDE5CF'], count: 90, size: 9 },
      { kind: 'leaf', colors: ['#9BCB4A', '#7DB23A', '#B5DB6A'], count: 40, size: 16 },
      { kind: 'chunk', colors: ['#5A3A24', '#6B4630', '#4A2E1C'], count: 55, size: 13 },
    ]}
  />
);

export const FruitBowl: React.FC<{ size: number }> = ({ size }) => (
  <Bowl
    size={size}
    seed={23}
    base="#FFFFFF"
    rim="#E9EEF5"
    pieces={[
      { kind: 'cube', colors: ['#FF5A5F', '#FF6F6B', '#F24B57'], count: 26, size: 40 },
      { kind: 'cube', colors: ['#FFD23D', '#FFC21A', '#FFE066'], count: 24, size: 36 },
    ]}
  />
);

export const PastaBowl: React.FC<{ size: number }> = ({ size }) => (
  <Bowl
    size={size}
    seed={37}
    base="#C98A3A"
    rim="#EFE7DA"
    pieces={[
      { kind: 'penne', colors: ['#E8B25A', '#F0C06A', '#D99F45'], count: 70, size: 20 },
      { kind: 'chunk', colors: ['#B9773A', '#A8652C', '#C4843F'], count: 22, size: 20 },
      { kind: 'floret', colors: ['#3E8E41', '#4FA052'], count: 7, size: 20 },
      { kind: 'cube', colors: ['#E0412F', '#F2C230'], count: 10, size: 12 },
    ]}
  />
);

export const BurritoBowl: React.FC<{ size: number }> = ({ size }) => (
  <Bowl
    size={size}
    seed={51}
    oval
    base="#F7F3EA"
    rim="#D9C4A0"
    pieces={[
      { kind: 'grain', colors: ['#FFFFFF', '#EFE9DA'], count: 110, size: 9 },
      { kind: 'bean', colors: ['#2A2226', '#3A2E33'], count: 40, size: 9 },
      { kind: 'chunk', colors: ['#6A4430', '#7C5238', '#5A3826'], count: 28, size: 17 },
      { kind: 'dot', colors: ['#F7C948', '#F2BA2C'], count: 30, size: 11 },
      { kind: 'cube', colors: ['#E8483B', '#D63A2F'], count: 14, size: 12 },
      { kind: 'leaf', colors: ['#8CC63F', '#6FAF2F'], count: 30, size: 14 },
      { kind: 'grain', colors: ['#FFE6A0'], count: 30, size: 8 },
    ]}
  />
);

export const Banana: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 400 400">
    {/* peel flaps */}
    <path d="M190 210 C 130 170 110 110 130 70 C 160 110 180 150 205 200 Z" fill="#F2C94C" stroke="#C99A1E" strokeWidth="3" />
    <path d="M215 205 C 270 160 300 110 290 60 C 255 100 230 150 205 200 Z" fill="#F2C94C" stroke="#C99A1E" strokeWidth="3" />
    {/* fruit */}
    <path d="M180 215 C 170 140 185 90 205 70 C 228 95 235 150 222 215 Z" fill="#FFF4D6" stroke="#E8D9AE" strokeWidth="3" />
    {/* unpeeled bottom */}
    <path d="M168 205 C 160 270 175 330 205 365 C 235 330 245 270 235 205 C 215 220 190 220 168 205 Z" fill="#F5C842" stroke="#C99A1E" strokeWidth="3" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={i} cx={185 + (i % 3) * 18} cy={250 + Math.floor(i / 3) * 50 + (i % 2) * 12} r="4" fill="#8A5A12" opacity="0.6" />
    ))}
    <rect x="198" y="360" width="14" height="22" rx="5" fill="#5B3E14" />
  </svg>
);

export const SandwichPlate: React.FC<{ size: number }> = ({ size }) => {
  const r = rand(77);
  const chips = scatter(r, 26, 265, 225, 95, 105);
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <circle cx="200" cy="212" r="195" fill="rgba(0,0,0,0.35)" />
      <circle cx="200" cy="200" r="195" fill="#4FB6A0" />
      <circle cx="200" cy="200" r="160" fill="#5CC7AF" />
      {/* two toast triangles */}
      {[
        'M40 150 L 190 60 L 175 250 Z',
        'M60 190 L 190 280 L 70 330 Z',
      ].map((d, i) => (
        <g key={i}>
          <path d={d} fill="#E9A24C" stroke="#C47F2C" strokeWidth="8" strokeLinejoin="round" />
          <path d={d} fill="#F3C47B" transform={`translate(${i ? 6 : 8} ${i ? 4 : 10}) scale(0.94)`} opacity="0.9" />
        </g>
      ))}
      <path d="M70 160 L 185 100" stroke="#E25D5D" strokeWidth="10" strokeLinecap="round" />
      <path d="M70 172 L 185 115" stroke="#8CC63F" strokeWidth="8" strokeLinecap="round" />
      {chips.map((c, i) => (
        <ellipse
          key={i}
          cx={c.x}
          cy={c.y}
          rx={26 + c.k * 10}
          ry={20 + c.k * 8}
          transform={`rotate(${c.rot} ${c.x} ${c.y})`}
          fill={i % 3 ? '#F08A2C' : '#E4741C'}
          stroke="#C85A12"
          strokeWidth="3"
        />
      ))}
    </svg>
  );
};

/** Simple scene backgrounds that read as "where the food was filmed". */
export const Surface: React.FC<{ kind: 'wood' | 'carpet' | 'desk' | 'counter' }> = ({ kind }) => {
  if (kind === 'wood' || kind === 'desk') {
    const base = kind === 'wood' ? ['#8A5A34', '#6E4426'] : ['#A87A4E', '#8A6038'];
    return (
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${base[0]}, ${base[1]})` }}>
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <path
              key={i}
              d={`M-50 ${i * 75} C 300 ${i * 75 + 30}, 700 ${i * 75 - 30}, 1130 ${i * 75 + 10}`}
              stroke="#3B2412"
              strokeWidth={i % 3 ? 2 : 5}
              fill="none"
            />
          ))}
        </svg>
        {kind === 'desk' ? (
          <div
            style={{
              position: 'absolute',
              left: 120,
              right: 120,
              top: 0,
              height: 420,
              borderRadius: '0 0 30px 30px',
              background: 'linear-gradient(#2B2F36, #1C1F24)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            }}
          />
        ) : null}
      </div>
    );
  }
  if (kind === 'carpet') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 30%, #6C7680, #3F474F)' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.18,
            backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
            backgroundSize: '9px 9px',
          }}
        />
      </div>
    );
  }
  return <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #5E5A55, #3E3B38)' }} />;
};
