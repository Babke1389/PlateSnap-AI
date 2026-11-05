import React from 'react';
import { useCurrentFrame } from 'remotion';

/*
 * Painterly, moody illustrations for the tier-list slideshow.
 * Everything is SVG in a 1080x1920 canvas. Soft shading comes from blurred shapes,
 * a warm key light from the upper left, film grain and a heavy vignette.
 */

const W = 1080;
const H = 1920;

/** Shared gradients and filters. Render once per slide inside an <svg>. */
const Defs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-skin`} gradientUnits="userSpaceOnUse" x1="200" y1="300" x2="900" y2="1300">
      <stop offset="0" stopColor="#C68A5E" />
      <stop offset="0.35" stopColor="#9A6440" />
      <stop offset="0.7" stopColor="#5E3A24" />
      <stop offset="1" stopColor="#24140B" />
    </linearGradient>
    <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F2ECE2" />
      <stop offset="0.55" stopColor="#CFC7BA" />
      <stop offset="1" stopColor="#7E776D" />
    </linearGradient>
    <linearGradient id={`${id}-pants`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#1A1A1D" />
      <stop offset="0.4" stopColor="#0E0E10" />
      <stop offset="1" stopColor="#050506" />
    </linearGradient>
    <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
    <filter id={`${id}-softer`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="28" />
    </filter>
    <filter id={`${id}-glow`} x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
  </defs>
);

/* ------------------------------- backgrounds ------------------------------- */

export const Hallway: React.FC = () => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="hall-light" cx="0.62" cy="0.3" r="0.6">
        <stop offset="0" stopColor="#3A2E22" />
        <stop offset="1" stopColor="#0B0907" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#hall-light)" />
    {/* left wall with door panels */}
    <path d="M0 0 L250 180 L250 1500 L0 1920 Z" fill="#1A1714" />
    {[0, 1].map((i) => (
      <rect key={i} x={40 + i * 100} y={330 + i * 40} width={80} height={1000 - i * 80} rx={6} fill="none" stroke="#2C2722" strokeWidth={6} />
    ))}
    <circle cx={120} cy={1050} r={14} fill="#4A4036" />
    {/* far end + gold frame */}
    <rect x={250} y={180} width={830} height={1320} fill="#15110D" />
    <rect x={740} y={330} width={190} height={560} fill="#0D0B09" stroke="#8A6A2E" strokeWidth={14} />
    <rect x={760} y={350} width={150} height={520} fill="#1C1A1E" />
    <rect x={720} y={920} width={260} height={30} fill="#1E1913" />
    {/* floor + rug */}
    <path d="M250 1500 L1080 1500 L1080 1920 L0 1920 Z" fill="#1A140F" />
    <path d="M120 1780 L1080 1700 L1080 1920 L60 1920 Z" fill="#3A3836" opacity={0.6} />
  </svg>
);

export const GymDark: React.FC<{ bokeh?: boolean }> = ({ bokeh }) => {
  const frame = useCurrentFrame();
  const flicker = 0.9 + 0.1 * Math.sin(frame / 3.3) * Math.sin(frame / 7.1);
  const lights = bokeh
    ? [
        [510, 80, 26], [520, 290, 18], [520, 350, 14], [910, 360, 14], [850, 400, 12], [990, 290, 16],
        [60, 500, 12], [130, 580, 9], [1000, 580, 9], [960, 520, 8], [300, 260, 10], [700, 200, 8],
      ]
    : [[820, 170, 24], [40, 260, 10]];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="gym-bg" cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor={bokeh ? '#2A241E' : '#1B1815'} />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <filter id="gym-blur">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="gym-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#gym-bg)" />
      {/* racks and cables, out of focus */}
      <g filter="url(#gym-blur)" opacity={bokeh ? 0.9 : 0.6}>
        {[60, 170, 300, 830, 930, 1030].map((x, i) => (
          <rect key={x} x={x} y={150 + (i % 2) * 40} width={22} height={1300} fill="#1E1C1A" />
        ))}
        {[260, 480, 700, 920].map((y) => (
          <rect key={y} x={0} y={y + 300} width={340} height={14} fill="#24211E" />
        ))}
        {[260, 480, 700, 920].map((y) => (
          <rect key={`r${y}`} x={800} y={y + 300} width={280} height={14} fill="#24211E" />
        ))}
        {bokeh
          ? [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={60 + i * 30} cy={1150 + i * 60} r={50} fill="#111" stroke="#2A2724" strokeWidth={10} />)
          : null}
        <rect x={0} y={1500} width={W} height={420} fill="#0A0A0A" />
      </g>
      {lights.map(([x, y, r], i) => (
        <g key={i} opacity={flicker}>
          <ellipse cx={x} cy={y} rx={r * 2.4} ry={r * 1.4} fill="#FFE2B0" opacity={0.35} filter="url(#gym-glow)" />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill="#FFF6E6" />
        </g>
      ))}
    </svg>
  );
};

export const BlackStudio: React.FC = () => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="studio" cx="0.6" cy="0.45" r="0.7">
        <stop offset="0" stopColor="#1A1512" />
        <stop offset="1" stopColor="#020202" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#studio)" />
  </svg>
);

/* ---------------------------------- lifter --------------------------------- */

/** Wrapped, masked head (cloth wrap covering face and neck). */
const MaskedHead: React.FC<{ id: string; cx: number; cy: number; tilt?: number }> = ({ id, cx, cy, tilt = 0 }) => (
  <g transform={`rotate(${tilt} ${cx} ${cy})`}>
    {/* neck drape */}
    <path
      d={`M${cx - 85} ${cy + 60} C ${cx - 110} ${cy + 150}, ${cx - 130} ${cy + 200}, ${cx - 110} ${cy + 230} L ${cx + 120} ${cy + 230} C ${cx + 140} ${cy + 190}, ${cx + 110} ${cy + 140}, ${cx + 85} ${cy + 60} Z`}
      fill={`url(#${id}-cloth)`}
    />
    <ellipse cx={cx} cy={cy} rx={100} ry={122} fill={`url(#${id}-cloth)`} />
    {/* folds */}
    <g fill="none" stroke="#8F887D" strokeWidth={5} strokeLinecap="round" opacity={0.75}>
      <path d={`M${cx - 80} ${cy - 60} Q ${cx} ${cy - 100} ${cx + 85} ${cy - 40}`} />
      <path d={`M${cx - 92} ${cy - 10} Q ${cx - 10} ${cy - 50} ${cx + 95} ${cy + 5}`} />
      <path d={`M${cx - 70} ${cy + 80} Q ${cx + 10} ${cy + 40} ${cx + 80} ${cy + 95}`} />
      <path d={`M${cx - 95} ${cy + 150} Q ${cx} ${cy + 120} ${cx + 100} ${cy + 165}`} />
      <path d={`M${cx - 30} ${cy + 110} Q ${cx - 10} ${cy + 170} ${cx - 40} ${cy + 225}`} />
    </g>
    {/* eye slit in shadow */}
    <path d={`M${cx - 70} ${cy + 18} Q ${cx} ${cy + 2} ${cx + 72} ${cy + 18} Q ${cx} ${cy + 36} ${cx - 70} ${cy + 18} Z`} fill="#140D09" />
    <ellipse cx={cx - 5} cy={cy + 30} rx={110} ry={30} fill="#000" opacity={0.12} filter={`url(#${id}-soft)`} />
  </g>
);

