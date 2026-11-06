import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fontFamily } from '../theme';
import { Soundtrack, VoiceLine } from '../Soundtrack';
import { MiniToday } from '../tier/TierSlideshow';
import {
  BODY_DEFS,
  Bench,
  CableStack,
  Capsule,
  Head,
  KneelingFigure,
  Pt,
  StandingFigure,
  Studio,
  at,
  kneelingJoints,
  MAX_BEND,
  UPPER_ARM,
  pushdownJoints,
} from './Mannequin';

/*
 * 3D-anatomy-style exercise explainer: kneeling overhead cable triceps extension.
 * The middle beat is a PlateSnap AI "cutting or bulking?" insert.
 */

const SCENES = [
  { id: 'close', duration: 105 },
  { id: 'setup', duration: 120 },
  { id: 'pushdown', duration: 135 },
  { id: 'platesnap', duration: 150 },
  { id: 'demo', duration: 150 },
  { id: 'wide', duration: 150 },
] as const;

const starts = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].duration);
  return acc;
}, []);
// Male narrator (Kokoro am_michael, `python scripts/narration.py am_michael public/audio triceps`).
const NARRATION: VoiceLine[] = [
  { file: 'audio/tri-vo1.wav', at: 0.15, dur: 3.18 }, // This is the triceps exercise most people skip.
  { file: 'audio/tri-vo2.wav', at: 3.65, dur: 3.84 }, // Kneel behind a flat bench...
  { file: 'audio/tri-vo3.wav', at: 7.6, dur: 4.01 }, // Pushdowns only give you a short stretch...
  { file: 'audio/tri-vo4.wav', at: 12.15, dur: 4.65 }, // Cutting or bulking? ... PlateSnap AI.
  { file: 'audio/tri-vo5.wav', at: 17.15, dur: 3.43 }, // Let the weight stretch you...
  { file: 'audio/tri-vo6.wav', at: 21.7, dur: 5.1 }, // Set the cable low...
];

export const TRICEPS_DURATION = starts[starts.length - 1] + SCENES[SCENES.length - 1].duration;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const rep = (frame: number, period = 60) => 0.5 - 0.5 * Math.cos((2 * Math.PI * frame) / period);

export const TricepsGuide: React.FC = () => {
  const map: Record<(typeof SCENES)[number]['id'], React.FC> = {
    close: Close,
    setup: Setup,
    pushdown: Pushdown,
    platesnap: PlateSnapInsert,
    demo: Demo,
    wide: Wide,
  };
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: '#0A1A55' }}>
      <Soundtrack totalFrames={TRICEPS_DURATION} music="audio/triceps-music.wav" lines={NARRATION} full={0.75} ducked={0.22} />
      {SCENES.map((s, i) => {
        const C = map[s.id];
        return (
          <Sequence key={s.id} from={starts[i]} durationInFrames={s.duration} name={s.id}>
            <Flash />
            <C />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/* --------------------------------- helpers --------------------------------- */

/** Full-frame SVG stage with a camera that scales around a focus point. */
const Stage: React.FC<{ focus: Pt; scale: number; children: React.ReactNode }> = ({ focus, scale, children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <BODY_DEFS />
    <g transform={`translate(540 960) scale(${scale}) translate(${-focus[0]} ${-focus[1]})`}>
      <Studio />
      {children}
    </g>
    <rect width={1080} height={1920} fill="url(#vig)" />
    <defs>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.55" />
      </radialGradient>
    </defs>
  </svg>
);

/** Quick white flash on every cut, like the reference's punchy transitions. */
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.35, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: '#fff', opacity: o, zIndex: 10, pointerEvents: 'none' }} />;
};

const Caption: React.FC<{ children: React.ReactNode; top?: number; delay?: number; color?: string }> = ({
  children,
  top = 230,
  delay = 0,
  color = '#fff',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  if (frame < delay) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        color,
        fontSize: 56,
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: -1,
        textShadow: '0 3px 12px rgba(0,0,0,0.55)',
        transform: `translateY(${(1 - s) * 30}px)`,
        opacity: s,
        zIndex: 5,
      }}
    >
      {children}
    </div>
  );
};

