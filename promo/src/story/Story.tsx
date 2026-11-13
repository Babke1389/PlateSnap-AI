import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fontFamily } from '../theme';
import { Soundtrack, VoiceLine } from '../Soundtrack';
import { Bowl, Surface } from '../fdoe/foods';
import { Grade } from '../tier/art';
import { Logo } from '../PlatesnapPromo';

/*
 * "It was the guessing" — a first-person storytime video. The app shows up as part of
 * the story (a friend says "just snap it"), not as a pitch; the brand only appears at the very end.
 */

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Male narrator, Kokoro am_michael at 0.95 speed: `python scripts/narration.py am_michael public/audio story`
const NARRATION: VoiceLine[] = [
  { file: 'audio/story-vo1.wav', at: 0.4, dur: 3.78 }, // Three weeks of eating clean...
  { file: 'audio/story-vo2.wav', at: 5.3, dur: 1.51 }, // And the scale went up.
  { file: 'audio/story-vo3.wav', at: 8.3, dur: 7.04 }, // My friend asked how many calories...
  { file: 'audio/story-vo4.wav', at: 15.7, dur: 1.86 }, // He told me to just snap it.
  { file: 'audio/story-vo5.wav', at: 19.6, dur: 5.7 }, // Seven hundred and forty...
  { file: 'audio/story-vo6.wav', at: 25.9, dur: 5.72 }, // So I kept eating the same stuff...
  { file: 'audio/story-vo7.wav', at: 32.4, dur: 5.12 }, // Eight weeks later...
];

const SCENES = [
  { id: 'notes', from: 0, to: 5 },
  { id: 'scale', from: 5, to: 8 },
  { id: 'chat', from: 8, to: 18 },
  { id: 'scan', from: 18, to: 25.6 },
  { id: 'weeks', from: 25.6, to: 32 },
  { id: 'end', from: 32, to: 40 },
] as const;

export const STORY_DURATION = s(40);

export const Story: React.FC = () => {
  const map: Record<(typeof SCENES)[number]['id'], React.FC> = {
    notes: Notes,
    scale: ScaleScene,
    chat: Chat,
    scan: Scan,
    weeks: Weeks,
    end: End,
  };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0908', fontFamily }}>
      <Soundtrack totalFrames={STORY_DURATION} music="audio/story-music.wav" lines={NARRATION} full={0.6} ducked={0.2} />
      {SCENES.map((sc, i) => {
        const C = map[sc.id];
        return (
          <Sequence key={sc.id} from={s(sc.from)} durationInFrames={s(sc.to - sc.from)} name={sc.id}>
            <Fade dur={s(sc.to - sc.from)} first={i === 0}>
              <C />
            </Fade>
            <Grade seed={i + 11} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/* --------------------------------- helpers --------------------------------- */

/** Soft dip to black between scenes, which reads as "storytelling", not "ad cut". */
const Fade: React.FC<{ dur: number; first?: boolean; children: React.ReactNode }> = ({ dur, first, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, first ? 1 : 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Slow drift so still scenes feel filmed. */
const Drift: React.FC<{ children: React.ReactNode; amount?: number }> = ({ children, amount = 0.05 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${1 + amount * (frame / 300)}) translateY(${-frame * 0.08}px)` }}>{children}</AbsoluteFill>;
};

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 160 } });
  return { opacity: interpolate(frame - delay, [0, 5], [0, 1], clamp), transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})` };
};

/** A generic phone body; children render on the screen. */
const PhoneBody: React.FC<{ children: React.ReactNode; top?: number; scale?: number; rotate?: number }> = ({
  children,
  top = 300,
  scale = 1,
  rotate = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 190,
      top,
      width: 700,
      height: 1420,
      borderRadius: 96,
      background: '#050506',
      border: '3px solid #2A2D35',
      boxShadow: '0 0 0 14px #121318, 0 60px 140px rgba(0,0,0,0.7)',
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      overflow: 'hidden',
    }}
  >
    <div style={{ position: 'absolute', inset: 0, borderRadius: 92, overflow: 'hidden' }}>{children}</div>
    <div style={{ position: 'absolute', top: 26, left: 255, width: 190, height: 52, borderRadius: 30, background: '#000' }} />
  </div>
);

const Check: React.FC<{ progress: number; color?: string }> = ({ progress, color = colors.lime }) => (
  <svg width={44} height={44} viewBox="0 0 44 44">
    <circle cx={22} cy={22} r={20} fill="none" stroke={color} strokeWidth={3} opacity={0.5} />
    <path d="M12 23 L19 30 L32 15" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - progress)} />
  </svg>
);

const Salad: React.FC<{ size: number }> = ({ size }) => (
  <Bowl
    size={size}
    seed={91}
    base="#4E8F3A"
    rim="#ECE6DA"
    drizzle="#F4E7C2"
    pieces={[
      { kind: 'leaf', colors: ['#7BC043', '#5FA834', '#9AD45A', '#4E9A2E'], count: 70, size: 22 },
      { kind: 'chunk', colors: ['#E9C9A0', '#DDB98C', '#F0D6B2'], count: 16, size: 20 },
      { kind: 'cube', colors: ['#E3B04B', '#D49A35'], count: 14, size: 16 },
      { kind: 'dot', colors: ['#FFF8E7', '#F7EED6'], count: 40, size: 9 },
      { kind: 'dot', colors: ['#E8483B'], count: 8, size: 16 },
    ]}
  />
);

/* ---------------------------------- scenes --------------------------------- */

const NOTE_ITEMS = ['chicken salad', 'grilled chicken + rice', 'chicken salad', 'salad, no bread', 'chicken salad again'];

const Notes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #2A2420, #0A0908 70%)' }}>
      <Drift>
        <PhoneBody top={250}>
          <div style={{ position: 'absolute', inset: 0, background: '#16130F', padding: '130px 60px', boxSizing: 'border-box' }}>
            <div style={{ color: '#E8B04B', fontSize: 30, fontWeight: 600 }}>‹ Notes</div>
            <div style={{ color: '#F3EEE6', fontSize: 58, fontWeight: 800, marginTop: 40, letterSpacing: -1 }}>eating clean</div>
            <div style={{ color: '#8C857A', fontSize: 30, marginTop: 6 }}>week 3</div>
            <div style={{ marginTop: 50, display: 'flex', flexDirection: 'column', gap: 34 }}>
              {NOTE_ITEMS.map((t, i) => {
                const d = 10 + i * 18;
                const p = interpolate(frame, [d, d + 10], [0, 1], clamp);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: interpolate(frame, [d - 6, d], [0.25, 1], clamp) }}>
                    <Check progress={p} color="#E8B04B" />
                    <span style={{ color: '#F3EEE6', fontSize: 40 }}>{t}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ color: '#8C857A', fontSize: 34, marginTop: 70, fontStyle: 'italic', opacity: interpolate(frame, [110, 125], [0, 1], clamp) }}>
              no junk. no sugar. no excuses.
            </div>
          </div>
        </PhoneBody>
      </Drift>
    </AbsoluteFill>
  );
};

const ScaleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [8, 40], [83.9, 84.6], clamp);
  const settled = frame > 42;
  const blink = settled ? 1 : 0.6 + 0.4 * Math.round((Math.sin(frame / 2) + 1) / 2);
  return (
    <AbsoluteFill>
      {/* bathroom tiles, top-down */}
      <AbsoluteFill style={{ background: '#6E6A64' }}>
        <svg width={1080} height={1920}>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 110 + 30} y1={0} x2={i * 110 + 30} y2={1920} stroke="#57534E" strokeWidth={5} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 110 + 10} x2={1080} y2={i * 110 + 10} stroke="#57534E" strokeWidth={5} />
          ))}
        </svg>
        <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,230,190,0.18), rgba(0,0,0,0.75) 75%)' }} />
      </AbsoluteFill>
      <Drift amount={0.08}>
        {/* scale */}
        <div
          style={{
            position: 'absolute',
            left: 190,
            top: 520,
            width: 700,
            height: 760,
            borderRadius: 70,
            background: 'linear-gradient(160deg, #2B2E33, #15171A)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.12)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 210,
              top: 60,
              width: 280,
              height: 120,
              borderRadius: 18,
              background: '#0B1A12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 76,
              fontWeight: 700,
              color: '#8CFFB4',
              textShadow: '0 0 18px rgba(140,255,180,0.6)',
              opacity: blink,
            }}
          >
            {value.toFixed(1)}
          </div>
        </div>
        {/* feet */}
        {[330, 600].map((x, i) => (
          <svg key={x} width={170} height={420} style={{ position: 'absolute', left: x, top: 760 }} viewBox="0 0 170 420">
            <defs>
              <linearGradient id={`foot${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#E0B08A" />
                <stop offset="1" stopColor="#A87650" />
              </linearGradient>
            </defs>
            <path d="M85 410 C 30 410, 20 300, 25 200 C 30 120, 40 60, 85 50 C 130 60, 145 120, 145 200 C 150 300, 140 410, 85 410 Z" fill={`url(#foot${i})`} transform={i ? 'scale(-1 1) translate(-170 0)' : undefined} />
            {[0, 1, 2, 3, 4].map((t) => (
              <ellipse key={t} cx={i ? 130 - t * 22 : 40 + t * 22} cy={40 - (t === 0 ? 0 : 6) + t * 4} rx={t === 0 ? 20 : 13} ry={t === 0 ? 24 : 16} fill={`url(#foot${i})`} />
            ))}
          </svg>
        ))}
      </Drift>
      <ScaleDelta at={43} />
    </AbsoluteFill>
  );
};