const Phone: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number }> = ({ x, y, w = 130, h = 250, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x} y={y} width={w} height={h} rx={22} fill="#141518" stroke="#3A3C42" strokeWidth={4} />
    <rect x={x + 12} y={y + 14} width={50} height={56} rx={14} fill="#26282D" />
    <circle cx={x + 28} cy={y + 30} r={9} fill="#06070A" stroke="#555" strokeWidth={2} />
    <circle cx={x + 46} cy={y + 52} r={9} fill="#06070A" stroke="#555" strokeWidth={2} />
    <rect x={x + 4} y={y + 4} width={w * 0.3} height={h - 8} rx={18} fill="#fff" opacity={0.06} />
  </g>
);

/** Muscle highlight / shadow helpers: blurred shapes layered over the base skin. */
const Hi: React.FC<{ id: string; d: string; o?: number }> = ({ id, d, o = 0.6 }) => (
  <path d={d} fill="#F0B486" opacity={o} filter={`url(#${id}-soft)`} />
);
const Sh: React.FC<{ id: string; d: string; o?: number; w?: number }> = ({ id, d, o = 0.9, w = 18 }) => (
  <path d={d} fill="none" stroke="#1E0F07" strokeWidth={w} strokeLinecap="round" opacity={o} filter={`url(#${id}-soft)`} />
);

