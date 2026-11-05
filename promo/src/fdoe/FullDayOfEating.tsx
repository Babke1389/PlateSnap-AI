import React from 'react';
import { AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fontFamily } from '../theme';
import { MacroBar, Phone, clamp, easeOut, usePop } from '../components';
import { Logo } from '../PlatesnapPromo';
import { Banana, BurgerBowl, BurritoBowl, FruitBowl, PastaBowl, SandwichPlate, Surface } from './foods';

/*
 * "Full day of eating" UGC-style ad, fully animated.
 * Hard cuts land on the beat: the music runs at 90 BPM, so one beat = 20 frames at 30 fps.
 */

const GOAL = 3565;
const MEALS_KCAL = { burger: 780, fruit: 108, banana: 105, sandwich: 690, pasta: 820, burrito: 910 };
const EATEN_TOTAL = Object.values(MEALS_KCAL).reduce((a, b) => a + b, 0); // 3413

const SCENES = [
  { id: 'intro', duration: 120 },
  { id: 'burger', duration: 140 },
  { id: 'scan', duration: 280 },
  { id: 'banana', duration: 80 },
  { id: 'sandwich', duration: 100 },
  { id: 'pasta', duration: 100 },
  { id: 'burrito', duration: 120 },
  { id: 'outro', duration: 160 },
] as const;

const starts = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].duration);
  return acc;
}, []);
export const FDOE_DURATION = starts[starts.length - 1] + SCENES[SCENES.length - 1].duration;

export const FullDayOfEating: React.FC = () => {
  const map: Record<(typeof SCENES)[number]['id'], React.FC> = {
    intro: Intro,
    burger: Burger,
    scan: Scan,
    banana: BananaScene,
    sandwich: Sandwich,
    pasta: Pasta,
    burrito: Burrito,
    outro: Outro,
  };
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: '#000' }}>
      <Html5Audio
        src={staticFile('audio/fdoe-music.wav')}
        volume={interpolate(frame, [FDOE_DURATION - 40, FDOE_DURATION], [0.9, 0], clamp)}
      />
      {SCENES.map((s, i) => {
        const C = map[s.id];
        return (
          <Sequence key={s.id} from={starts[i]} durationInFrames={s.duration} name={s.id}>
            <C />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/* --------------------------------- helpers --------------------------------- */

/** Gentle hand-held camera drift + a small "punch-in" on each cut. */
const Handheld: React.FC<{ children: React.ReactNode; seed?: number }> = ({ children, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const x = Math.sin((frame + seed * 13) / 17) * 10 + Math.sin((frame + seed) / 7) * 3;
  const y = Math.cos((frame + seed * 7) / 21) * 12;
  const r = Math.sin((frame + seed * 5) / 29) * 0.8;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1.06 - 0.02 * punch})` }}>
      {children}
    </AbsoluteFill>
  );
};

/** TikTok-style caption: plain white text with a soft shadow, near the top of the frame. */
const Caption: React.FC<{ lines: string[]; top?: number; size?: number; title?: string; from?: number }> = ({
  lines,
  top = 300,
  size = 40,
  title,
  from = 0,
}) => {
  const frame = useCurrentFrame();
  if (frame < from) return null;
  const shadow = '0 2px 4px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.35)';
  return (
    <div style={{ position: 'absolute', top, left: 60, right: 60, textAlign: 'center', color: '#fff', textShadow: shadow }}>
      {title ? <div style={{ fontSize: size + 4, fontWeight: 600, marginBottom: 18 }}>{title}</div> : null}
      {lines.map((l) => (
        <div key={l} style={{ fontSize: size, fontWeight: 500, lineHeight: 1.25 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const FoodShot: React.FC<{
  surface: React.ComponentProps<typeof Surface>['kind'];
  seed: number;
  children: React.ReactNode;
  top?: number;
}> = ({ surface, seed, children, top = 640 }) => (
  <Handheld seed={seed}>
    <Surface kind={surface} />
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
    {/* soft vignette like a phone camera */}
    <div style={{ position: 'absolute', inset: -40, boxShadow: 'inset 0 0 260px rgba(0,0,0,0.55)' }} />
  </Handheld>
);

/* ---------------------------------- scenes --------------------------------- */

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const second = frame >= 70;
  const ring = interpolate(frame, [10, 60], [0, 1], { ...clamp, easing: easeOut });
  return (
    <Handheld seed={1}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 35%, #2A3140 0%, #0B0D12 75%)' }} />
      {/* daily target, drawn like the app's ring */}
      <div style={{ position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <svg width={460} height={460} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={230} cy={230} r={200} stroke={colors.cardAlt} strokeWidth={34} fill="none" />
          <circle
            cx={230}
            cy={230}
            r={200}
            stroke={colors.lime}
            strokeWidth={34}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 200}
            strokeDashoffset={2 * Math.PI * 200 * (1 - ring)}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            height: 460,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: colors.textPrimary, fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>
            {Math.round(ring * GOAL).toLocaleString('en-US')}
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 34, fontWeight: 600 }}>kcal goal</div>
        </div>
      </div>
      {second ? (
        <Caption top={560} size={56} lines={["5'11 | 170 lb", 'bulking']} />
      ) : (
        <Caption top={540} size={64} title="" lines={['Full day of eating', '(mostly whole foods)']} />
      )}
    </Handheld>
  );
};

const Burger: React.FC = () => (
  <>
    <FoodShot surface="carpet" seed={2}>
      <BurgerBowl size={860} />
    </FoodShot>
    <Caption top={230} size={36} title={'"Burger Bowl"'} lines={['rice', 'ground beef', 'lettuce', 'thousand island dressing']} />
  </>
);

const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame: frame - 40, fps, config: { damping: 18 } });
  const flash = interpolate(frame, [80, 83, 92], [0, 0.9, 0], clamp);
  const sheet = spring({ frame: frame - 92, fps, config: { damping: 18, stiffness: 120 } });
  const bars = interpolate(frame, [104, 140], [0, 1], { ...clamp, easing: easeOut });
  const onToday = frame >= 170;
  return (
    <>
      <FoodShot surface="wood" seed={3}>
        <FruitBowl size={760} />
      </FoodShot>
      <Caption top={200} size={38} lines={['watermelon + pineapple']} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - phoneIn) * 1800}px)` }}>
        <Phone style={{ top: 330, transform: 'rotate(-2deg)' }}>
          {onToday ? (
            <TodayScreen from={170} />
          ) : (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #8A5A34, #6E4426)' }} />
              <div style={{ position: 'absolute', left: 30, top: 200 }}>
                <FruitBowl size={640} />
              </div>
              <Brackets />
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', opacity: flash }} />
              <ResultSheet progress={sheet} bars={bars} />
            </>
          )}
        </Phone>
      </div>
    </>
  );
};