const ScaleDelta: React.FC<{ at: number }> = ({ at }) => {
  const style = usePop(at);
  return (
    <div style={{ position: 'absolute', top: 1400, left: 0, right: 0, textAlign: 'center', ...style }}>
      <span style={{ color: '#FF6B5B', fontSize: 64, fontWeight: 800 }}>+0.4 kg</span>
      <div style={{ color: '#CFC7BA', fontSize: 36, marginTop: 8 }}>since week 1</div>
    </div>
  );
};

type Msg = { from: 'them' | 'me'; text: string; at: number };
const MESSAGES: Msg[] = [
  { from: 'them', text: 'how many calories are you actually eating?', at: 0.8 },
  { from: 'me', text: "idk it's a salad", at: 3.2 },
  { from: 'me', text: 'like 300?', at: 5.2 },
  { from: 'them', text: 'just snap it', at: 7.8 },
  { from: 'them', text: "you're guessing bro", at: 8.6 },
];

const Chat: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #232024, #0A0908 70%)' }}>
      <Drift amount={0.04}>
        <PhoneBody top={250}>
          <div style={{ position: 'absolute', inset: 0, background: '#0E0F12', fontFamily }}>
            <div style={{ height: 230, borderBottom: '2px solid #202228', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24, boxSizing: 'border-box' }}>
              <div style={{ width: 84, height: 84, borderRadius: 42, background: '#3B6FD8', color: '#fff', fontSize: 40, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>L</div>
              <div style={{ color: '#E9EAEE', fontSize: 30, fontWeight: 600, marginTop: 10 }}>Luka</div>
            </div>
            <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {MESSAGES.map((m, i) => {
                const start = s(m.at);
                if (frame < start - (m.from === 'them' ? 20 : 0)) return null;
                const typing = m.from === 'them' && frame < start;
                return <Bubble key={i} msg={m} typing={typing} start={start} />;
              })}
            </div>
          </div>
        </PhoneBody>
      </Drift>
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ msg: Msg; typing: boolean; start: number }> = ({ msg, typing, start }) => {
  const frame = useCurrentFrame();
  const style = usePop(typing ? start - 20 : start);
  const me = msg.from === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', ...style }}>
      <div
        style={{
          maxWidth: 470,
          padding: '22px 30px',
          borderRadius: 40,
          borderBottomRightRadius: me ? 10 : 40,
          borderBottomLeftRadius: me ? 40 : 10,
          background: me ? '#3B6FD8' : '#26282E',
          color: '#F4F5F7',
          fontSize: 38,
          lineHeight: 1.25,
        }}
      >
        {typing ? (
          <div style={{ display: 'flex', gap: 10, padding: '8px 4px' }}>
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 16, height: 16, borderRadius: 8, background: '#9BA0AA', opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + d * 6) / 6)) }} />
            ))}
          </div>
        ) : (
          msg.text
        )}
      </div>
    </div>
  );
};

const BREAKDOWN: { item: string; kcal: number; hot?: boolean }[] = [
  { item: 'caesar dressing', kcal: 280, hot: true },
  { item: 'chicken breast', kcal: 160 },
  { item: 'parmesan', kcal: 150 },
  { item: 'croutons', kcal: 120 },
  { item: 'lettuce + tomato', kcal: 30 },
];

const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = interpolate(frame, [s(0.8), s(0.8) + 2, s(0.8) + 10], [0, 0.9, 0], clamp);
  const sheet = spring({ frame: frame - s(1.1), fps, config: { damping: 18, stiffness: 110 } });
  const total = Math.round(interpolate(frame, [s(1.3), s(2.4)], [0, 740], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const hot = interpolate(frame, [s(3.4), s(3.8)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: '#0A0908' }}>
      <Drift amount={0.03}>
        <PhoneBody top={250}>
          <AbsoluteFill>
            <Surface kind="desk" />
          </AbsoluteFill>
          <div style={{ position: 'absolute', left: 40, top: 180 }}>
            <Salad size={620} />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 900,
              transform: `translateY(${(1 - sheet) * 920}px)`,
              background: colors.bgElevated,
              borderTopLeftRadius: 56,
              borderTopRightRadius: 56,
              padding: '46px 60px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ color: colors.textSecondary, fontSize: 30, fontWeight: 600 }}>Chicken caesar salad</div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 6, marginBottom: 30 }}>
              <span style={{ color: colors.textPrimary, fontSize: 130, fontWeight: 800, letterSpacing: -4 }}>{total}</span>
              <span style={{ color: colors.lime, fontSize: 46, fontWeight: 700, marginLeft: 14 }}>kcal</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BREAKDOWN.map((b, i) => (
                <BreakdownRow key={b.item} {...b} delay={s(1.6) + i * 5} glow={b.hot ? hot : 0} />
              ))}
            </div>
          </div>
        </PhoneBody>
      </Drift>
    </AbsoluteFill>
  );
};