export type Pose = 'selfie' | 'flex';

/** Front-facing muscular lifter. `selfie`: phone held up to the face. `flex`: arm up, biceps flexed. */
export const Lifter: React.FC<{ id: string; pose: Pose; shorts?: boolean }> = ({ id, pose, shorts }) => {
  const skin = `url(#${id}-skin)`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <Defs id={id} />
      {/* rim light behind the figure */}
      <ellipse cx={560} cy={900} rx={330} ry={520} fill="#FFB070" opacity={0.08} filter={`url(#${id}-softer)`} />

      {/* legs / pants */}
      {shorts ? (
        <>
          <path d="M395 1300 C 370 1500, 395 1700, 430 1920 L 535 1920 C 540 1700, 545 1500, 545 1330 Z" fill={skin} />
          <path d="M685 1300 C 715 1500, 690 1700, 655 1920 L 555 1920 C 550 1700, 548 1500, 548 1330 Z" fill={skin} />
          <Sh id={id} d="M470 1480 C 480 1600, 470 1700, 480 1880" o={0.5} />
          <Sh id={id} d="M615 1480 C 610 1600, 620 1700, 610 1880" o={0.5} />
          <path d="M400 1130 L 690 1130 L 715 1420 L 560 1440 L 545 1350 L 530 1440 L 375 1420 Z" fill={`url(#${id}-pants)`} />
        </>
      ) : (
        <path d="M405 1130 L 685 1130 C 720 1400, 740 1650, 760 1920 L 330 1920 C 345 1650, 365 1400, 405 1130 Z" fill={`url(#${id}-pants)`} />
      )}
      <path d="M560 1200 C 570 1400, 560 1650, 555 1920" stroke="#000" strokeWidth={10} opacity={0.5} fill="none" />

      {/* torso */}
      <path
        d="M350 600 C 420 555, 660 555, 730 600 L 790 690 C 770 840, 700 990, 670 1150 L 410 1150 C 380 990, 310 840, 290 690 Z"
        fill={skin}
      />
      {/* lats / torso edge shadow */}
      <Sh id={id} d="M300 720 C 330 860, 390 1000, 410 1140" o={0.55} w={24} />
      <Sh id={id} d="M780 720 C 750 860, 690 1000, 670 1140" o={0.85} w={34} />
      {/* pecs */}
      <path d="M360 660 Q 450 615 536 650 L 536 790 Q 450 835 365 780 Z" fill={skin} />
      <path d="M720 660 Q 630 615 544 650 L 544 790 Q 630 835 715 780 Z" fill={skin} />
      <Sh id={id} d="M370 785 Q 450 835 536 795" w={20} />
      <Sh id={id} d="M544 795 Q 630 835 712 785" w={24} />
      <Sh id={id} d="M540 640 L 540 1130" w={10} o={0.6} />
      <Hi id={id} d="M380 680 Q 440 650 500 670 Q 470 730 400 740 Z" o={0.55} />
      <Hi id={id} d="M580 680 Q 630 655 680 690 Q 640 720 590 720 Z" o={0.22} />
      <circle cx={455} cy={760} r={8} fill="#4A2A18" />
      <circle cx={625} cy={760} r={8} fill="#3A2012" />
      {/* abs */}
      {[860, 950, 1040].map((y, r) => (
        <g key={y}>
          <path d={`M470 ${y} Q 505 ${y - 12} 534 ${y - 2} L 534 ${y + 70} Q 500 ${y + 78} 472 ${y + 66} Z`} fill={skin} />
          <path d={`M546 ${y - 2} Q 575 ${y - 12} 610 ${y} L 608 ${y + 66} Q 580 ${y + 78} 546 ${y + 70} Z`} fill={skin} />
          <Sh id={id} d={`M468 ${y + 76} Q 540 ${y + 90} 612 ${y + 76}`} w={10} o={0.7} />
          <Hi id={id} d={`M480 ${y + 8} Q 505 ${y} 528 ${y + 8} L 526 ${y + 40} Q 500 ${y + 46} 482 ${y + 36} Z`} o={0.5 - r * 0.08} />
          <Hi id={id} d={`M556 ${y + 8} Q 578 ${y} 600 ${y + 8} L 598 ${y + 36} Q 576 ${y + 44} 556 ${y + 38} Z`} o={0.22} />
        </g>
      ))}
      {/* obliques */}
      <Sh id={id} d="M440 880 L 470 1110" w={9} o={0.6} />
      <Sh id={id} d="M640 880 L 612 1110" w={12} o={0.7} />
      <Sh id={id} d="M420 1120 Q 540 1060 660 1120" w={12} o={0.6} />

      {/* viewer-right arm hanging down */}
      <path d="M720 640 C 820 650, 850 780, 835 900 L 790 905 C 770 820, 740 760, 710 720 Z" fill={skin} />
      <path d="M780 880 C 845 900, 862 1000, 848 1130 C 842 1180, 815 1212, 790 1215 C 752 1200, 748 1100, 752 1000 Z" fill={skin} />
      <ellipse cx={792} cy={1220} rx={40} ry={52} fill={skin} />
      <ellipse cx={760} cy={690} rx={95} ry={105} fill={skin} />
      <Sh id={id} d="M840 700 C 860 820, 850 900, 830 1100" w={30} o={0.8} />
      <Sh id={id} d="M780 905 Q 800 900 828 910" w={10} />
      <Hi id={id} d="M700 640 Q 750 600 800 640 Q 760 680 715 690 Z" o={0.25} />

      {/* traps */}
      <path d="M470 560 C 420 580, 380 600, 350 620 L 730 620 C 700 600, 660 580, 610 560 Z" fill={skin} />
      {/* big form shadow on the side away from the key light */}
      <path
        d="M560 600 C 680 600, 800 640, 860 760 C 880 900, 820 1050, 700 1180 L 560 1180 Z"
        fill="#000"
        opacity={0.42}
        filter={`url(#${id}-softer)`}
      />
      <path d="M560 1180 L 760 1180 L 790 1920 L 560 1920 Z" fill="#000" opacity={0.35} filter={`url(#${id}-softer)`} />
      {pose === 'selfie' ? (
        <>
          {/* viewer-left arm: upper arm down, forearm up to the face holding a phone */}
          <ellipse cx={320} cy={690} rx={95} ry={108} fill={skin} />
          <path d="M260 660 C 210 760, 220 880, 260 960 L 350 950 C 365 860, 380 760, 360 690 Z" fill={skin} />
          <path d="M255 930 C 300 860, 380 700, 430 580 L 500 600 C 450 720, 380 880, 320 980 Z" fill={skin} />
          <Hi id={id} d="M240 720 Q 280 680 330 700 Q 300 800 260 840 Z" o={0.55} />
          <Sh id={id} d="M262 965 Q 300 975 340 955" w={12} />
          <Sh id={id} d="M330 940 C 390 830, 440 720, 480 610" w={10} o={0.5} />
          <MaskedHead id={id} cx={565} cy={400} />
          <Phone x={430} y={300} rot={-4} />
          <path d="M420 520 C 430 470, 470 470, 505 480 L 520 580 C 490 610, 440 610, 425 580 Z" fill={skin} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={408} y={370 + i * 42} width={44} height={30} rx={15} fill={skin} />
          ))}
        </>
      ) : (
        <>
          {/* viewer-left arm raised: upper arm out, forearm up to the head (biceps flex) */}
          <ellipse cx={320} cy={680} rx={100} ry={110} fill={skin} />
          <path d="M330 600 C 260 560, 170 560, 130 600 L 160 720 C 220 700, 290 700, 350 720 Z" fill={skin} />
          {/* biceps peak */}
          <path d="M150 600 C 180 500, 300 500, 330 600 C 280 630, 200 630, 150 600 Z" fill={skin} />
          <Hi id={id} d="M180 560 Q 240 510 300 560 Q 250 590 190 585 Z" o={0.7} />
          <path d="M130 610 C 160 480, 280 360, 400 290 L 445 355 C 330 420, 235 520, 210 620 Z" fill={skin} />
          <Sh id={id} d="M150 715 Q 250 700 345 725" w={22} />
          <Sh id={id} d="M215 600 C 260 500, 330 420, 420 360" w={12} o={0.6} />
          <MaskedHead id={id} cx={560} cy={400} tilt={8} />
          <ellipse cx={440} cy={312} rx={58} ry={50} fill={skin} transform="rotate(-30 440 312)" />
          <Sh id={id} d="M410 340 Q 450 350 480 320" w={8} o={0.5} />
        </>
      )}
    </svg>
  );
};

