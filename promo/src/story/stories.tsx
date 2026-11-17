import React from 'react';
import { Bowl } from '../fdoe/foods';
import { StoryConfig, makeStory } from './StoryKit';

/* --------------------------------- props ---------------------------------- */

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

/** Two fried eggs and two slices of toast on a plate, top-down. */
const EggsOnToast: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 400 400">
    <circle cx="200" cy="212" r="190" fill="rgba(0,0,0,0.35)" />
    <circle cx="200" cy="200" r="190" fill="#F1EEE8" />
    <circle cx="200" cy="200" r="150" fill="none" stroke="#DCD7CE" strokeWidth="3" />
    {[
      [140, 255, -12],
      [255, 285, 10],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`rotate(${r} ${x} ${y})`}>
        <rect x={x - 70} y={y - 62} width={140} height={124} rx={26} fill="#B9772F" />
        <rect x={x - 58} y={y - 50} width={116} height={100} rx={18} fill="#E9B868" />
        <rect x={x - 58} y={y - 50} width={116} height={100} rx={18} fill="none" stroke="#D29A48" strokeWidth={3} strokeDasharray="4 10" />
      </g>
    ))}
    {[
      [165, 140],
      [265, 175],
    ].map(([x, y], i) => (
      <g key={i}>
        <path
          d={`M${x - 60} ${y} C ${x - 70} ${y - 50}, ${x - 10} ${y - 72}, ${x + 30} ${y - 58} C ${x + 72} ${y - 40}, ${x + 70} ${y + 20}, ${x + 40} ${y + 48} C ${x} ${y + 72}, ${x - 52} ${y + 48}, ${x - 60} ${y} Z`}
          fill="#FFFDF7"
        />
        <circle cx={x + 4} cy={y - 4} r={26} fill="#F6A21E" />
        <circle cx={x - 4} cy={y - 12} r={8} fill="#FFD27A" />
      </g>
    ))}
  </svg>
);

/* --------------------------------- stories --------------------------------- */

/** Cutting: "it was never the food, it was the guessing". */
const GUESSING: StoryConfig = {
  duration: 31,
  music: 'audio/story-music.wav',
  // Kokoro am_michael at 1.12x, silence-trimmed: `python scripts/narration.py am_michael public/audio story`
  narration: [
    { file: 'audio/story-vo1.wav', at: 0.2, dur: 3.23, text: 'Three weeks of eating clean. Salads, chicken, no junk.' },
    { file: 'audio/story-vo2.wav', at: 3.7, dur: 1.06, text: 'And the scale went up.' },
    {
      file: 'audio/story-vo3.wav',
      at: 5.7,
      dur: 6.27,
      text: "My friend asked how many calories I was eating. I said, I don't know. It's a salad. Like, three hundred?",
    },
    { file: 'audio/story-vo4.wav', at: 12.2, dur: 1.4, text: 'He told me to just snap it.' },
    { file: 'audio/story-vo5.wav', at: 14.4, dur: 5.15, text: 'Seven hundred and forty. The dressing alone was more than I thought the whole salad was.' },
    { file: 'audio/story-vo6.wav', at: 19.8, dur: 5.01, text: 'So I kept eating the same stuff. Just less dressing, and a photo before every meal.' },
    { file: 'audio/story-vo7.wav', at: 25.2, dur: 4.54, text: 'Eight weeks later, I finally get it. It was never the food. It was the guessing.' },
  ],
  scenes: [
    { id: 'notes', from: 0, to: 3.6 },
    { id: 'scale', from: 3.6, to: 5.6 },
    { id: 'chat', from: 5.6, to: 13.6 },
    { id: 'scan', from: 13.6, to: 19.6 },
    { id: 'weeks', from: 19.6, to: 25 },
    { id: 'end', from: 25, to: 31 },
  ],
  notes: {
    title: 'eating clean',
    subtitle: 'week 3',
    items: ['chicken salad', 'grilled chicken + rice', 'chicken salad', 'salad, no bread', 'chicken salad again'],
    footer: 'no junk. no sugar. no excuses.',
  },
  scale: { from: 83.9, to: 84.6, delta: '+0.4 kg', deltaLabel: 'since week 1' },
  chat: {
    name: 'Luka',
    messages: [
      { from: 'them', text: 'how many calories are you actually eating?', at: 0.7 },
      { from: 'me', text: "idk it's a salad", at: 3.3 },
      { from: 'me', text: 'like 300?', at: 5.0 },
      { from: 'them', text: 'just snap it', at: 6.6 },
      { from: 'them', text: "you're guessing bro", at: 7.3 },
    ],
  },
  scan: {
    dish: 'Chicken caesar salad',
    food: <Salad size={620} />,
    total: 740,
    shutterAt: 0.4,
    hotAt: 2.4,
    breakdown: [
      { item: 'caesar dressing', kcal: 280, hot: true },
      { item: 'chicken breast', kcal: 160 },
      { item: 'parmesan', kcal: 150 },
      { item: 'croutons', kcal: 120 },
      { item: 'lettuce + tomato', kcal: 30 },
    ],
  },
  weeks: { from: 84.6, to: 79.9, count: 8 },
  end: { line1: 'it was never the food.', line2: 'it was the guessing.', l1At: 2.2, l2At: 3.4, brandAt: 4.7 },
};

