import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fontFamily } from './theme';
import { Background, Headline, MacroBar, Phone, Plate, SceneFade, clamp, easeOut, usePop } from './components';

// Scene timing (30 fps). Scenes overlap by OVERLAP frames so they cross-fade.
const OVERLAP = 10;
const SCENES = [
  { id: 'hook', duration: 90 },
  { id: 'scan', duration: 200 },
  { id: 'today', duration: 160 },
  { id: 'features', duration: 140 },
  { id: 'cta', duration: 130 },
] as const;

const starts = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].duration - OVERLAP);
  return acc;
}, []);

export const PROMO_DURATION = starts[starts.length - 1] + SCENES[SCENES.length - 1].duration;

export const PlatesnapPromo: React.FC = () => {
  const components: Record<(typeof SCENES)[number]['id'], React.FC> = {
    hook: Hook,
    scan: Scan,
    today: Today,
    features: Features,
    cta: Cta,
  };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      {SCENES.map((s, i) => {
        const C = components[s.id];
        return (
          <Sequence key={s.id} from={starts[i]} durationInFrames={s.duration} name={s.id}>
            <SceneFade duration={s.duration} fade={i === 0 ? 1 : OVERLAP}>
              <C />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------- 1. Hook --------------------------------- */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plateIn = spring({ frame: frame - 18, fps, config: { damping: 14 } });
  const counter = Math.round(interpolate(frame, [30, 80], [0, 615], { ...clamp, easing: easeOut }));
  return (
    <AbsoluteFill>
      <Headline
        top={230}
        lines={[{ text: 'Snap your plate.' }, { text: 'Know your calories.', color: colors.lime }]}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 330,
          top: 760,
          transform: `scale(${plateIn}) rotate(${(1 - plateIn) * -40}deg)`,
        }}
      >
        <Plate size={660} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1500,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: interpolate(frame, [30, 40], [0, 1], clamp),
        }}
      >
        <span style={{ fontSize: 150, fontWeight: 800, color: colors.textPrimary, letterSpacing: -4 }}>
          {counter}
        </span>
        <span style={{ fontSize: 56, fontWeight: 700, color: colors.textSecondary, marginLeft: 16 }}>kcal</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------- 2. Scan --------------------------------- */

const FOOD_TAGS = [
  { label: 'Salmon', kcal: 330, x: 380, y: 300, at: 70 },
  { label: 'Rice', kcal: 240, x: 70, y: 560, at: 80 },
  { label: 'Greens', kcal: 45, x: 390, y: 640, at: 90 },
];

const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phone = spring({ frame, fps, config: { damping: 18 } });

  // Scan line sweeps across the camera view twice.
  const scanY = interpolate(frame, [20, 50, 80], [120, 900, 120], clamp);
  const scanOpacity = interpolate(frame, [15, 22, 80, 90], [0, 1, 1, 0], clamp);
  const bracketPulse = 1 + Math.sin(frame / 5) * 0.012;

  const sheet = spring({ frame: frame - 105, fps, config: { damping: 18, stiffness: 120 } });
  const bars = interpolate(frame, [120, 160], [0, 1], { ...clamp, easing: easeOut });
  const total = Math.round(interpolate(frame, [110, 140], [0, 615], { ...clamp, easing: easeOut }));

  return (
    <AbsoluteFill>
      <Headline top={150} lines={[{ text: 'AI scans your meal' }, { text: 'in seconds.', color: colors.lime }]} />
      <Phone style={{ transform: `translateY(${(1 - phone) * 500}px)` }}>
        {/* camera view */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 40%, #3A2C22 0%, #1E1712 70%)',
          }}
        />
        <div style={{ position: 'absolute', left: 60, top: 170, transform: `rotate(${frame * 0.05}deg)` }}>
          <Plate size={580} />
        </div>
        {/* viewfinder brackets */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 140,
            width: 620,
            height: 640,
            transform: `scale(${bracketPulse})`,
          }}
        >
          {[
            { left: 0, top: 0, borderLeft: true, borderTop: true },
            { right: 0, top: 0, borderRight: true, borderTop: true },
            { left: 0, bottom: 0, borderLeft: true, borderBottom: true },
            { right: 0, bottom: 0, borderRight: true, borderBottom: true },
          ].map(({ borderLeft, borderTop, borderRight, borderBottom, ...pos }, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...pos,
                width: 90,
                height: 90,
                borderColor: colors.lime,
                borderStyle: 'solid',
                borderWidth: 0,
                borderLeftWidth: borderLeft ? 8 : 0,
                borderTopWidth: borderTop ? 8 : 0,
                borderRightWidth: borderRight ? 8 : 0,
                borderBottomWidth: borderBottom ? 8 : 0,
                borderRadius: 26,
              }}
            />
          ))}
        </div>
        {/* scan line */}
        <div
          style={{
            position: 'absolute',
            left: 50,
            right: 50,
            top: scanY,
            height: 6,
            borderRadius: 3,
            opacity: scanOpacity,
            backgroundColor: colors.lime,
            boxShadow: `0 0 40px 12px ${colors.lime}88`,
          }}
        />
        {/* food tags */}
        {FOOD_TAGS.map((t) => (
          <FoodTag key={t.label} {...t} />
        ))}
        {/* result sheet */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 600,
            transform: `translateY(${(1 - sheet) * 620}px)`,
            backgroundColor: colors.bgElevated,
            borderTopLeftRadius: 56,
            borderTopRightRadius: 56,
            borderTop: `2px solid ${colors.border}`,
            padding: '44px 70px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ color: colors.textSecondary, fontSize: 30, fontWeight: 600 }}>Grilled salmon bowl</div>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8, marginBottom: 34 }}>
            <span style={{ color: colors.textPrimary, fontSize: 120, fontWeight: 800, letterSpacing: -4 }}>{total}</span>
            <span style={{ color: colors.lime, fontSize: 44, fontWeight: 700, marginLeft: 14 }}>kcal</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <MacroBar label="Protein" value={44} max={60} color={colors.orange} progress={bars} />
            <MacroBar label="Carbs" value={60} max={80} color={colors.blue} progress={bars} />
            <MacroBar label="Fat" value={22} max={35} color={colors.pink} progress={bars} />
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

const FoodTag: React.FC<{ label: string; kcal: number; x: number; y: number; at: number }> = ({ label, kcal, x, y, at }) => {
  const frame = useCurrentFrame();
  const style = usePop(at, 20);
  const out = interpolate(frame, [100, 110], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        ...style,
        opacity: style.opacity * out,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 24px',
        borderRadius: 999,
        backgroundColor: 'rgba(11,13,18,0.85)',
        border: `2px solid ${colors.lime}`,
        fontSize: 28,
        fontWeight: 700,
        color: colors.textPrimary,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.lime }} />
      {label}
      <span style={{ color: colors.lime }}>{kcal}</span>
    </div>
  );
};

