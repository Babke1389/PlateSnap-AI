import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { colors, fontFamily } from '../theme';
import { Soundtrack } from '../Soundtrack';
import { ArmHang, ArmReach, BlackStudio, Grade, GymDark, HandWithPhone, Hallway, Lifter } from './art';

/*
 * "Biceps tier list" photo-slideshow format, fully illustrated.
 * Hard cuts every 4 beats of an 80 BPM track (90 frames = 3 s), slow Ken Burns push on each slide.
 */

const SLIDE = 90;

type Slide = { title: string; body?: string; art: React.ReactNode; top?: number };

const SLIDES: Slide[] = [
  {
    title: 'biceps tier list.',
    art: (
      <>
        <Hallway />
        <Lifter id="s0" pose="flex" />
      </>
    ),
    top: 880,
  },
  {
    title: '1.  spider curls. 10/10',
    body: "if you're not doing these\nyou're missing out on gains.\nnon-negotiable",
    art: (
      <>
        <GymDark />
        <Lifter id="s1" pose="selfie" shorts />
      </>
    ),
  },
  {
    title: '2. bayesian curls. 9/10',
    body: 'almost perfect. my arms\ngrew insanely fast on these',
    art: (
      <>
        <GymDark bokeh />
        <Lifter id="s2" pose="double" />
      </>
    ),
  },
  {
    title: 'Pro tip',
    body: "Track your calories, you need\nnumbers. it's the key to\ngrowth. I use PlateSnap AI",
    art: (
      <>
        <GymDark bokeh />
        <HandWithPhone screen={<MiniToday />} />
      </>
    ),
    top: 380,
  },
  {
    title: '3. preacher curls. 7/10',
    body: 'the craziest stretch on\nthe biceps. good, not yet great',
    art: (
      <>
        <BlackStudio />
        <ArmReach />
      </>
    ),
  },
  {
    title: '4. dumbbell curls. 5/10',
    body: 'everyone starts here,\nnobody gets huge here',
    art: (
      <>
        <GymDark bokeh />
        <ArmHang />
      </>
    ),
  },
  {
    title: '5. hammer curls. 4/10',
    body: 'more forearm than biceps.\ngreat for thickness, not peaks',
    art: (
      <>
        <GymDark />
        <Lifter id="s6" pose="flex" />
      </>
    ),
  },
];

export const TIER_DURATION = SLIDES.length * SLIDE;

export const TierSlideshow: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000', fontFamily }}>
    <Soundtrack totalFrames={TIER_DURATION} music="audio/tier-music.wav" lines={[]} full={0.8} ducked={0.8} />
    {SLIDES.map((s, i) => (
      <Sequence key={s.title} from={i * SLIDE} durationInFrames={SLIDE} name={s.title}>
        <SlideView slide={s} index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const SlideView: React.FC<{ slide: Slide; index: number }> = ({ slide, index }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SLIDE], [1.04, 1.12]);
  const panX = interpolate(frame, [0, SLIDE], [0, index % 2 ? -18 : 18]);
  const textIn = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${panX}px) scale(${zoom})` }}>{slide.art}</AbsoluteFill>
      <Grade seed={index + 1} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: slide.top ?? 940, textAlign: 'center', opacity: textIn }}>
        <TikTokText size={slide.body ? 64 : 76}>{slide.title}</TikTokText>
        {slide.body ? (
          <div style={{ marginTop: 56 }}>
            <TikTokText size={64}>{slide.body}</TikTokText>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** White TikTok caption with the thin dark outline and soft shadow. */
const TikTokText: React.FC<{ children: string; size: number }> = ({ children, size }) => (
  <div
    style={{
      color: '#fff',
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.18,
      letterSpacing: -0.5,
      whiteSpace: 'pre-line',
      WebkitTextStroke: '1.5px rgba(0,0,0,0.85)',
      paintOrder: 'stroke fill',
      textShadow: '0 0 3px #000, 0 2px 6px rgba(0,0,0,0.8)',
    }}
  >
    {children}
  </div>
);

/** Small PlateSnap "Today" screen for the pro-tip slide. */
function MiniToday() {
  const frame = useCurrentFrame();
  const ring = interpolate(frame, [10, 60], [0.2, 0.78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const R = 120;
  const C = 2 * Math.PI * R;
  const goal = 3200;
  const bars: [string, number, string][] = [
    ['Protein', 0.82, colors.orange],
    ['Carbs', 0.7, colors.blue],
    ['Fat', 0.6, colors.pink],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: colors.bg, padding: '80px 34px 0', boxSizing: 'border-box', fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: colors.textPrimary, fontSize: 40, fontWeight: 800 }}>
          Platesnap <span style={{ color: colors.lime }}>AI</span>
        </div>
        <div style={{ color: colors.orange, fontSize: 22, fontWeight: 700, border: `2px solid ${colors.border}`, borderRadius: 99, padding: '6px 14px' }}>
          21-day streak
        </div>
      </div>
      <div style={{ position: 'relative', width: 280, height: 280, margin: '40px auto 0' }}>
        <svg width={280} height={280} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={140} cy={140} r={R} stroke={colors.cardAlt} strokeWidth={24} fill="none" />
          <circle cx={140} cy={140} r={R} stroke={colors.lime} strokeWidth={24} fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ring)} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: colors.textPrimary, fontSize: 60, fontWeight: 800, letterSpacing: -2 }}>
            {Math.round(goal * (1 - ring)).toLocaleString('en-US')}
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 22, fontWeight: 600 }}>kcal left</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 36 }}>
        {bars.map(([label, v, c]) => (
          <div key={label}>
            <div style={{ color: colors.textSecondary, fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{label}</div>
            <div style={{ height: 14, borderRadius: 7, background: colors.cardAlt }}>
              <div style={{ height: '100%', width: `${v * ring * 128}%`, maxWidth: '100%', borderRadius: 7, background: c }} />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 40,
          height: 84,
          borderRadius: 42,
          background: colors.lime,
          color: colors.bg,
          fontSize: 30,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Snap a meal
      </div>
    </div>
  );
};
