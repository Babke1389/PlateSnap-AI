import { Composition } from 'remotion';
import { PlatesnapPromo, PROMO_DURATION } from './PlatesnapPromo';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PlatesnapPromo"
    component={PlatesnapPromo}
    durationInFrames={PROMO_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
