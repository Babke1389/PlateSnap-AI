import React from 'react';

/*
 * Glossy white "3D mannequin" built from capsules, posed with simple forward kinematics.
 * Angles are in degrees, SVG convention (0 = right, 90 = down).
 */

export type Pt = [number, number];
export const at = (p: Pt, angle: number, len: number): Pt => [
  p[0] + Math.cos((angle * Math.PI) / 180) * len,
  p[1] + Math.sin((angle * Math.PI) / 180) * len,
];

export const BODY_DEFS: React.FC = () => (
  <defs>
    <linearGradient id="mq-body" gradientUnits="userSpaceOnUse" x1="0" y1="500" x2="0" y2="1500">
      <stop offset="0" stopColor="#F7F9FC" />
      <stop offset="0.55" stopColor="#D5DCE8" />
      <stop offset="1" stopColor="#8C9AB3" />
    </linearGradient>
    <linearGradient id="mq-far" gradientUnits="userSpaceOnUse" x1="0" y1="500" x2="0" y2="1500">
      <stop offset="0" stopColor="#C9D2E2" />
      <stop offset="1" stopColor="#6F7E9C" />
    </linearGradient>
    <filter id="mq-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="mq-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
  </defs>
);

/** One glossy limb segment: blue rim light, white body, specular highlight. */
export const Capsule: React.FC<{ a: Pt; b: Pt; w: number; far?: boolean }> = ({ a, b, w, far }) => {
  const d = `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
  return (
    <g strokeLinecap="round" fill="none">
      <path d={d} stroke="#4F7DFF" strokeWidth={w + 6} opacity={far ? 0.25 : 0.55} transform="translate(4 6)" />
      <path d={d} stroke={far ? 'url(#mq-far)' : 'url(#mq-body)'} strokeWidth={w} />
      {!far ? (
        <path d={d} stroke="#FFFFFF" strokeWidth={w * 0.3} opacity={0.6} transform={`translate(${-w * 0.12} ${-w * 0.2})`} filter="url(#mq-blur)" />
      ) : null}
    </g>
  );
};

/** Highlighted muscle (red) or "correct form" glow (green) along a segment. */
export const MuscleGlow: React.FC<{ a: Pt; b: Pt; w: number; color: string; intensity: number; offset?: Pt }> = ({
  a,
  b,
  w,
  color,
  intensity,
  offset = [0, 0],
}) => {
  const d = `M${a[0] + offset[0]} ${a[1] + offset[1]} L${b[0] + offset[0]} ${b[1] + offset[1]}`;
  return (
    <g strokeLinecap="round" fill="none" opacity={intensity}>
      <path d={d} stroke={color} strokeWidth={w * 1.6} opacity={0.6} filter="url(#mq-glow)" />
      <path d={d} stroke={color} strokeWidth={w} />
      <path d={d} stroke="#fff" strokeWidth={w * 0.25} opacity={0.35} transform="translate(-2 -4)" />
    </g>
  );
};

export const Head: React.FC<{ c: Pt; r: number; tilt?: number }> = ({ c, r, tilt = 0 }) => (
  <g transform={`rotate(${tilt} ${c[0]} ${c[1]})`}>
    <ellipse cx={c[0] + 4} cy={c[1] + 6} rx={r * 0.85} ry={r * 1.05} fill="#4F7DFF" opacity={0.5} />
    <ellipse cx={c[0]} cy={c[1]} rx={r * 0.85} ry={r * 1.05} fill="url(#mq-body)" />
    <ellipse cx={c[0] - r * 0.25} cy={c[1] - r * 0.35} rx={r * 0.3} ry={r * 0.4} fill="#fff" opacity={0.55} filter="url(#mq-blur)" />
  </g>
);

/* ------------------------------ kneeling setup ----------------------------- */

/**
 * Kneeling overhead cable extension, side view facing left.
 * `bend` 0 = arms fully extended, 1 = hands behind the head (full stretch).
 */
/** Upper-arm angle in the kneeling pose: resting along the bench pad. */
export const UPPER_ARM = -160;
/** How far the forearm folds back at full stretch (degrees). Kept modest so it looks natural. */
export const MAX_BEND = 115;

export const kneelingJoints = (bend: number) => {
  const knee: Pt = [660, 1300];
  const foot = at(knee, 2, 165);
  const hip = at(knee, -82, 175);
  const shoulder = at(hip, 190, 240);
  const elbow = at(shoulder, UPPER_ARM, 150);
  const forearmAngle = UPPER_ARM + bend * MAX_BEND;
  const hand = at(elbow, forearmAngle, 135);
  const head: Pt = [shoulder[0] - 62, shoulder[1] + 58];
  return { knee, foot, hip, shoulder, elbow, hand, head, forearmAngle };
};

export const KneelingFigure: React.FC<{ bend: number; triceps?: number; green?: number }> = ({ bend, triceps = 0, green = 0 }) => {
  const j = kneelingJoints(bend);
  const off: Pt = [16, -10]; // far-side limbs
  const sh = (p: Pt): Pt => [p[0] + off[0], p[1] + off[1]];
  return (
    <g>
      {/* far arm + leg */}
      <Capsule a={sh(j.shoulder)} b={sh(j.elbow)} w={50} far />
      <Capsule a={sh(j.elbow)} b={sh(j.hand)} w={40} far />
      <Capsule a={sh(j.hip)} b={sh(j.knee)} w={64} far />
      <Capsule a={sh(j.knee)} b={sh(j.foot)} w={48} far />
      {/* torso: chest-to-hip as a thick tapered pair */}
      <Capsule a={j.hip} b={j.shoulder} w={118} />
      <Capsule a={at(j.hip, 198, 70)} b={at(j.shoulder, 18, 30)} w={96} />
      {/* near leg */}
      <Capsule a={j.hip} b={j.knee} w={70} />
      <Capsule a={j.knee} b={j.foot} w={52} />
      {/* near arm */}
      <Capsule a={j.shoulder} b={j.elbow} w={54} />
      <MuscleGlow a={at(j.shoulder, UPPER_ARM, 18)} b={at(j.shoulder, UPPER_ARM, 128)} w={30} color="#FF2A2A" intensity={triceps} offset={[6, 18]} />
      <Head c={j.head} r={44} tilt={-40} />
      <Capsule a={j.elbow} b={j.hand} w={42} />
      {green > 0 ? (
        <>
          <MuscleGlow a={j.shoulder} b={j.elbow} w={50} color="#2BFF7A" intensity={green * 0.55} />
          <MuscleGlow a={j.elbow} b={j.hand} w={40} color="#2BFF7A" intensity={green * 0.55} />
        </>
      ) : null}
      {/* hands + short bar */}
      <circle cx={j.hand[0]} cy={j.hand[1]} r={26} fill="url(#mq-body)" />
      <rect x={j.hand[0] - 10} y={j.hand[1] - 34} width={20} height={68} rx={10} fill="#1C2233" transform={`rotate(${j.forearmAngle} ${j.hand[0]} ${j.hand[1]})`} />
    </g>
  );
};

/* ------------------------------ standing pushdown ----------------------------- */

/** Side view, facing left, standing at a cable stack. `push` 0 = forearm up, 1 = arm locked out down. */
export const pushdownJoints = (push: number) => {
  const hip: Pt = [520, 1060];
  const shoulder = at(hip, -92, 250);
  const elbow = at(shoulder, 92, 150);
  // elbow pinned at the side: forearm goes from roughly horizontal to straight down
  const forearmAngle = 175 - push * 85;
  const hand = at(elbow, forearmAngle, 135);
  return { hip, shoulder, elbow, hand, forearmAngle, kneeL: at(hip, 96, 200), kneeR: at(hip, 84, 200) };
};

export const StandingFigure: React.FC<{ push: number; triceps?: number }> = ({ push, triceps = 0 }) => {
  const j = pushdownJoints(push);
  const footL = at(j.kneeL, 92, 190);
  const footR = at(j.kneeR, 88, 190);
  return (
    <g>
      <Capsule a={j.hip} b={j.kneeR} w={64} far />
      <Capsule a={j.kneeR} b={footR} w={48} far />
      <Capsule a={[j.shoulder[0] + 18, j.shoulder[1] + 6]} b={[j.hip[0] + 30, j.hip[1] - 20]} w={50} far />
      <Capsule a={j.hip} b={j.shoulder} w={124} />
      <Capsule a={at(j.hip, -92, 60)} b={at(j.shoulder, 92, 40)} w={110} />
      <Head c={at(j.shoulder, -95, 95)} r={48} />
      <Capsule a={at(j.shoulder, -92, 40)} b={at(j.shoulder, -95, 60)} w={40} />
      <Capsule a={j.hip} b={j.kneeL} w={72} />
      <Capsule a={j.kneeL} b={footL} w={54} />
      <Capsule a={[footL[0] - 40, footL[1] + 10]} b={[footL[0] + 10, footL[1] + 10]} w={30} />
      <Capsule a={j.shoulder} b={j.elbow} w={54} />
      <MuscleGlow a={at(j.shoulder, 92, 20)} b={at(j.shoulder, 92, 130)} w={28} color="#FF2A2A" intensity={triceps} offset={[18, 0]} />
      <Capsule a={j.elbow} b={j.hand} w={42} />
      <circle cx={j.hand[0]} cy={j.hand[1]} r={26} fill="url(#mq-body)" />
    </g>
  );
};

/* ------------------------------------ props ----------------------------------- */

export const Bench: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <g>
    {glow > 0 ? (
      <g opacity={glow}>
        <rect x={160} y={1060} width={380} height={48} rx={14} fill="none" stroke="#2BFF7A" strokeWidth={10} filter="url(#mq-glow)" />
        <rect x={200} y={1108} width={26} height={180} fill="#2BFF7A" opacity={0.5} filter="url(#mq-glow)" />
        <rect x={470} y={1108} width={26} height={180} fill="#2BFF7A" opacity={0.5} filter="url(#mq-glow)" />
      </g>
    ) : null}
    <rect x={160} y={1060} width={380} height={48} rx={14} fill="#15192A" />
    <rect x={160} y={1060} width={380} height={12} rx={6} fill="#323A55" />
    <rect x={200} y={1108} width={26} height={180} fill="#2A2F40" />
    <rect x={470} y={1108} width={26} height={180} fill="#2A2F40" />
    <rect x={170} y={1280} width={90} height={18} rx={6} fill="#2A2F40" />
    <rect x={440} y={1280} width={90} height={18} rx={6} fill="#2A2F40" />
    {glow > 0 ? (
      <rect x={160} y={1060} width={380} height={48} rx={14} fill="none" stroke="#2BFF7A" strokeWidth={5} opacity={glow} />
    ) : null}
  </g>
);

/** Cable column with weight stack and a pulley at `pulleyY`. */
export const CableStack: React.FC<{ x: number; pulleyY: number }> = ({ x, pulleyY }) => (
  <g>
    <rect x={x} y={200} width={34} height={1110} fill="#1B2030" />
    <rect x={x + 170} y={200} width={34} height={1110} fill="#232839" />
    <rect x={x - 10} y={180} width={230} height={30} rx={6} fill="#2B3146" />
    {Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={x + 50} y={760 + i * 34} width={104} height={28} rx={4} fill={i % 2 ? '#141824' : '#1A1F2E'} />
    ))}
    <rect x={x + 96} y={210} width={10} height={550} fill="#3A4057" />
    <circle cx={x + 17} cy={pulleyY} r={30} fill="#2B3146" stroke="#4A5270" strokeWidth={6} />
  </g>
);

export const Studio: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="studio-bg" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0" stopColor="#3463D8" />
        <stop offset="0.6" stopColor="#1C3E9E" />
        <stop offset="1" stopColor="#0A1A55" />
      </radialGradient>
      <linearGradient id="studio-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2549AE" />
        <stop offset="1" stopColor="#3A63C9" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#studio-bg)" />
    <rect y={1240} width={1080} height={680} fill="url(#studio-floor)" />
    <path d="M60 1270 L 1080 1240 L 1080 1400 L 0 1450 Z" fill="#0D1020" opacity={0.92} />
  </g>
);