const Brackets: React.FC = () => (
  <div style={{ position: 'absolute', left: 40, top: 170, width: 620, height: 640 }}>
    {[
      { left: 0, top: 0, bl: 1, bt: 1 },
      { right: 0, top: 0, br: 1, bt: 1 },
      { left: 0, bottom: 0, bl: 1, bb: 1 },
      { right: 0, bottom: 0, br: 1, bb: 1 },
    ].map(({ bl, bt, br, bb, ...pos }, i) => (
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
          borderLeftWidth: bl ? 8 : 0,
          borderTopWidth: bt ? 8 : 0,
          borderRightWidth: br ? 8 : 0,
          borderBottomWidth: bb ? 8 : 0,
          borderRadius: 26,
        }}
      />
    ))}
  </div>
);

const ResultSheet: React.FC<{ progress: number; bars: number }> = ({ progress, bars }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 640,
      transform: `translateY(${(1 - progress) * 660}px)`,
      backgroundColor: colors.bgElevated,
      borderTopLeftRadius: 56,
      borderTopRightRadius: 56,
      borderTop: `2px solid ${colors.border}`,
      padding: '44px 70px',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ color: colors.textSecondary, fontSize: 30, fontWeight: 600 }}>Watermelon & pineapple bowl</div>
    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8, marginBottom: 34 }}>
      <span style={{ color: colors.textPrimary, fontSize: 120, fontWeight: 800, letterSpacing: -4 }}>
        {Math.round(MEALS_KCAL.fruit * bars)}
      </span>
      <span style={{ color: colors.lime, fontSize: 44, fontWeight: 700, marginLeft: 14 }}>kcal</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <MacroBar label="Protein" value={2} max={10} color={colors.orange} progress={bars} />
      <MacroBar label="Carbs" value={28} max={40} color={colors.blue} progress={bars} />
      <MacroBar label="Fat" value={0} max={10} color={colors.pink} progress={bars} />
    </div>
    <div
      style={{
        marginTop: 40,
        height: 92,
        borderRadius: 46,
        backgroundColor: colors.lime,
        color: colors.bg,
        fontSize: 34,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Log meal
    </div>
  </div>
);

/** Today screen: remaining calories tick down as the scanned meal is added. */
const TodayScreen: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame() - from;
  const before = GOAL - MEALS_KCAL.burger;
  const after = before - MEALS_KCAL.fruit;
  const t = interpolate(frame, [20, 60], [0, 1], { ...clamp, easing: easeOut });
  const left = Math.round(before - (before - after) * t);
  const ring = (GOAL - left) / GOAL;
  const R = 170;
  const C = 2 * Math.PI * R;
  const newRow = usePop(from + 30, 40);
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '120px 56px 0', boxSizing: 'border-box', fontFamily }}>
      <div style={{ color: colors.textPrimary, fontSize: 52, fontWeight: 800 }}>Today</div>
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: colors.textPrimary, fontSize: 84, fontWeight: 800, letterSpacing: -3 }}>
            {left.toLocaleString('en-US')}
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 28, fontWeight: 600 }}>kcal left</div>
        </div>
      </div>
      <div style={{ color: colors.textSecondary, fontSize: 28, fontWeight: 700, margin: '50px 0 18px' }}>Recently logged</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={newRow}>
          <Row name="Watermelon & pineapple" meta="photo scan · just now" kcal={MEALS_KCAL.fruit} color={colors.pink} />
        </div>
        <Row name="Burger bowl" meta="photo scan · 12:40" kcal={MEALS_KCAL.burger} color={colors.orange} />
      </div>
    </div>
  );
};