/* --------------------------------- 3. Today --------------------------------- */

const MEALS = [
  { name: 'Oats & berries', meta: 'Breakfast', kcal: 380, color: colors.yellow },
  { name: 'Grilled salmon bowl', meta: 'Lunch · photo scan', kcal: 615, color: colors.orange },
  { name: 'Greek yogurt', meta: 'Snack', kcal: 160, color: colors.blue },
];

const Today: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = interpolate(frame, [15, 70], [0, 1155 / 2100], { ...clamp, easing: easeOut });
  const eaten = Math.round(ring * 2100);
  const bars = interpolate(frame, [30, 80], [0, 1], { ...clamp, easing: easeOut });
  const phone = spring({ frame, fps, config: { damping: 18 } });

  const R = 170;
  const C = 2 * Math.PI * R;

  return (
    <AbsoluteFill>
      <Headline top={150} lines={[{ text: 'Every macro.' }, { text: 'Every day.', color: colors.lime }]} />
      <Phone style={{ transform: `translateY(${(1 - phone) * 80}px)`, opacity: phone }}>
        <div style={{ position: 'absolute', inset: 0, padding: '120px 56px 0', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: colors.textPrimary, fontSize: 52, fontWeight: 800 }}>Today</div>
              <div style={{ color: colors.textSecondary, fontSize: 26, marginTop: 4 }}>Tuesday, Nov 3</div>
            </div>
            <div
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                backgroundColor: colors.card,
                border: `2px solid ${colors.border}`,
                color: colors.orange,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              12-day streak
            </div>
          </div>

          {/* calorie ring */}
          <div style={{ position: 'relative', width: 400, height: 400, margin: '40px auto 0' }}>
            <svg width={400} height={400} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={200} cy={200} r={R} stroke={colors.cardAlt} strokeWidth={30} fill="none" />
              <circle
                cx={200}
                cy={200}
                r={R}
                stroke={colors.lime}
                strokeWidth={30}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - ring)}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ color: colors.textPrimary, fontSize: 84, fontWeight: 800, letterSpacing: -3 }}>
                {(2100 - eaten).toLocaleString('en-US')}
              </div>
              <div style={{ color: colors.textSecondary, fontSize: 28, fontWeight: 600 }}>kcal left</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 40 }}>
            <MacroBar label="Protein" value={96} max={150} color={colors.orange} progress={bars} width={588} />
            <MacroBar label="Carbs" value={128} max={220} color={colors.blue} progress={bars} width={588} />
            <MacroBar label="Fat" value={38} max={70} color={colors.pink} progress={bars} width={588} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
            {MEALS.map((m, i) => (
              <MealRow key={m.name} {...m} delay={50 + i * 8} />
            ))}
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