const Arrow: React.FC<{ x: number; y: number; color: string; dir: 'down' | 'left'; pulse: number }> = ({ x, y, color, dir, pulse }) => (
  <g transform={`translate(${x} ${y}) rotate(${dir === 'left' ? 90 : 0}) scale(${1 + pulse * 0.08})`}>
    <circle r={90} fill={color} opacity={0.35} filter="url(#mq-glow)" />
    <path d="M0 -60 L0 40 M-38 4 L0 44 L38 4" stroke="#fff" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

/** Dashed range-of-motion arc for the forearm around the elbow. */
const RomArc: React.FC<{ elbow: Pt; r: number; from: number; to: number; color: string; dash: number; opacity?: number }> = ({
  elbow,
  r,
  from,
  to,
  color,
  dash,
  opacity = 1,
}) => {
  const pts = Array.from({ length: 33 }, (_, i) => at(elbow, from + ((to - from) * i) / 32, r));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <g opacity={opacity} fill="none" strokeLinecap="round">
      <path d={d} stroke={color} strokeWidth={14} opacity={0.4} filter="url(#mq-glow)" />
      <path d={d} stroke={color} strokeWidth={7} strokeDasharray="22 16" strokeDashoffset={-dash} />
    </g>
  );
};

const CableLine: React.FC<{ from: Pt; to: Pt }> = ({ from, to }) => (
  <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="#11131C" strokeWidth={5} />
);

const PULLEY: Pt = [977, 1225];

/* ---------------------------------- scenes --------------------------------- */

const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const bend = 0.25 + 0.6 * rep(frame, 70);
  const j = kneelingJoints(bend);
  const zoom = interpolate(frame, [0, 105], [2.5, 2.2]);
  const tri = interpolate(frame, [25, 45], [0, 1], clamp) * (0.75 + 0.25 * Math.sin(frame / 4));
  return (
    <AbsoluteFill>
      <Stage focus={[j.shoulder[0] - 70, j.shoulder[1] - 40]} scale={zoom}>
        <Bench />
        <CableLine from={j.hand} to={PULLEY} />
        <KneelingFigure bend={bend} triceps={tri} />
      </Stage>
      <Caption>
        the triceps exercise
        <br />
        <span style={{ color: '#FF4A4A' }}>most people skip</span>
      </Caption>
    </AbsoluteFill>
  );
};

const Setup: React.FC = () => {
  const frame = useCurrentFrame();
  const bend = 0.5;
  const j = kneelingJoints(bend);
  const glow = interpolate(frame, [15, 30], [0, 1], clamp) * (0.7 + 0.3 * Math.sin(frame / 5));
  return (
    <AbsoluteFill>
      <Stage focus={[560, 1080]} scale={interpolate(frame, [0, 120], [1.0, 1.08])}>
        <Bench glow={glow} />
        <CableStack x={960} pulleyY={PULLEY[1]} />
        <CableLine from={j.hand} to={PULLEY} />
        <KneelingFigure bend={bend} />
      </Stage>
      <Caption>
        kneel behind a flat bench,
        <br />
        <span style={{ color: '#2BFF7A' }}>elbows on the pad</span>
      </Caption>
    </AbsoluteFill>
  );
};

const Pushdown: React.FC = () => {
  const frame = useCurrentFrame();
  const push = rep(frame, 54);
  const j = pushdownJoints(push);
  const good = frame >= 70;
  const pulse = Math.sin(frame / 4);
  return (
    <AbsoluteFill>
      <Stage focus={[440, 980]} scale={1.25}>
        <CableStack x={150} pulleyY={300} />
        <CableLine from={j.hand} to={[167, 300]} />
        <StandingFigure push={push} triceps={good ? 0 : 0.9} />
        <Arrow x={j.hand[0] - 10} y={j.hand[1] - 150} color={good ? '#2BFF7A' : '#FF2A2A'} dir="down" pulse={pulse} />
      </Stage>
      {good ? (
        <Caption key="g">
          go overhead instead:
          <br />
          <span style={{ color: '#2BFF7A' }}>long head fully stretched</span>
        </Caption>
      ) : (
        <Caption key="r">
          pushdowns only:
          <br />
          <span style={{ color: '#FF4A4A' }}>short stretch, less growth</span>
        </Caption>
      )}
    </AbsoluteFill>
  );
};