/* ------------------------------- arm close-ups ------------------------------ */

const Veins: React.FC<{ paths: string[] }> = ({ paths }) => (
  <g fill="none" strokeLinecap="round">
    {paths.map((d, i) => (
      <g key={i}>
        <path d={d} stroke="#2A160C" strokeWidth={13} opacity={0.35} />
        <path d={d} stroke="#D59B70" strokeWidth={5} opacity={0.55} transform="translate(-3 -3)" />
      </g>
    ))}
  </g>
);

/** Veiny forearm reaching up into the light. */
export const ArmReach: React.FC = () => {
  const id = 'reach';
  const skin = `url(#${id}-skin)`;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <Defs id={id} />
      <path d="M-60 1920 C 150 1500, 420 1000, 600 720 L 840 760 C 720 1050, 520 1500, 360 1920 Z" fill={skin} />
      <path d="M560 760 C 600 640, 640 560, 680 520 L 860 560 C 860 640, 850 720, 840 780 Z" fill={skin} />
      {/* palm + fingers */}
      <path d="M640 560 C 640 450, 700 380, 790 380 C 880 380, 920 450, 900 560 Z" fill={skin} />
      {[
        [690, 400, 640, 260],
        [745, 380, 730, 180],
        [800, 380, 810, 190],
        [850, 400, 880, 260],
      ].map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={skin} strokeWidth={46 - i * 2} strokeLinecap="round" />
      ))}
      <path d="M650 520 C 600 470, 560 420, 540 380" stroke={skin} strokeWidth={50} strokeLinecap="round" />
      <Sh id={id} d="M830 780 C 720 1050, 520 1500, 380 1900" w={60} o={0.85} />
      <Hi id={id} d="M560 800 C 450 1000, 300 1300, 160 1650 L 260 1650 C 400 1300, 520 1050, 620 820 Z" o={0.45} />
      <Veins
        paths={[
          'M640 760 C 600 900, 560 1000, 520 1150 C 480 1300, 420 1450, 360 1600',
          'M700 800 C 660 950, 640 1050, 600 1200',
          'M600 1200 C 640 1300, 620 1400, 560 1500',
          'M560 900 C 520 980, 470 1050, 440 1150',
          'M520 1150 C 560 1180, 600 1190, 620 1260',
          'M700 700 C 690 640, 720 580, 760 560',
        ]}
      />
    </svg>
  );
};