const MealRow: React.FC<{ name: string; meta: string; kcal: number; color: string; delay: number }> = ({
  name,
  meta,
  kcal,
  color,
  delay,
}) => {
  const style = usePop(delay, 30);
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '18px 24px',
        borderRadius: 26,
        backgroundColor: colors.card,
        border: `2px solid ${colors.border}`,
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 700 }}>{name}</div>
        <div style={{ color: colors.textFaint, fontSize: 22, marginTop: 2 }}>{meta}</div>
      </div>
      <div style={{ color: colors.textPrimary, fontSize: 30, fontWeight: 800 }}>{kcal}</div>
    </div>
  );
};

/* -------------------------------- 4. Features ------------------------------- */

const FEATURES: { title: string; desc: string; color: string; icon: React.ReactNode }[] = [
  {
    title: 'Photo or text logging',
    desc: 'Snap it, or just describe it',
    color: colors.lime,
    icon: (
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <path d="M6 16h8l4-6h12l4 6h8v24H6z" />
        <circle cx="24" cy="27" r="7" />
      </svg>
    ),
  },
  {
    title: 'Calorie trends',
    desc: 'Two weeks against your goal',
    color: colors.blue,
    icon: (
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 36l10-12 8 7 16-19" />
        <path d="M32 12h8v8" />
      </svg>
    ),
  },
  {
    title: 'Weight & measurements',
    desc: 'Watch the trend line move',
    color: colors.orange,
    icon: (
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <rect x="6" y="8" width="36" height="32" rx="8" />
        <path d="M17 20a7 7 0 0 1 14 0z" />
      </svg>
    ),
  },
  {
    title: 'Before & After photos',
    desc: 'See how far you have come',
    color: colors.pink,
    icon: (
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <rect x="5" y="10" width="17" height="28" rx="4" />
        <rect x="26" y="10" width="17" height="28" rx="4" />
      </svg>
    ),
  },
];

const Features: React.FC = () => (
  <AbsoluteFill>
    <Headline top={230} lines={[{ text: 'Built to keep' }, { text: 'you on track.', color: colors.lime }]} />
    <div style={{ position: 'absolute', top: 620, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 34 }}>
      {FEATURES.map((f, i) => (
        <FeatureCard key={f.title} {...f} delay={14 + i * 10} />
      ))}
    </div>
  </AbsoluteFill>
);

const FeatureCard: React.FC<{ title: string; desc: string; color: string; icon: React.ReactNode; delay: number }> = ({
  title,
  desc,
  color,
  icon,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 17 } });
  return (
    <div
      style={{
        opacity: interpolate(frame - delay, [0, 8], [0, 1], clamp),
        transform: `translateX(${(1 - s) * 260}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        padding: '36px 40px',
        borderRadius: 40,
        backgroundColor: colors.card,
        border: `2px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: 30,
          backgroundColor: `${color}1f`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ color: colors.textPrimary, fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{title}</div>
        <div style={{ color: colors.textSecondary, fontSize: 32, marginTop: 6 }}>{desc}</div>
      </div>
    </div>
  );
};

/* ----------------------------------- 5. CTA ---------------------------------- */

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <rect width="120" height="120" rx="32" fill={colors.card} stroke={colors.border} strokeWidth="2" />
    <circle cx="60" cy="60" r="26" stroke={colors.textPrimary} strokeWidth="6" />
    <circle cx="60" cy="60" r="14" fill={colors.lime} />
    {[
      'M24 40V30a6 6 0 0 1 6-6h10',
      'M80 24h10a6 6 0 0 1 6 6v10',
      'M96 80v10a6 6 0 0 1-6 6H80',
      'M40 96H30a6 6 0 0 1-6-6V80',
    ].map((d) => (
      <path key={d} d={d} stroke={colors.lime} strokeWidth="6" strokeLinecap="round" />
    ))}
  </svg>
);

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 5, fps, config: { damping: 12 } });
  const name = usePop(18, 40);
  const tag = usePop(28, 30);
  const button = usePop(40, 30);
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${logo})`, marginBottom: 60 }}>
        <Logo size={300} />
      </div>
      <div style={{ ...name, fontSize: 124, fontWeight: 800, letterSpacing: -4, color: colors.textPrimary }}>
        Platesnap <span style={{ color: colors.lime }}>AI</span>
      </div>
      <div style={{ ...tag, fontSize: 48, fontWeight: 600, color: colors.textSecondary, marginTop: 20 }}>
        Snap. Track. Progress.
      </div>
      <div
        style={{
          ...button,
          marginTop: 110,
          padding: '40px 90px',
          borderRadius: 999,
          backgroundColor: colors.lime,
          color: colors.bg,
          fontSize: 52,
          fontWeight: 800,
          boxShadow: `0 0 ${40 + glow * 50}px ${colors.lime}66`,
        }}
      >
        Download free
      </div>
    </AbsoluteFill>
  );
};