const Row: React.FC<{ name: string; meta: string; kcal: number; color: string }> = ({ name, meta, kcal, color }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '20px 24px',
      borderRadius: 26,
      backgroundColor: colors.card,
      border: `2px solid ${colors.border}`,
    }}
  >
    <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
    <div style={{ flex: 1 }}>
      <div style={{ color: colors.textPrimary, fontSize: 30, fontWeight: 700 }}>{name}</div>
      <div style={{ color: colors.textFaint, fontSize: 22, marginTop: 2 }}>{meta}</div>
    </div>
    <div style={{ color: colors.textPrimary, fontSize: 32, fontWeight: 800 }}>{kcal}</div>
  </div>
);

const BananaScene: React.FC = () => (
  <>
    <FoodShot surface="counter" seed={4} top={560}>
      <Banana size={900} />
    </FoodShot>
    <Caption top={300} size={40} lines={['banana']} />
  </>
);

const Sandwich: React.FC = () => (
  <>
    <FoodShot surface="desk" seed={5} top={700}>
      <SandwichPlate size={900} />
    </FoodShot>
    <Caption top={520} size={38} lines={['bacon + turkey sandwich & potato chips']} />
  </>
);

const Pasta: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <FoodShot surface="wood" seed={6}>
        <PastaBowl size={820} />
      </FoodShot>
      <Caption top={420} size={40} lines={frame < 50 ? ['Cajun chicken pasta'] : ['Cajun chicken pasta', '+ broccoli & peppers']} />
    </>
  );
};

const Burrito: React.FC = () => (
  <>
    <FoodShot surface="carpet" seed={7} top={700}>
      <BurritoBowl size={880} />
    </FoodShot>
    <Caption top={230} size={34} lines={['white rice', 'black beans', 'steak', 'corn', 'tomatoes', 'cheese', 'lettuce']} />
  </>
);

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = interpolate(frame, [5, 50], [0, EATEN_TOTAL / GOAL], { ...clamp, easing: easeOut });
  const eaten = Math.round(ring * GOAL);
  const logo = spring({ frame: frame - 70, fps, config: { damping: 13 } });
  const name = usePop(80, 30);
  const tag = usePop(90, 30);
  const R = 230;
  const C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 35%, #1D2430 0%, #0B0D12 75%)' }}>
      <Caption top={220} size={46} lines={['total for the day']} />
      <div style={{ position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <svg width={520} height={520} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={260} cy={260} r={R} stroke={colors.cardAlt} strokeWidth={36} fill="none" />
          <circle
            cx={260}
            cy={260}
            r={R}
            stroke={colors.lime}
            strokeWidth={36}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ring)}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, height: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: colors.textPrimary, fontSize: 110, fontWeight: 800, letterSpacing: -4 }}>
            {eaten.toLocaleString('en-US')}
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 34, fontWeight: 600 }}>/ {GOAL.toLocaleString('en-US')} kcal</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: `scale(${logo})` }}>
          <Logo size={180} />
        </div>
        <div style={{ ...name, marginTop: 36, fontSize: 40, color: colors.textSecondary, fontWeight: 600 }}>tracked with</div>
        <div style={{ ...name, fontSize: 104, fontWeight: 800, letterSpacing: -3, color: colors.textPrimary }}>
          Platesnap <span style={{ color: colors.lime }}>AI</span>
        </div>
        <div style={{ ...tag, marginTop: 14, fontSize: 40, color: colors.textSecondary }}>Snap your plate. Know your calories.</div>
      </div>
    </AbsoluteFill>
  );
};