const PlateSnapInsert: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const second = frame >= 70;
  const phone = spring({ frame: frame - 70, fps, config: { damping: 15 } });
  const bust = spring({ frame, fps, config: { damping: 14 } });
  const words1 = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const words2 = spring({ frame: frame - 76, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <BODY_DEFS />
        <Studio />
        <rect width={1080} height={1920} fill="#061036" opacity={0.35} />
        <circle cx={540} cy={1080} r={420} fill="#2BFF7A" opacity={0.12} filter="url(#mq-glow)" />
        <g transform={`translate(0 ${(1 - bust) * 500}) translate(540 1300) scale(${second ? 0.92 : 1}) translate(-540 -1300)`}>
          <Bust />
        </g>
      </svg>
      {!second ? (
        <div style={{ position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.6 + 0.4 * words1})`, opacity: words1 }}>
          <BigWord color="#fff" size={150}>CUTTING</BigWord>
          <BigWord color="#2F6BFF" size={150} outline>
            OR BULKING?
          </BigWord>
        </div>
      ) : (
        <>
          <div style={{ position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.6 + 0.4 * words2})`, opacity: words2 }}>
            <BigWord color="#fff" size={104}>TRACK EVERY MACRO</BigWord>
            <BigWord color={colors.lime} size={140} outline>
              PLATESNAP AI
            </BigWord>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 690,
              width: 480,
              height: 960,
              borderRadius: 64,
              background: '#0B0B0E',
              border: '6px solid #2E3036',
              boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 80px ${colors.lime}33`,
              overflow: 'hidden',
              transform: `translateY(${(1 - phone) * 1300}px) rotate(${(1 - phone) * 8 - 2}deg)`,
            }}
          >
            <div style={{ position: 'absolute', inset: 10, borderRadius: 56, overflow: 'hidden' }}>
              <MiniToday />
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/** Heavy condensed headline word, like fitness-explainer title cards. */
const BigWord: React.FC<{ children: string; color: string; size: number; outline?: boolean }> = ({ children, color, size, outline }) => (
  <div
    style={{
      fontFamily: '"Inter Display", Inter, sans-serif',
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: -2,
      color,
      transform: 'scaleX(0.82)',
      fontStyle: 'italic',
      WebkitTextStroke: outline ? '5px #fff' : undefined,
      paintOrder: 'stroke fill',
      textShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}
  >
    {children}
  </div>
);

/** Front-facing muscular mannequin bust with arms crossed. */
const Bust: React.FC = () => {
  const cx = 540;
  return (
    <g>
      {/* torso */}
      <path
        d={`M${cx - 260} 1180 C ${cx - 300} 1300, ${cx - 220} 1600, ${cx - 160} 1920 L ${cx + 160} 1920 C ${cx + 220} 1600, ${cx + 300} 1300, ${cx + 260} 1180 C ${cx + 120} 1120, ${cx - 120} 1120, ${cx - 260} 1180 Z`}
        fill="url(#mq-body)"
      />
      {/* pecs */}
      <path d={`M${cx - 230} 1220 Q ${cx - 120} 1170 ${cx - 6} 1210 L ${cx - 6} 1380 Q ${cx - 130} 1420 ${cx - 225} 1360 Z`} fill="url(#mq-body)" stroke="#8C9AB3" strokeWidth={4} />
      <path d={`M${cx + 230} 1220 Q ${cx + 120} 1170 ${cx + 6} 1210 L ${cx + 6} 1380 Q ${cx + 130} 1420 ${cx + 225} 1360 Z`} fill="url(#mq-body)" stroke="#8C9AB3" strokeWidth={4} />
      {/* abs */}
      {[1450, 1560, 1670, 1780].map((y) => (
        <g key={y}>
          <rect x={cx - 110} y={y} width={100} height={90} rx={34} fill="url(#mq-body)" stroke="#8C9AB3" strokeWidth={4} />
          <rect x={cx + 10} y={y} width={100} height={90} rx={34} fill="url(#mq-body)" stroke="#8C9AB3" strokeWidth={4} />
        </g>
      ))}
      {/* traps + neck + head */}
      <path d={`M${cx - 150} 1180 Q ${cx} 1050 ${cx + 150} 1180 Z`} fill="url(#mq-body)" />
      <Capsule a={[cx, 1140]} b={[cx, 1040]} w={120} />
      <Head c={[cx, 930]} r={120} />
      {/* shoulders */}
      <circle cx={cx - 290} cy={1230} r={110} fill="url(#mq-body)" />
      <circle cx={cx + 290} cy={1230} r={110} fill="url(#mq-body)" />
      {/* crossed arms */}
      <Capsule a={[cx - 320, 1260]} b={[cx - 330, 1480]} w={130} />
      <Capsule a={[cx + 320, 1260]} b={[cx + 330, 1480]} w={130} />
      <Capsule a={[cx - 330, 1500]} b={[cx + 200, 1420]} w={110} />
      <Capsule a={[cx + 330, 1500]} b={[cx - 200, 1440]} w={110} />
    </g>
  );
};

const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const bend = rep(frame, 60);
  const j = kneelingJoints(bend);
  const dash = frame * 3;
  const glow = interpolate(frame, [10, 25], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Stage focus={[440, 1050]} scale={1.55}>
        <Bench glow={0.6 * glow} />
        <CableLine from={j.hand} to={PULLEY} />
        <KneelingFigure bend={bend} green={glow} />
        <RomArc elbow={j.elbow} r={150} from={UPPER_ARM} to={UPPER_ARM + MAX_BEND} color="#2BFF7A" dash={dash} opacity={glow} />
      </Stage>
      <Caption>
        stretch deep behind your head,
        <br />
        <span style={{ color: '#2BFF7A' }}>then lock out</span>
      </Caption>
    </AbsoluteFill>
  );
};

const Wide: React.FC = () => {
  const frame = useCurrentFrame();
  const bend = rep(frame, 60);
  const j = kneelingJoints(bend);
  const ring = interpolate(frame, [0, 15, 55, 65], [0, 1, 1, 0], clamp);
  const reps = interpolate(frame, [55, 70], [0, 1], clamp);
  const tri = reps * (0.6 + 0.4 * bend);
  return (
    <AbsoluteFill>
      <Stage focus={[600, 1060]} scale={interpolate(frame, [0, 150], [1.05, 1.15])}>
        <Bench />
        <CableStack x={960} pulleyY={PULLEY[1]} />
        <CableLine from={j.hand} to={PULLEY} />
        <KneelingFigure bend={bend} triceps={tri} />
        <g opacity={ring}>
          <circle cx={PULLEY[0]} cy={PULLEY[1]} r={70} fill="none" stroke="#2BFF7A" strokeWidth={8} />
          <circle cx={PULLEY[0]} cy={PULLEY[1]} r={70} fill="none" stroke="#2BFF7A" strokeWidth={20} opacity={0.4} filter="url(#mq-glow)" />
        </g>
        <RomArc elbow={j.elbow} r={150} from={UPPER_ARM} to={UPPER_ARM + MAX_BEND} color="#5EA0FF" dash={frame * 3} opacity={reps} />
      </Stage>
      {frame < 60 ? (
        <Caption key="a">
          set the cable <span style={{ color: '#2BFF7A' }}>low</span>
        </Caption>
      ) : (
        <Caption key="b">
          3 × 10–12 reps
          <br />
          <span style={{ color: '#5EA0FF' }}>slow on the way down</span>
        </Caption>
      )}
    </AbsoluteFill>
  );
};