/** Close-up of a big upper arm and forearm hanging by the side, gym behind. */
export const ArmHang: React.FC = () => {
  const id = 'hang';
  const skin = `url(#${id}-skin)`;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <Defs id={id} />
      {/* torso edge */}
      <path d="M-40 0 L 300 0 C 280 300, 230 700, 200 1150 L -40 1200 Z" fill={skin} />
      <Sh id={id} d="M200 200 C 200 500, 180 800, 150 1150" w={40} o={0.6} />
      {/* shorts */}
      <path d="M-40 1180 L 260 1150 L 330 1920 L -40 1920 Z" fill={`url(#${id}-pants)`} />
      {/* upper arm */}
      <path d="M200 -40 C 420 60, 560 400, 560 760 L 360 860 C 300 600, 220 300, 120 0 Z" fill={skin} />
      <Hi id={id} d="M240 100 C 330 220, 420 420, 450 650 L 380 700 C 350 480, 290 280, 210 140 Z" o={0.5} />
      <Sh id={id} d="M560 300 C 600 500, 590 650, 560 780" w={40} o={0.8} />
      {/* forearm */}
      <path d="M380 800 C 500 1000, 700 1300, 960 1700 L 1080 1640 C 900 1300, 700 950, 560 760 Z" fill={skin} />
      <path d="M930 1680 C 1000 1760, 1060 1800, 1100 1830 L 1100 1620 C 1060 1620, 1000 1640, 960 1660 Z" fill={skin} />
      <Sh id={id} d="M560 780 C 700 960, 880 1260, 1060 1600" w={36} o={0.75} />
      <Veins
        paths={[
          'M300 300 C 340 420, 380 560, 420 700',
          'M420 700 C 500 860, 600 1000, 720 1200 C 800 1330, 880 1460, 960 1600',
          'M560 920 C 620 1000, 700 1060, 760 1180',
          'M720 1200 C 760 1260, 820 1300, 880 1360',
          'M480 860 C 540 900, 560 960, 600 1010',
        ]}
      />
    </svg>
  );
};

