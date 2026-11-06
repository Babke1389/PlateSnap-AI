import { Composition } from 'remotion';
import { PlatesnapPromo, PROMO_DURATION } from './PlatesnapPromo';
import { FullDayOfEating, FDOE_DURATION } from './fdoe/FullDayOfEating';
import { TierSlideshow, TIER_DURATION } from './tier/TierSlideshow';
import { TricepsGuide, TRICEPS_DURATION } from './triceps/TricepsGuide';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PlatesnapPromo"
      component={PlatesnapPromo}
      durationInFrames={PROMO_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="FullDayOfEating"
      component={FullDayOfEating}
      durationInFrames={FDOE_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="BicepsTierList"
      component={TierSlideshow}
      durationInFrames={TIER_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="TricepsGuide"
      component={TricepsGuide}
      durationInFrames={TRICEPS_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