/** Bulking: "I wasn't a hardgainer, I was a hard guesser". */
const HARDGAINER: StoryConfig = {
  duration: 33,
  music: 'audio/bulk-music.wav',
  // Kokoro am_michael at 1.12x, silence-trimmed: `python scripts/narration.py am_michael public/audio bulk`
  narration: [
    { file: 'audio/bulk-vo1.wav', at: 0.2, dur: 3.76, text: 'Six months of eating a lot. Three meals a day, sometimes four.' },
    { file: 'audio/bulk-vo2.wav', at: 4.3, dur: 1.5, text: 'Still sixty-five kilos.' },
    {
      file: 'audio/bulk-vo3.wav',
      at: 6.3,
      dur: 6.33,
      text: "My gym partner asked what I actually eat. I said, I don't know, a lot? Like, three thousand calories?",
    },
    { file: 'audio/bulk-vo4.wav', at: 12.9, dur: 1.96, text: 'He said, snap every meal for a week.' },
    { file: 'audio/bulk-vo5.wav', at: 15.5, dur: 5.38, text: 'Nineteen hundred. On my biggest day. My breakfast was three hundred and forty calories.' },
    { file: 'audio/bulk-vo6.wav', at: 21.4, dur: 4.97, text: "So I didn't change much. Bigger breakfast, a shake, and a photo before every meal." },
    { file: 'audio/bulk-vo7.wav', at: 27.0, dur: 4.63, text: "Plus five kilos in ten weeks. I wasn't a hardgainer. I was a hard guesser." },
  ],
  scenes: [
    { id: 'notes', from: 0, to: 4.2 },
    { id: 'scale', from: 4.2, to: 6.2 },
    { id: 'chat', from: 6.2, to: 15.1 },
    { id: 'scan', from: 15.1, to: 21.3 },
    { id: 'weeks', from: 21.3, to: 26.8 },
    { id: 'end', from: 26.8, to: 33 },
  ],
  notes: {
    title: 'bulking',
    subtitle: 'month 6',
    items: ['eggs + toast', 'chicken + rice', 'pasta, big plate', 'protein bar', 'late snack'],
    footer: 'eat big. lift big.',
  },
  scale: { from: 65.3, to: 65.0, delta: '+0.0 kg', deltaLabel: 'since month 1' },
  chat: {
    name: 'Marko',
    messages: [
      { from: 'them', text: 'what do you actually eat in a day?', at: 0.6 },
      { from: 'me', text: 'a lot bro', at: 3.0 },
      { from: 'me', text: 'like 3000?', at: 4.6 },
      { from: 'them', text: 'snap every meal this week', at: 6.8 },
      { from: 'them', text: 'then we talk', at: 7.6 },
    ],
  },
  scan: {
    dish: 'Eggs on toast',
    food: <EggsOnToast size={620} />,
    total: 340,
    banner: { text: 'biggest day so far: 1,890 kcal', at: 0.3 },
    shutterAt: 2.3,
    hotAt: 3.4,
    breakdown: [
      { item: 'white toast, 2 slices', kcal: 160, hot: true },
      { item: '2 fried eggs', kcal: 140 },
      { item: 'butter', kcal: 40 },
    ],
  },
  weeks: { from: 65.0, to: 70.0, count: 10 },
  end: { line1: "i wasn't a hardgainer.", line2: 'i was a hard guesser.', l1At: 2.3, l2At: 3.5, brandAt: 4.9 },
};

export const GuessingStory = makeStory(GUESSING);
export const GUESSING_DURATION = Math.round(GUESSING.duration * 30);
export const HardgainerStory = makeStory(HARDGAINER);
export const HARDGAINER_DURATION = Math.round(HARDGAINER.duration * 30);