/** A hand holding a phone up; the phone screen is rendered by the caller as `screen`. */
export const HandWithPhone: React.FC<{ screen: React.ReactNode }> = ({ screen }) => {
  const id = 'hand';
  const skin = `url(#${id}-skin)`;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 760,
          width: 480,
          height: 960,
          borderRadius: 64,
          background: '#0B0B0E',
          border: '6px solid #2E3036',
          boxShadow: '0 40px 90px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          transform: 'rotate(-2deg)',
        }}
      >
        <div style={{ position: 'absolute', inset: 10, borderRadius: 56, overflow: 'hidden' }}>{screen}</div>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <Defs id={id} />
        {/* palm + wrist from bottom-left */}
        <path d="M-80 1920 C 60 1700, 180 1560, 300 1500 L 360 1700 C 300 1800, 260 1880, 240 1920 Z" fill={skin} />
        {/* thumb along the left edge */}
        <path d="M250 1560 C 230 1400, 250 1250, 300 1120 C 330 1110, 350 1130, 345 1160 C 320 1280, 320 1420, 340 1560 Z" fill={skin} />
        {/* fingers wrapping the right edge */}
        {[1180, 1300, 1420, 1530].map((y, i) => (
          <path
            key={y}
            d={`M760 ${y} C 820 ${y - 10}, 850 ${y + 20}, 840 ${y + 60} C 830 ${y + 90}, 790 ${y + 95}, 765 ${y + 85} Z`}
            fill={skin}
            opacity={1 - i * 0.05}
          />
        ))}
        <Sh id={id} d="M270 1560 C 260 1420, 270 1280, 310 1140" w={14} o={0.5} />
        <Hi id={id} d="M120 1800 C 180 1700, 240 1640, 300 1600 L 300 1660 C 240 1720, 200 1780, 160 1840 Z" o={0.5} />
      </svg>
    </div>
  );
};

/** Film grain, warm key light and vignette laid over every slide. */
export const Grade: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed * 100 + (frame % 6)} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <radialGradient id={`vig-${seed}`} cx="0.5" cy="0.48" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id={`key-${seed}`} cx="0.2" cy="0.15" r="0.8">
          <stop offset="0" stopColor="#FFB872" stopOpacity="0.16" />
          <stop offset="1" stopColor="#FFB872" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#key-${seed})`} />
      <rect width={W} height={H} fill={`url(#vig-${seed})`} />
      <rect width={W} height={H} filter={`url(#grain-${seed})`} opacity={0.09} />
    </svg>
  );
};