const BreakdownRow: React.FC<{ item: string; kcal: number; delay: number; glow: number }> = ({ item, kcal, delay, glow }) => {
  const style = usePop(delay);
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 26px',
        borderRadius: 24,
        background: colors.card,
        border: `2px solid ${glow ? colors.orange : colors.border}`,
        boxShadow: glow ? `0 0 ${30 * glow}px ${colors.orange}88` : undefined,
      }}
    >
      <span style={{ color: colors.textPrimary, fontSize: 34 }}>{item}</span>
      <span style={{ color: glow ? colors.orange : colors.textPrimary, fontSize: 34, fontWeight: 800 }}>{kcal}</span>
    </div>
  );
};

const Weeks: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = s(6.4);
  const t = interpolate(frame, [10, dur - 30], [0, 1], clamp);
  const week = Math.min(8, 1 + Math.floor(t * 8));
  const kg = 84.6 - t * 4.7;
  const pts = Array.from({ length: 9 }, (_, i) => {
    const w = 84.6 - (4.7 * i) / 8 + Math.sin(i * 1.7) * 0.25;
    return [80 + i * 105, 200 + (84.8 - w) * 95] as [number, number];
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #1E2420, #0A0908 70%)' }}>
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ color: '#9AA4B2', fontSize: 40, fontWeight: 600, letterSpacing: 2 }}>WEEK {week}</div>
        <div style={{ color: '#F5F7FA', fontSize: 200, fontWeight: 800, letterSpacing: -6, fontFamily: '"Inter Display", Inter' }}>
          {kg.toFixed(1)}
          <span style={{ fontSize: 70, color: '#9AA4B2', marginLeft: 12 }}>kg</span>
        </div>
      </div>
      <svg width={1080} height={700} style={{ position: 'absolute', top: 760 }}>
        <path d={d} fill="none" stroke={colors.lime} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - t)} />
        {pts.map((p, i) => (i / 8 <= t ? <circle key={i} cx={p[0]} cy={p[1]} r={12} fill={colors.lime} /> : null))}
      </svg>
      {/* meals being logged */}
      <div style={{ position: 'absolute', top: 1380, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <MealChip key={i} delay={14 + i * 14} seed={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const MealChip: React.FC<{ delay: number; seed: number }> = ({ delay, seed }) => {
  const frame = useCurrentFrame();
  const style = usePop(delay);
  const check = interpolate(frame, [delay + 4, delay + 12], [0, 1], clamp);
  if (frame < delay) return <div style={{ width: 170, height: 170 }} />;
  return (
    <div style={{ ...style, position: 'relative', width: 170, height: 170, borderRadius: 30, overflow: 'hidden', background: '#1A1A18', border: '2px solid #2B2B28' }}>
      <div style={{ position: 'absolute', left: 5, top: 5 }}>
        <Bowl
          size={160}
          seed={200 + seed * 7}
          base={['#4E8F3A', '#F4EEDC', '#C98A3A', '#F7F3EA'][seed % 4]}
          pieces={[
            { kind: 'leaf', colors: ['#7BC043', '#5FA834'], count: 25, size: 20 },
            { kind: 'chunk', colors: ['#B9773A', '#E9C9A0', '#6A4430'], count: 14, size: 22 },
            { kind: 'grain', colors: ['#FFFFFF', '#EDE5CF'], count: 30, size: 10 },
          ]}
        />
      </div>
      <div style={{ position: 'absolute', right: 6, bottom: 6, transform: 'scale(0.8)' }}>
        <Check progress={check} />
      </div>
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = interpolate(frame, [s(2.4), s(3.0)], [0, 1], clamp);
  const l2 = interpolate(frame, [s(3.5), s(4.1)], [0, 1], clamp);
  const brand = interpolate(frame, [s(5.6), s(6.4)], [0, 1], clamp);
  const serif = 'Georgia, "DejaVu Serif", serif';
  return (
    <AbsoluteFill style={{ background: '#0A0908', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginTop: -160 }}>
        <div style={{ color: '#CFC7BA', fontSize: 66, fontFamily: serif, fontStyle: 'italic', opacity: l1, transform: `translateY(${(1 - l1) * 20}px)` }}>
          it was never the food.
        </div>
        <div style={{ color: '#F5F2EC', fontSize: 78, fontFamily: serif, marginTop: 30, opacity: l2, transform: `translateY(${(1 - l2) * 20}px)` }}>
          it was the guessing.
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 300, display: 'flex', alignItems: 'center', gap: 22, opacity: brand }}>
        <Logo size={84} />
        <div style={{ color: '#F5F7FA', fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          platesnap <span style={{ color: colors.lime }}>ai</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
